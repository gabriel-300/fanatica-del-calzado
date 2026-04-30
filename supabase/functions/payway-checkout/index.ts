const PRIVATE_KEY = Deno.env.get('PAYWAY_PRIVATE_KEY') ?? ''
const PUBLIC_KEY  = Deno.env.get('PAYWAY_PUBLIC_KEY')  ?? ''
const SITE_ID     = Deno.env.get('PAYWAY_SITE_ID')     ?? ''
const TEMPLATE_ID = Deno.env.get('PAYWAY_TEMPLATE_ID') ?? ''
const SITE_URL    = Deno.env.get('SITE_URL')            ?? 'http://localhost:5173'
const IS_TEST     = Deno.env.get('PAYWAY_TEST_MODE')    !== 'false'

const PAYWAY_API = IS_TEST
  ? 'https://developers.decidir.com/api/v2'
  : 'https://ventasonline.payway.com.ar/api/v2'

const CHECKOUT_BASE = IS_TEST
  ? 'https://developers.decidir.com/web/checkout'
  : 'https://live.decidir.com/web/checkout'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items, total, cliente } = await req.json()

    if (!items?.length || !total || !cliente?.nombre || !cliente?.email) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const siteTransactionId = `ORD-${Date.now()}`
    // PayWay: los últimos 2 dígitos son decimales. $43.500 ARS = 4350000
    const amount = Math.round(total * 100)

    const body = {
      site: {
        id: SITE_ID,
        template_id: TEMPLATE_ID,
      },
      public_apikey: PUBLIC_KEY,
      site_transaction_id: siteTransactionId,
      total_price: amount,
      currency: 'ARS',
      success_url: `${SITE_URL}/pago-exitoso`,
      cancel_url:  `${SITE_URL}/pago-fallido`,
      origin_platform: 'Web',
      installments: [{ quantity: 1, rate: 0, description: '1 pago' }],
      customer: {
        id:    cliente.email,
        email: cliente.email,
      },
      products: items.map((item: { nombre: string; talle: string; cantidad: number; precio: number }) => ({
        description: `${item.nombre} T.${item.talle}`,
        quantity:    item.cantidad,
        unit_price:  Math.round(item.precio * 100),
      })),
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

    const paymentLink = data.payment_link ?? `${CHECKOUT_BASE}/${data.id}`

    return new Response(
      JSON.stringify({ paymentLink }),
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
