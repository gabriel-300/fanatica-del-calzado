import { useCategorias } from '../hooks/useCategorias'

export default function FiltrosCategorias({ activa, onChange, conteos }) {
  const { categorias } = useCategorias()
  const todas = ['Todas', ...categorias]

  return (
    <div className="bg-white border-b border-border py-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {todas.map(cat => (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              font-inter text-sm px-5 py-2.5 rounded-full border transition-all duration-200
              ${activa === cat
                ? 'bg-orange text-white border-orange shadow-sm'
                : 'bg-white text-stone-600 border-border hover:border-orange hover:text-orange'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
