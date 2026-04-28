export default function Hero() {
  return (
    <section className="pt-16 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left">
            {/* Título */}
            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-stone-900 leading-tight mb-6">
              Dejando huellas
              <br />
              <span className="italic text-orange">de inspiración.</span>
            </h1>

            {/* Descripción */}
            <p className="font-inter text-lg text-stone-500 max-w-xl mb-10 leading-relaxed mx-auto lg:mx-0">
              Zapatillas, sandalias y botas seleccionadas con amor para chicas
              que no le tienen miedo al estilo.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <a href="#catalogo" className="btn-orange text-base px-8 py-4">
                Ver catálogo
              </a>
              <a href="#como-comprar" className="btn-outline text-base px-8 py-4">
                Cómo comprar
              </a>
            </div>

          </div>

          {/* Logo */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Fanática del Calzado"
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain mix-blend-multiply"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
