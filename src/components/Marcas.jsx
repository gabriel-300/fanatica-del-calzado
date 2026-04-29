const MARCAS = ['Moleca', 'Vizzano', 'Modare', 'Di Cristalli', 'Mississipi', 'Piccadilly']

export default function Marcas() {
  return (
    <section className="py-8 bg-white border-y border-border overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center font-inter text-xs font-semibold tracking-[0.2em] text-stone-400 uppercase mb-5">
          Marcas disponibles
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
          {MARCAS.map(marca => (
            <span key={marca} className="font-playfair text-xl font-bold text-stone-300 hover:text-caramel transition-colors duration-200 cursor-default select-none">
              {marca}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
