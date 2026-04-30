import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

// ── Credenciales PayWay (secrets de Supabase) ──
const PRIVATE_KEY = Deno.env.get('PAYWAY_PRIVATE_KEY') ?? ''
const SITE_URL    = Deno.env.get('SITE_URL')            ?? 'http://localhost:5173'
const IS_TEST     = Deno.env.get('PAYWAY_TEST_MODE')    !== 'false'

// Terminales E-Commerce por marca (secrets de Supabase)
const TERMINALES: Record<string, string> = {
  visa:       Deno.env.get('PAYWAY_TERMINAL_VISA')       ?? '',
  mastercard: Deno.env.get('PAYWAY_TERMINAL_MASTERCARD') ?? '',
  amex:       Deno.env.get('PAYWAY_TERMINAL_AMEX')       ?? '',
  cabal:      Deno.env.get('PAYWAY_TERMINAL_CABAL')      ?? '',
  diners:     Deno.env.get('PAYWAY_TERMINAL_DINERS')     ?? '',
}

const PAYWAY_URL = IS_TEST
  ? 'https://cs-test.payway.com.ar/cs/sandbox/decision'
  : 'https://decision.payway.com.ar/decision/'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function generarHash(campos: string[]): Promise<string> {
  const buffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(campos.join('#')))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function toCentavos(monto: number): string {
  return Math.round(monto * 100).toString()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items, total, cliente, marca } = await req.json()

    if (!items?.length || !total || !cliente?.nombre || !cliente?.email) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Seleccionar terminal según la marca elegida (default: visa)
    const marcaKey = (marca ?? 'visa').toLowerCase()
    const terminal = TERMINALES[marcaKey] || TERMINALES.visa

    const nroOperacion = `ORD-${Date.now()}`
    const montoStr     = toCentavos(total)
    const tasa         = '0.00'
    const urlOk        = `${SITE_URL}/pago-exitoso`
    const urlError     = `${SITE_URL}/pago-fallido`

    const hash = await generarHash([PRIVATE_KEY, terminal, nroOperacion, montoStr, tasa, urlOk, urlError])

    const fields: Record<string, string> = {
      cs_empresa:             terminal,
      cs_medio_pago:          'tarjeta',
      cs_nro_operacion:       nroOperacion,
      cs_monto:               montoStr,
      cs_descuento:           '0',
      cs_tasa_financiamiento: tasa,
      cs_cuotas:              '01',
      cs_url_ok:              urlOk,
      cs_url_error:           urlError,
      cs_detalle_productos:   items.length.toString(),
      cs_codigo_seguridad:    hash,
      cs_nombre_comprador:    cliente.nombre,
      cs_email_comprador:     cliente.email,
      cs_telefono_comprador:  cliente.telefono ?? '',
    }

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
      JSON.stringify({ error: 'Error interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
