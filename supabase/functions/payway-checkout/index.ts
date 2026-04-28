import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

// ── Credenciales PayWay (configuradas como secrets de Supabase) ──
const PRIVATE_KEY  = Deno.env.get('PAYWAY_PRIVATE_KEY')  ?? ''
const PUBLIC_KEY   = Deno.env.get('PAYWAY_PUBLIC_KEY')   ?? ''
const MERCHANT     = Deno.env.get('PAYWAY_MERCHANT')      ?? ''
const SITE_URL     = Deno.env.get('SITE_URL')             ?? 'http://localhost:5173'

// PayWay CS – endpoints
const PAYWAY_URL_TEST = 'https://cs-test.payway.com.ar/cs/sandbox/decision'
const PAYWAY_URL_PROD = 'https://decision.payway.com.ar/decision/'
const IS_TEST = Deno.env.get('PAYWAY_TEST_MODE') !== 'false'
const PAYWAY_URL = IS_TEST ? PAYWAY_URL_TEST : PAYWAY_URL_PROD

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Genera el hash de seguridad requerido por PayWay CS
// Fórmula: MD5( privateKey # empresa # nroOperacion # monto # tasa # urlOk # urlError )
async function generarHash(campos: string[]): Promise<string> {
  const texto  = campos.join('#')
  const buffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(texto))
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Convierte pesos a centavos (PayWay espera entero sin comas)
function toCentavos(monto: number): string {
  return Math.round(monto * 100).toString()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { items, total, cliente } = body

    if (!items?.length || !total || !cliente?.nombre || !cliente?.email) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Número de operación único
    const nroOperacion = `ORD-${Date.now()}`

    const montoStr = toCentavos(total)
    const tasa     = '0.00'
    const urlOk    = `${SITE_URL}/pago-exitoso`
    const urlError = `${SITE_URL}/pago-fallido`

    // Hash de seguridad PayWay CS
    const hash = await generarHash([
      PRIVATE_KEY,
      MERCHANT,
      nroOperacion,
      montoStr,
      tasa,
      urlOk,
      urlError,
    ])

    // Campos del formulario PayWay CS
    const fields: Record<string, string> = {
      cs_empresa:              MERCHANT,
      cs_medio_pago:           'tarjeta',
      cs_nro_operacion:        nroOperacion,
      cs_monto:                montoStr,
      cs_descuento:            '0',
      cs_tasa_financiamiento:  tasa,
      cs_cuotas:               '01',
      cs_url_ok:               urlOk,
      cs_url_error:            urlError,
      cs_detalle_productos:    items.length.toString(),
      cs_codigo_seguridad:     hash,
      // Datos del cliente
      cs_nombre_comprador:     cliente.nombre,
      cs_email_comprador:      cliente.email,
      cs_telefono_comprador:   cliente.telefono ?? '',
    }

    // Detalle de cada producto
    items.forEach((item: { nombre: string; talle: string; cantidad: number; precio: number }, i: number) => {
      const n = i + 1
      fields[`cs_detalle_descripcion_${n}`] = `${item.nombre} T.${item.talle}`
      fields[`cs_detalle_cantidad_${n}`]    = item.cantidad.toString()
      fields[`cs_detalle_precio_${n}`]      = toCentavos(item.precio)
    })

    return new Response(
      JSON.stringify({ url: PAYWAY_URL, fields }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('payway-checkout error:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
