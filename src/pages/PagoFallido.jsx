import { Link } from 'react-router-dom'

export default function PagoFallido() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 2a18 18 0 1 1 0 36 18 18 0 0 1 0-36z"/>
            <line x1="13" y1="13" x2="27" y2="27"/>
            <line x1="27" y1="13" x2="13" y2="27"/>
          </svg>
        </div>

        <h1 className="font-playfair text-3xl font-bold text-stone-900 mb-3">
          El pago no se procesó
        </h1>
        <p className="font-inter text-stone-500 mb-2">
          Hubo un problema con el pago. Podés intentarlo de nuevo o contactarnos.
        </p>
        <p className="font-inter text-sm text-stone-400 mb-8">
          Tu carrito sigue guardado. Si el problema persiste, pedí por WhatsApp.
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-orange inline-block">
            Volver a intentar
          </Link>
          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-block"
          >
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
