import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

export default function ModalCheckout({ onCerrar }) {
  const { items, total, vaciar } = useCarrito()
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [telefono, setTelefono] = useState('')
  const [procesando, setProcesando] = useState(false)

  const handlePagar = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim()) {
      toast.error('Completá nombre y email para continuar')
      return
    }

    setProcesando(true)
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
          cliente: {
            nombre:   nombre.trim(),
            email:    email.trim(),
            telefono: telefono.trim(),
          },
        },
      })

      if (error) throw new Error(error.message)

      // Crear formulario oculto y enviarlo a PayWay
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.url
      Object.entries(data.fields).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      vaciar()
      form.submit()
    } catch (err) {
      console.error(err)
      toast.error('No se pudo iniciar el pago. Intentá de nuevo.')
      setProcesando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[92vh]">
        {/* Cerrar */}
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
          {/* Header */}
          <div className="mb-5">
            <h2 className="font-playfair text-2xl font-bold text-stone-900">Datos para el pago</h2>
            <p className="font-inter text-sm text-stone-500 mt-1">
              Serás redirigida a PayWay para pagar de forma segura
            </p>
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

          {/* Formulario */}
          <form onSubmit={handlePagar} className="space-y-4">
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

            <button
              type="submit"
              disabled={procesando}
              className="btn-orange w-full flex items-center justify-center gap-2 py-4 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {procesando ? (
                <>
                  <Spinner />
                  Redirigiendo a PayWay...
                </>
              ) : (
                <>
                  <IconLock />
                  Pagar {formatPrecio(total)}
                </>
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
