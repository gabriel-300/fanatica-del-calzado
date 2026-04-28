import { useCarrito } from '../context/CarritoContext'

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

export default function CarritoSidebar({ onCheckout }) {
  const { items, abierto, cerrar, quitar, actualizar, total, cantidadTotal, vaciar } = useCarrito()

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          abierto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={cerrar}
      />

      {/* Drawer */}
      <aside className={`fixed right-0 top-0 h-full z-50 bg-white shadow-2xl w-full max-w-sm flex flex-col transition-transform duration-300 ease-in-out ${
        abierto ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-playfair text-xl font-bold text-stone-900">Tu carrito</h2>
            <p className="font-inter text-xs text-stone-400 mt-0.5">
              {cantidadTotal === 0
                ? 'Vacío'
                : `${cantidadTotal} ${cantidadTotal === 1 ? 'producto' : 'productos'}`}
            </p>
          </div>
          <button
            onClick={cerrar}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Cerrar carrito"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <span className="text-6xl">🛍️</span>
              <p className="font-playfair text-xl text-stone-400">Tu carrito está vacío</p>
              <p className="font-inter text-sm text-stone-400">Agregá productos desde el catálogo</p>
              <button onClick={cerrar} className="btn-orange text-sm mt-2">Ver catálogo</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ producto, talle, cantidad }) => (
                <div
                  key={`${producto.id}-${talle}`}
                  className="flex gap-3 bg-stone-50 rounded-xl p-3 border border-border/50"
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-light to-caramel-light flex-shrink-0">
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👠</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair text-sm font-semibold text-stone-900 leading-tight truncate">
                      {producto.nombre}
                    </p>
                    <p className="font-inter text-xs text-stone-500 mt-0.5">
                      Talle: <span className="font-semibold text-orange">{talle}</span>
                    </p>
                    <p className="font-inter text-sm font-bold text-orange mt-1">
                      {formatPrecio(producto.precio * cantidad)}
                    </p>
                  </div>

                  {/* Cantidad + quitar */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button
                      onClick={() => quitar(producto.id, talle)}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                      aria-label="Quitar"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="4" x2="4" y2="12"/>
                        <line x1="4" y1="4" x2="12" y2="12"/>
                      </svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          cantidad > 1
                            ? actualizar(producto.id, talle, cantidad - 1)
                            : quitar(producto.id, talle)
                        }
                        className="w-6 h-6 rounded-full border border-border text-stone-500 hover:border-orange hover:text-orange transition-colors text-sm flex items-center justify-center font-bold leading-none"
                      >
                        −
                      </button>
                      <span className="font-inter text-sm font-bold text-stone-900 w-4 text-center">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => actualizar(producto.id, talle, cantidad + 1)}
                        className="w-6 h-6 rounded-full border border-border text-stone-500 hover:border-orange hover:text-orange transition-colors text-sm flex items-center justify-center font-bold leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-border space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <p className="font-inter text-stone-600 font-medium">Total</p>
              <p className="font-playfair text-2xl font-bold text-stone-900">{formatPrecio(total)}</p>
            </div>

            <button
              onClick={() => { cerrar(); onCheckout() }}
              className="btn-orange w-full flex items-center justify-center gap-2 text-base py-4"
            >
              <IconCard />
              Pagar con tarjeta
            </button>

            <button
              onClick={vaciar}
              className="w-full font-inter text-xs text-stone-400 hover:text-red-400 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

function IconCard() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
