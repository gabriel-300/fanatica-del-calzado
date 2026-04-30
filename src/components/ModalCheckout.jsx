import { useState, useEffect, useRef } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const IS_TEST     = import.meta.env.VITE_PAYWAY_TEST_MODE !== 'false'
const DECIDIR_API = IS_TEST
  ? 'https://developers.decidir.com/api/v2'
  : 'https://live.decidir.com/api/v2'
const DECIDIR_JS  = 'https://live.decidir.com/static/v2.6.4/decidir.js'
const PUBLIC_KEY  = import.meta.env.VITE_PAYWAY_PUBLIC_KEY ?? ''

// Detecta payment_method_id desde los primeros dígitos de la tarjeta
function getPaymentMethodId(num, credito) {
  const n = num.replace(/\D/g, '')
  const two = n.substring(0, 2)
  if (n[0] === '4')                                          return credito ? 1  : 6   // Visa
  if (['51','52','53','54','55'].includes(two) ||
      (parseInt(n.substring(0,4)) >= 2221 && parseInt(n.substring(0,4)) <= 2720))
                                                             return credito ? 15 : 23  // Mastercard
  if (two === '34' || two === '37')                          return 30                 // AMEX
  if (n.startsWith('6042') || n.startsWith('6043'))         return 28                 // Cabal
  if (n.startsWith('589562'))                                return 24                 // Naranja
  return credito ? 1 : 6
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

export default function ModalCheckout({ onCerrar }) {
  const { items, total, vaciar } = useCarrito()
  const [nombre, setNombre]         = useState('')
  const [email, setEmail]           = useState('')
  const [telefono, setTelefono]     = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [esCredito, setEsCredito]   = useState(true)
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

  function handleCardNumber(e) {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    setTarjetaId(getPaymentMethodId(formatted, esCredito))
  }

  function handleEsCredito(val) {
    setEsCredito(val)
    setTarjetaId(getPaymentMethodId(cardNumber, val))
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
        const vErr    = Array.isArray(response?.validation_errors) ? response.validation_errors : null
        const msg = vErr?.[0]?.message ?? errores?.[0]?.message ?? response?.message ?? 'Verificá los datos de la tarjeta'
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
          toast.error(data?.mensaje ?? 'Pago rechazado por el banco')
          setProcesando(false)
        }
      } catch (err) {
        console.error(err)
        toast.error('No se pudo procesar el pago. Intentá de nuevo.')
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

          {/* Resumen */}
          <div className="bg-orange-light rounded-xl p-4 mb-5">
            <p className="font-inter text-xs text-stone-500 uppercase tracking-wider mb-2.5">Resumen del pedido</p>
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
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: María González" className="input-base" autoFocus required />
            </div>
            <div>
              <label className="block font-inter text-sm text-stone-600 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Ej: maria@email.com" className="input-base" required />
            </div>
            <div>
              <label className="block font-inter text-sm text-stone-600 mb-1.5">
                Teléfono <span className="text-stone-400 font-normal">(opcional)</span>
              </label>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                placeholder="Ej: 3764 123456" className="input-base" />
            </div>

            {/* Tarjeta */}
            <div className="border-t border-stone-100 pt-4">
              <p className="font-inter text-sm font-semibold text-stone-700 mb-3">Datos de la tarjeta</p>

              {/* Crédito / Débito */}
              <div className="flex gap-2 mb-3">
                {[{ label: 'Crédito', val: true }, { label: 'Débito', val: false }].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleEsCredito(val)}
                    className={`flex-1 py-2 rounded-lg border font-inter text-sm font-medium transition-colors
                      ${esCredito === val
                        ? 'border-orange bg-orange text-white'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {/* Número */}
                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    Número de tarjeta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    data-decidir="card_number"
                    value={cardNumber}
                    onChange={handleCardNumber}
                    placeholder="1234 5678 9012 3456"
                    className="input-base tracking-widest"
                    maxLength={19}
                    required
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    Nombre en la tarjeta <span className="text-red-400">*</span>
                  </label>
                  <input type="text" data-decidir="card_holder_name"
                    placeholder="MARIA GONZALEZ" className="input-base"
                    style={{ textTransform: 'uppercase' }} required />
                </div>

                {/* DNI */}
                <div>
                  <label className="block font-inter text-sm text-stone-600 mb-1.5">
                    DNI del titular <span className="text-red-400">*</span>
                  </label>
                  <input type="hidden" data-decidir="card_holder_doc_type" value="dni" readOnly />
                  <input type="text" data-decidir="card_holder_doc_number"
                    placeholder="Ej: 27859328" className="input-base" maxLength={8} required />
                </div>

                {/* Vencimiento + CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      Mes <span className="text-red-400">*</span>
                    </label>
                    <input type="text" data-decidir="card_expiration_month"
                      placeholder="MM" className="input-base text-center" maxLength={2} required />
                  </div>
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      Año <span className="text-red-400">*</span>
                    </label>
                    <input type="text" data-decidir="card_expiration_year"
                      placeholder="AA" className="input-base text-center" maxLength={2} required />
                  </div>
                  <div>
                    <label className="block font-inter text-sm text-stone-600 mb-1.5">
                      CVV <span className="text-red-400">*</span>
                    </label>
                    <input type="text" data-decidir="security_code"
                      placeholder="123" className="input-base text-center" maxLength={4} required />
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
