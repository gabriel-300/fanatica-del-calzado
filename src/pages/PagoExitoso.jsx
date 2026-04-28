import { Link } from 'react-router-dom'

export default function PagoExitoso() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 2a18 18 0 1 1 0 36 18 18 0 0 1 0-36z"/>
            <path d="M12 20l5 5 10-10"/>
          </svg>
        </div>

        <h1 className="font-playfair text-3xl font-bold text-stone-900 mb-3">
          ¡Pago aprobado!
        </h1>
        <p className="font-inter text-stone-500 mb-2">
          Tu pedido fue confirmado. Te enviaremos los detalles por email.
        </p>
        <p className="font-inter text-sm text-stone-400 mb-8">
          Si tenés alguna consulta sobre el envío, escribinos por WhatsApp.
        </p>

        <Link to="/" className="btn-orange inline-block">
          Volver a la tienda
        </Link>
      </div>
    </div>
  )
}
