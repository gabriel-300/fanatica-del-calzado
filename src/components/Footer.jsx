const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

export default function Footer() {
  return (
    <footer className="bg-caramel-dark text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">

          {/* Logo y descripción */}
          <div>
            <div className="flex items-center gap-0.5 mb-4">
              <span className="font-playfair text-2xl font-bold text-white">Fanática</span>
              <span className="font-playfair text-2xl font-semibold italic text-white/60"> del Calzado</span>
            </div>
            <p className="font-inter text-sm text-white/60 italic leading-relaxed mb-3">
              "Un par de zapatos dice más que mil palabras."
            </p>
            <p className="font-inter text-xs text-white/35 leading-relaxed">
              Tu tienda de confianza en Misiones. Moda, estilo y comodidad en cada par.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-inter text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Catálogo', href: '#catalogo' },
                { label: 'Cómo comprar', href: '#como-comprar' },
                { label: 'Instagram', href: '#instagram' },
              ].map(l => (
                <li key={l.label}>
                  <a href={l.href} className="font-inter text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="font-inter text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              Contacto
            </p>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-inter text-sm text-white/50 hover:text-white transition-colors"
              >
                <span>💬</span> 375 446-0575
              </a>
              <a
                href="https://instagram.com/fanaticadelcalzado_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-inter text-sm text-white/50 hover:text-white transition-colors"
              >
                <span>📸</span> @fanaticadelcalzado_
              </a>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-inter text-xs text-white/25">
            © {new Date().getFullYear()} Fanática del Calzado. Todos los derechos reservados.
          </p>
          <p className="font-inter text-xs text-white/40">
            Hecho con amor en Misiones, Argentina 🇦🇷
          </p>
        </div>
      </div>
    </footer>
  )
}
