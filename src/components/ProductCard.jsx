import { useState, useEffect } from 'react'

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
}

function useOferta(producto) {
  const [activa, setActiva] = useState(false)
  const [restante, setRestante] = useState('')

  useEffect(() => {
    if (!producto.oferta_pct || !producto.oferta_hasta) return
    const tick = () => {
      const diff = new Date(producto.oferta_hasta) - Date.now()
      if (diff <= 0) { setActiva(false); setRestante(''); return }
      setActiva(true)
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      setRestante(d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}min`)
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [producto.oferta_pct, producto.oferta_hasta])

  return { activa, restante }
}

export default function ProductCard({ producto, onVerDetalle, descuentoEfectivo = 0 }) {
  const [imgError, setImgError] = useState(false)
  const stock = producto.stock || []
  const hayStock = stock.some(s => s.cantidad > 0)
  const { activa: ofertaActiva, restante } = useOferta(producto)

  const precioConOferta = ofertaActiva
    ? Math.round(producto.precio * (1 - producto.oferta_pct / 100))
    : producto.precio

  const precioEfectivo = descuentoEfectivo > 0
    ? Math.round(precioConOferta * (1 - descuentoEfectivo / 100))
    : null

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
        {producto.etiqueta && !ofertaActiva && (
          <span className={`absolute top-3 left-3 badge-etiqueta ${
            producto.etiqueta === 'Nuevo' ? 'bg-orange text-white' : 'bg-caramel text-white'
          }`}>
            {producto.etiqueta}
          </span>
        )}

        {/* Badge oferta */}
        {ofertaActiva && (
          <span className="absolute top-3 left-3 font-inter text-xs font-bold px-2.5 py-1 rounded-full bg-lime-500 text-white shadow">
            -{producto.oferta_pct}% OFF
          </span>
        )}

        {/* Reloj oferta */}
        {ofertaActiva && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-orange flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
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

        {/* Precios */}
        <div className="flex flex-col gap-1">
          {/* Precio tachado si hay oferta */}
          {ofertaActiva && (
            <p className="font-inter text-sm text-stone-400 line-through">
              {formatPrecio(producto.precio)}
            </p>
          )}

          {/* Precio con tarjeta */}
          <div className="flex items-center gap-2">
            <p className="font-inter text-xl font-bold text-orange">
              {formatPrecio(precioConOferta)}
            </p>
            {!ofertaActiva && (
              <span className="font-inter text-xs text-stone-400">con tarjeta</span>
            )}
          </div>

          {/* Precio efectivo / transferencia */}
          {precioEfectivo && (
            <div className="flex items-center gap-1.5">
              <p className="font-inter text-sm font-semibold text-green-700">
                {formatPrecio(precioEfectivo)}
              </p>
              <span className="font-inter text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full leading-none">
                -{descuentoEfectivo}% efectivo / transf.
              </span>
            </div>
          )}

          {/* Countdown */}
          {ofertaActiva && restante && (
            <div className="flex items-center gap-1 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-lime-600 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="font-inter text-[11px] text-lime-700 font-medium">Oferta termina en {restante}</span>
            </div>
          )}
        </div>

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
