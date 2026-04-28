import { useState } from 'react'

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
}

export default function ProductCard({ producto, onVerDetalle }) {
  const [imgError, setImgError] = useState(false)
  const stock = producto.stock || []
  const hayStock = stock.some(s => s.cantidad > 0)

  return (
    <div
      onClick={() => onVerDetalle(producto)}
      className="group flex flex-col overflow-hidden bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-light to-caramel-light">
        {producto.imagen_url && !imgError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">👠</span>
            <span className="font-inter text-xs text-caramel/50 text-center px-4 line-clamp-2">{producto.nombre}</span>
          </div>
        )}

        {/* Badge etiqueta */}
        {producto.etiqueta && (
          <span className={`absolute top-3 left-3 badge-etiqueta ${
            producto.etiqueta === 'Nuevo' ? 'bg-orange text-white' : 'bg-caramel text-white'
          }`}>
            {producto.etiqueta}
          </span>
        )}

        {/* Sin stock overlay */}
        {!hayStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="font-inter text-xs font-semibold text-stone-400 bg-white px-3 py-1.5 rounded-full border border-border">
              Sin stock
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="font-inter text-xs font-semibold text-white bg-stone-900/70 px-4 py-2 rounded-full backdrop-blur-sm">
            Ver detalle
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <p className="font-inter text-xs text-stone-400 uppercase tracking-wider">
          {producto.categoria}
        </p>
        <h3 className="font-playfair text-lg font-semibold text-stone-900 leading-tight">
          {producto.nombre}
        </h3>
        <p className="font-inter text-xl font-bold text-orange">
          {formatPrecio(producto.precio)}
        </p>

        {/* Preview talles disponibles */}
        {stock.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {stock
              .sort((a, b) => a.talle.localeCompare(b.talle, undefined, { numeric: true }))
              .slice(0, 6)
              .map(({ talle, cantidad }) => (
                <span key={talle}
                  className={`font-inter text-xs px-2 py-0.5 rounded border ${
                    cantidad > 0
                      ? 'border-border text-stone-500'
                      : 'border-border/40 text-stone-300 line-through'
                  }`}>
                  {talle}
                </span>
              ))}
            {stock.length > 6 && (
              <span className="font-inter text-xs px-2 py-0.5 text-stone-400">+{stock.length - 6}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
