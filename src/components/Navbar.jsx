import { useState, useEffect } from 'react'
import { useCarrito } from '../context/CarritoContext'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { cantidadTotal, abrir } = useCarrito()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Catálogo', href: '#catalogo' },
    { label: 'Cómo comprar', href: '#como-comprar' },
    { label: 'Instagram', href: '#instagram' },
    { label: 'Contacto', href: `https://wa.me/${WA_NUMBER}`, externo: true },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-border ${
      scrolled ? 'shadow-sm' : ''
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-0.5">
            <span className="font-playfair text-xl font-bold text-orange">Fanática</span>
            <span className="font-playfair text-xl font-semibold italic text-caramel-dark"> del Calzado</span>
          </a>

          {/* Links escritorio */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              link.externo ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                   className="font-inter text-xs text-stone-500 hover:text-orange transition-colors duration-200 uppercase tracking-widest">
                  {link.label}
                </a>
              ) : (
                <a key={link.label} href={link.href}
                   className="font-inter text-xs text-stone-500 hover:text-orange transition-colors duration-200 uppercase tracking-widest">
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Íconos sociales + carrito escritorio */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://instagram.com/fanaticadelcalzado_" target="_blank" rel="noopener noreferrer"
               aria-label="Instagram" className="text-stone-400 hover:text-orange transition-colors duration-200">
              <IconInstagram />
            </a>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
               aria-label="WhatsApp" className="text-stone-400 hover:text-orange transition-colors duration-200">
              <IconWhatsApp />
            </a>
            {/* Carrito */}
            <button
              onClick={abrir}
              aria-label="Ver carrito"
              className="relative text-stone-400 hover:text-orange transition-colors duration-200"
            >
              <IconCarrito />
              {cantidadTotal > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange text-white text-[10px] font-bold font-inter w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cantidadTotal > 9 ? '9+' : cantidadTotal}
                </span>
              )}
            </button>
          </div>

          {/* Hamburguesa mobile */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="md:hidden p-2 text-stone-500 hover:text-orange transition-colors"
            aria-label="Menú"
          >
            {menuAbierto ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
          {navLinks.map(link => (
            link.externo ? (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                 onClick={() => setMenuAbierto(false)}
                 className="block font-inter text-xs text-stone-500 hover:text-orange py-2 transition-colors uppercase tracking-widest">
                {link.label}
              </a>
            ) : (
              <a key={link.label} href={link.href}
                 onClick={() => setMenuAbierto(false)}
                 className="block font-inter text-xs text-stone-500 hover:text-orange py-2 transition-colors uppercase tracking-widest">
                {link.label}
              </a>
            )
          ))}
          <div className="flex gap-4 pt-2 border-t border-border items-center">
            <a href="https://instagram.com/fanaticadelcalzado_" target="_blank" rel="noopener noreferrer"
               className="text-stone-400 hover:text-orange transition-colors">
              <IconInstagram />
            </a>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
               className="text-stone-400 hover:text-orange transition-colors">
              <IconWhatsApp />
            </a>
            <button
              onClick={() => { setMenuAbierto(false); abrir() }}
              className="relative text-stone-400 hover:text-orange transition-colors"
            >
              <IconCarrito />
              {cantidadTotal > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cantidadTotal > 9 ? '9+' : cantidadTotal}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
    </svg>
  )
}

function IconCarrito() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function IconMenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
