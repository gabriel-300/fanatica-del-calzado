import { useState, useEffect, useRef } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const IS_TEST      = import.meta.env.VITE_PAYWAY_TEST_MODE !== 'false'
// Tokenización frontend: sandbox=developers.decidir.com, prod=live.decidir.com
const DECIDIR_API  = IS_TEST
  ? 'https://developers.decidir.com/api/v2'
  : 'https://live.decidir.com/api/v2'
const DECIDIR_JS   = 'https://live.decidir.com/static/v2.6.4/decidir.js'
const PUBLIC_KEY   = import.meta.env.VITE_PAYWAY_PUBLIC_KEY ?? ''

const TARJETAS = [
  { label: 'Visa Crédito',       id: 1  },
  { label: 'Mastercard Crédito', id: 15 },
  { label: 'AMEX',               id: 30 },
  { label: 'Cabal Crédito',      id: 28 },
  { label: 'Naranja',            id: 24 },
  { label: 'Visa Débito',        id: 6  },
  { label: 'Mastercard Débito',  id: 23 },
]

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

export default function ModalCheckout({ onCerrar }) {
  const { items, total, vaciar } = useCarrito()
  const [nombre, setNombre]         = useState('')
  const [email, setEmail]           = useState('')
  const [telefono, setTelefono]     = useState('')
  const [tarjetaId, setTarjetaId]   = useState(1)
  const [procesando, setProcesando] = useState(false)
  const [sdkListo, setSdkListo]     = useState(false)
  const decidirRef = useRef(null)
  const formRef    = useRef(null)

  useEffect(() => {
    if (window.Decidir) { initSDK(); return }
    if (document.querySelector(`script[src="${DECIDIR_JS}"]`)) return
    const s = document.createElement('script')
    s.src = DECIDIR_JS
    s.async = true
    s.onload = initSDK
    document.body.appendChild(s)
  }, [])

  function initSDK() {
    decidirRef.current = new window.Decidir(DECIDIR_API)
    decidirRef.current.setPublishableKey(PUBLIC_KEY)
    decidirRef.current.setTimeout(5000)
    setSdkListo(true)
  }

  const handlePagar = (e) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) {
      toast.error('Completá nombre y email para continuar')
      return
    }
    if (!sdkListo) {
      toast.error('Sistema de pago cargando, intentá de nuevo')
      return
    }
    setProcesando(true)

    decidirRef.current.createToken(formRef.current, async (status, response) => {
      if (status !== 200 && status !== 201) {
        console.error('Decidir token error status:', status)
        console.error('Decidir token error response:', JSON.stringify(response))
        const errores = Array.isArray(response?.error) ? response.error : null
        const msg = errores?.[0]?.message ?? errores?.[0]?.description ?? response?.message ?? 'Verificá los datos de la tarjeta'
        toast.error(msg)
        setProcesando(false)
        return
      }

      try {
        const { data, error } = await supabase.functions.invoke('payway-checkout', {
          body: {
            items: items.map(i => ({
              nombre:   i.producto.nombre,
              talle:    i.talle,
              cantidad: i.cantidad,
              precio:   i.producto.precio,
            })),
            total,
            cliente:           { nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() },
            token:             response.id,
            bin:               response.bin,
            payment_method_id: tarjetaId,
          },
        })

        if (error) throw new Error(error.message)

        if (data?.aprobado) {
          vaciar()
          window.location.href = '/pago-exitoso'
        } else {
          throw new Error(data?.mensaje ?? 'Pago rechazado por el banco')
        }
      } catch (err) {
        console.error(err)
        toast.error(err.message || 'No se pudo procesar el pago. Intentá de nuevo.')
        setProcesando(false)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[92vh]">
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors z-10"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="p-6">
          <div className="mb-5">
            <h2 className="font-playfair text-2xl font-bold text-stone-900">Datos para el pago</h2>
            <p className="font-inter text-sm text-stone-500 mt-1">Pago seguro con PayWay</p>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-orange-light rounded-xl p-4 mb-5">
            <p className="font-inter text-xs text-stone-500 uppercase tracking-wider mb-2.5">
              Resumen del pedido
            </p>
            <div className="space-y-1.5">
              {items.map(({ producto, talle, cantidad }) => (
                <div key={`${producto.id}-${talle}`} className="flex justify-between items-baseline">
                  <span className="font-inter text-sm text-stone-600 truncate mr-2">
                    {cantidad > 1 && <span className="text-stone-400">{cantidad}× </span>}
                    {producto.nombre}
                    <span className="text-stone-400 ml-1">T.{talle}</span>
                  </span>
                  <span className="font-inter text-sm font-semibold text-stone-900 flex-shrink-0">
                    {formatPrecio(producto.precio * cantidad)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-orange/20 pt-2.5 mt-2.5 flex justify-between items-center">
              <span className="font-inter font-semibold text-stone-900">Total</span>
              <span className="font-playfair text-xl font-bold text-orange">{formatPrecio(total)}</span>
            </div>
          </div>

          <form ref={formRef} onSubmit={handlePagar} className="space-y-4">
            {/* Datos personales */}
            <div>
              <label className="block font-inter text-sm text-stone-600 mb-1.5">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: María González"
                className="input-base"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block font-inter text-sm text-stone-600 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ej: maria@email.com"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block font-inter text-sm text-stone-600 mb-1.5">
                Teléfono <span className="text-stone-400 font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="Ej: 3764 123456"
                className="input-base"
              />
            </div>

            {/* Datos de la tarjeta */}
            <div className="border-t border-stone-100 pt-4">
              <p className="font-inter text-sm font-semibold text-stone-700 mb-3">Datos de la tarjeta</p>

              <div className="space-y-3">
                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    Tipo de tarjeta <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={tarjetaId}
                    onChange={e => setTarjetaId(Number(e.target.value))}
                    className="input-base"
                  >
                    {TARJETAS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    Número de tarjeta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    data-decidir="card_number"
                    placeholder="1234 5678 9012 3456"
                    className="input-base"
                    maxLength={19}
                    required
                  />
                </div>

                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    Nombre en la tarjeta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    data-decidir="card_holder_name"
                    placeholder="MARIA GONZALEZ"
                    className="input-base"
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                </div>

                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    DNI del titular <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="hidden" data-decidir="card_holder_doc_type" value="dni" readOnly />
                    <input
                      type="text"
                      data-decidir="card_holder_doc_number"
                      placeholder="Ej: 27859328"
                      className="input-base"
                      maxLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      Mes <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      data-decidir="card_expiration_month"
                      placeholder="MM"
                      className="input-base text-center"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      Año <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      data-decidir="card_expiration_year"
                      placeholder="AA"
                      className="input-base text-center"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      CVV <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      data-decidir="security_code"
                      placeholder="123"
                      className="input-base text-center"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={procesando || !sdkListo}
              className="btn-orange w-full flex items-center justify-center gap-2 py-4 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {procesando ? (
                <><Spinner /> Procesando pago...</>
              ) : !sdkListo ? (
                <><Spinner /> Cargando...</>
              ) : (
                <><IconLock /> Pagar {formatPrecio(total)}</>
              )}
            </button>
          </form>

          <p className="font-inter text-xs text-stone-400 text-center mt-4">
            🔒 Pago procesado por PayWay · Visa · Mastercard · Débito
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
