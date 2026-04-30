const PRIVATE_KEY = Deno.env.get('PAYWAY_PRIVATE_KEY') ?? ''
const SITE_URL    = Deno.env.get('SITE_URL')            ?? 'https://fanaticadelcalzado.com.ar'
const IS_TEST     = Deno.env.get('PAYWAY_TEST_MODE')    !== 'false'

const PAYWAY_API = IS_TEST
  ? 'https://developers.decidir.com/api/v2'
  : 'https://ventasonline.payway.com.ar/api/v2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items, total, cliente, token, bin, payment_method_id } = await req.json()

    if (!items?.length || !total || !cliente?.nombre || !cliente?.email || !token) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const siteTransactionId = `ORD-${Date.now()}`
    // Decidir: los últimos 2 dígitos son centavos. $43.500 ARS = 4350000
    const amount = Math.round(total * 100)

    const body = {
      site_transaction_id: siteTransactionId,
      token,
      payment_method_id:   payment_method_id ?? 1,
      bin:                 bin ?? '',
      amount,
      currency:            'ARS',
      installments:        1,
      payment_type:        'single',
      sub_payments:        [],
      customer: {
        id:    cliente.email,
        email: cliente.email,
      },
    }

    const response = await fetch(`${PAYWAY_API}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': PRIVATE_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PayWay API error:', JSON.stringify(data))
      throw new Error(data?.error_message ?? JSON.stringify(data))
    }

    const aprobado = data.status === 'approved'
    const mensaje  = aprobado
      ? 'Pago aprobado'
      : (data.status === 'rejected'
          ? 'Pago rechazado por el banco'
          : `Estado: ${data.status}`)

    console.log(`Pago ${data.status} — orden ${siteTransactionId} — monto ${amount}`)

    return new Response(
      JSON.stringify({ aprobado, mensaje, orderId: siteTransactionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('payway-checkout error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
