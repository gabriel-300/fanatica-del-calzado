import { useState } from 'react'
import toast from 'react-hot-toast'
import { crearPedido } from '../hooks/usePedidos'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

export default function ModalPedido({ producto, talle, cantidad = 1, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!producto) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nombre.trim() || !telefono.trim()) {
      toast.error('Completá tu nombre y teléfono')
      return
    }

    setEnviando(true)
    try {
      await crearPedido({
        producto,
        talle,
        cliente: { nombre: nombre.trim(), telefono: telefono.trim(), cantidad },
      })

      const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
      const cantTexto = cantidad > 1 ? ` (x${cantidad})` : ''
      const texto = [
        `Hola! 👋 Quisiera hacer el siguiente pedido:`,
        ``,
        `🛍️ *${producto.nombre}*${cantTexto}`,
        `📏 Talle: *${talle}*`,
        producto.precio ? `💰 Precio: ${fmt(producto.precio)}` : null,
        producto.categoria ? `🏷️ Categoría: ${producto.categoria}` : null,
        ``,
        `👤 Nombre: ${nombre.trim()}`,
        `📱 Teléfono: ${telefono.trim()}`,
      ].filter(l => l !== null).join('\n')
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(texto)}`

      toast.success('¡Pedido registrado! Abriendo WhatsApp...')
      onCerrar()
      setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 300)
    } catch (err) {
      toast.error('Error al registrar el pedido. Intentá de nuevo.')
      console.error(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease]">
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Encabezado */}
        <div className="mb-5">
          <h2 className="font-playfair text-2xl font-bold text-stone-900">
            Completá tu pedido
          </h2>
          <p className="font-inter text-sm text-stone-500 mt-1">
            Te contactamos por WhatsApp para confirmar
          </p>
        </div>

        {/* Resumen del producto */}
        <div className="bg-orange-light rounded-xl p-4 mb-6 flex gap-4 items-center">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-caramel-light flex items-center justify-center text-2xl flex-shrink-0">
              👠
            </div>
          )}
          <div>
            <p className="font-playfair text-lg font-semibold text-stone-900 leading-tight">
              {producto.nombre}
            </p>
            <p className="font-inter text-sm text-stone-500">Talle: <strong className="text-orange">{talle}</strong></p>
            <p className="font-inter text-lg font-semibold text-orange">
              {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
                .format(producto.precio)}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-inter text-sm text-stone-600 mb-1.5">
              Tu nombre
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
              Tu teléfono (WhatsApp)
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Ej: 3764 123456"
              className="input-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="btn-orange w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <>
                <SpinnerIcon /> Enviando...
              </>
            ) : (
              <>
                <IconWhatsApp /> Confirmar y abrir WhatsApp
              </>
            )}
          </button>
        </form>

        <p className="font-inter text-xs text-stone-400 text-center mt-4">
          Tu info solo se usa para gestionar tu pedido 🔒
        </p>
      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
    </svg>
  )
}
