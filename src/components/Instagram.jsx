export default function Instagram() {
  const fotos = [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  ]

  return (
    <section id="instagram" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-inter text-sm font-medium tracking-[0.2em] text-orange uppercase mb-3">
          Seguinos
        </p>
        <h2 className="font-playfair text-5xl font-bold text-stone-900 mb-4">
          @fanaticadelcalzado_
        </h2>
        <p className="font-inter text-stone-500">
          Outfits, novedades y looks de nuestra comunidad
        </p>
      </div>

      {/* Grid de fotos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-8">
        {fotos.map((foto, i) => (
          <a
            key={i}
            href="https://instagram.com/fanaticadelcalzado_"
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square overflow-hidden rounded-lg group relative"
          >
            <img
              src={foto}
              alt={`Instagram ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-300 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"
                   className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      <div className="text-center">
        <a
          href="https://instagram.com/fanaticadelcalzado_"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
          </svg>
          Seguir en Instagram
        </a>
      </div>
    </section>
  )
}
