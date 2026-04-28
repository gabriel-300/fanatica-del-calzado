import { useState, useEffect, useRef } from 'react'
import { useBanners } from '../hooks/useBanners'

const SLIDE_DEFAULT = {
  id: '_default',
  titulo: 'Dejando huellas',
  subtitulo: 'de inspiración.',
  descripcion: 'Zapatillas, sandalias y botas seleccionadas con amor para chicas que no le tienen miedo al estilo.',
  badge: '',
  imagen_url: '',
  cta_texto: 'Ver catálogo',
  cta_link: '#catalogo',
}

export default function HeroCarrusel() {
  const { banners } = useBanners()
  const [idx, setIdx] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const pausadoRef = useRef(false)

  const slides = banners.length > 0 ? banners : [SLIDE_DEFAULT]
  const total = slides.length

  // Reset index when slide count changes
  useEffect(() => { setIdx(0) }, [total])

  // Auto-play: recreates whenever timerKey or total changes (resets on manual nav)
  useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(() => {
      if (!pausadoRef.current) {
        setIdx(prev => (prev + 1) % total)
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [total, timerKey])

  const ir = (i) => {
    const nuevoIdx = ((i % total) + total) % total
    setIdx(nuevoIdx)
    setTimerKey(k => k + 1) // reset auto-play timer
  }

  const slide = slides[Math.min(idx, total - 1)]

  return (
    <section
      className="pt-16 bg-white overflow-hidden"
      onMouseEnter={() => { pausadoRef.current = true }}
      onMouseLeave={() => { pausadoRef.current = false }}
    >
      <div className="max-w-6xl mx-auto px-6">

        {/* Contenedor con alto mínimo: evita saltos entre slides */}
        <div className="flex flex-col lg:justify-center" style={{ minHeight: '520px' }}>

        {/* Slide content — key forces remount → triggers CSS animation */}
        <div key={`slide-${idx}`} style={{ animation: 'heroFadeIn 0.45s ease' }}>
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-14 lg:py-0">

            {/* Texto */}
            <div className="flex-1 text-center lg:text-left">

              {/* Badge promocional */}
              {slide.badge && (
                <div className="mb-5">
                  <span className="inline-block bg-orange text-white font-inter text-xs font-bold px-5 py-2 rounded-full tracking-[0.15em] uppercase shadow-md shadow-orange/20">
                    {slide.badge}
                  </span>
                </div>
              )}

              {/* Título */}
              <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 leading-tight mb-3">
                {slide.titulo}
              </h1>

              {/* Subtítulo: tamaño propio para que no sea gigante */}
              {slide.subtitulo && (
                <p className="font-playfair text-2xl sm:text-3xl md:text-4xl italic text-orange leading-tight mb-6">
                  {slide.subtitulo}
                </p>
              )}

              {/* Descripción */}
              {slide.descripcion && (
                <p className="font-inter text-lg text-stone-500 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0">
                  {slide.descripcion}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a href={slide.cta_link || '#catalogo'} className="btn-orange text-base px-8 py-4">
                  {slide.cta_texto || 'Ver catálogo'}
                </a>
                <a href="#como-comprar" className="btn-outline text-base px-8 py-4">
                  Cómo comprar
                </a>
              </div>
            </div>

            {/* Imagen */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={slide.imagen_url || '/logo.png'}
                alt={slide.titulo}
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain mix-blend-multiply"
              />
            </div>

          </div>
        </div>

        </div>{/* fin contenedor altura fija */}

        {/* Navegación: sólo visible si hay más de 1 slide */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-4 py-8">

            {/* Anterior */}
            <button
              onClick={() => ir(idx - 1)}
              aria-label="Anterior"
              className="w-9 h-9 rounded-full border-2 border-border text-stone-400 hover:border-orange hover:text-orange transition-colors flex items-center justify-center"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 2L5 7l4 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dots */}
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => ir(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === idx
                    ? 'w-6 h-2.5 bg-orange'
                    : 'w-2.5 h-2.5 bg-stone-200 hover:bg-stone-300'
                }`}
              />
            ))}

            {/* Siguiente */}
            <button
              onClick={() => ir(idx + 1)}
              aria-label="Siguiente"
              className="w-9 h-9 rounded-full border-2 border-border text-stone-400 hover:border-orange hover:text-orange transition-colors flex items-center justify-center"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 2l4 5-4 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>
        )}

      </div>
    </section>
  )
}
