const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

const PASOS = [
  {
    numero: '01',
    titulo: 'Elegí tu calzado',
    descripcion: 'Explorá el catálogo, seleccioná el talle que usás y hacé clic en "Pedir por WhatsApp".',
  },
  {
    numero: '02',
    titulo: 'Completá tus datos',
    descripcion: 'Ingresá tu nombre y teléfono. Te redirigimos a WhatsApp con tu pedido ya armado.',
  },
  {
    numero: '03',
    titulo: '¡Confirmamos y enviamos!',
    descripcion: 'Coordinamos el pago y el envío. Recibís tu calzado en la puerta de tu casa.',
  },
]

const PAGOS_CREDITO = [
  { nombre: 'VISA',        bg: '#1A1F71', color: '#fff', italic: true },
  { nombre: 'Mastercard',  bg: '#252525', color: '#fff' },
  { nombre: 'AMEX',        bg: '#007BC1', color: '#fff' },
  { nombre: 'Diners',      bg: '#4B4B4B', color: '#fff' },
  { nombre: 'CABAL',       bg: '#00694E', color: '#fff' },
  { nombre: 'Naranja',     bg: '#FF6600', color: '#fff' },
  { nombre: 'Shopping',    bg: '#E31837', color: '#fff' },
  { nombre: 'Nativa',      bg: '#2E7D32', color: '#fff' },
]
const PAGOS_DEBITO = [
  { nombre: 'VISA Débito',  bg: '#1A1F71', color: '#fff', italic: true },
  { nombre: 'Mastercard',   bg: '#252525', color: '#fff' },
  { nombre: 'Maestro',      bg: '#CC0000', color: '#fff' },
  { nombre: 'CABAL Débito', bg: '#00694E', color: '#fff' },
]
const PAGOS_EFECTIVO = [
  { nombre: 'Transferencia', bg: '#1565C0', color: '#fff' },
  { nombre: 'Mercado Pago',  bg: '#009EE3', color: '#fff' },
]

export default function ComoComprar() {
  return (
    <section id="como-comprar" className="py-20 bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <p className="font-inter text-sm font-medium tracking-[0.2em] text-orange uppercase mb-3">
            Simple y rápido
          </p>
          <h2 className="font-playfair text-5xl font-bold text-stone-900 mb-4">
            Cómo comprar
          </h2>
        </div>

        {/* Pasos */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PASOS.map((paso, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange text-white font-playfair text-2xl font-bold mb-5">
                {paso.numero}
              </div>
              <h3 className="font-playfair text-2xl font-semibold text-stone-900 mb-3">
                {paso.titulo}
              </h3>
              <p className="font-inter text-sm text-stone-500 leading-relaxed">
                {paso.descripcion}
              </p>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <div className="border-t border-border my-12" />

        {/* Métodos de pago y envíos */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* Pagos */}
          <div>
            <h3 className="font-playfair text-2xl font-semibold text-stone-900 mb-5">
              Medios de pago
            </h3>

            <div className="space-y-4">
              <div>
                <p className="font-inter text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Crédito</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAGOS_CREDITO.map(p => (
                    <span key={p.nombre}
                      style={{ backgroundColor: p.bg, color: p.color }}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg font-inter text-xs font-semibold ${p.italic ? 'italic' : ''}`}>
                      {p.nombre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-inter text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Débito</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAGOS_DEBITO.map(p => (
                    <span key={p.nombre}
                      style={{ backgroundColor: p.bg, color: p.color }}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg font-inter text-xs font-semibold ${p.italic ? 'italic' : ''}`}>
                      {p.nombre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-inter text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Efectivo y otros</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAGOS_EFECTIVO.map(p => (
                    <span key={p.nombre}
                      style={{ backgroundColor: p.bg, color: p.color }}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg font-inter text-xs font-semibold">
                      {p.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Envíos */}
          <div>
            <h3 className="font-playfair text-2xl font-semibold text-stone-900 mb-6">
              Envíos
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-border">
                <span className="text-xl flex-shrink-0">📦</span>
                <div>
                  <p className="font-inter text-sm font-medium text-stone-800 mb-1">Envío a domicilio</p>
                  <p className="font-inter text-xs text-stone-500">Coordinamos el envío a tu dirección</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-border">
                <span className="text-xl flex-shrink-0">🏪</span>
                <div>
                  <p className="font-inter text-sm font-medium text-stone-800 mb-1">Retiro en persona</p>
                  <p className="font-inter text-xs text-stone-500">Coordinamos punto de encuentro en Misiones</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-light border border-orange/20">
                <span className="text-xl flex-shrink-0">⚡</span>
                <div>
                  <p className="font-inter text-sm font-medium text-orange-dark mb-1">Envío express Posadas</p>
                  <p className="font-inter text-xs text-stone-500">Entrega en el día para zona Posadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Tengo una consulta sobre el calzado.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-orange inline-flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
