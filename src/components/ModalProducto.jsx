import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import toast from 'react-hot-toast'

function formatPrecio(precio) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(precio)
}

export default function ModalProducto({ producto, onCerrar, onPedir }) {
  const { agregar, abrir } = useCarrito()
  const [talleSeleccionado, setTalleSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [alertaTalle, setAlertaTalle] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [colorSeleccionado, setColorSeleccionado] = useState(null)

  if (!producto) return null

  // Combinar imagen_url + imagenes[] sin duplicados
  const todasImagenes = [
    producto.imagen_url,
    ...((producto.imagenes) || [])
  ].filter(Boolean).filter((url, i, arr) => arr.indexOf(url) === i)

  const imagenActual = todasImagenes[selectedIdx] || null

  const stock = producto.stock || []
  const colores = producto.colores || []

  const imagenActualConColor = colorSeleccionado?.imagen_url || imagenActual

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setRotate({ x: (y - 0.5) * -22, y: (x - 0.5) * 22 })
  }

  const validarTalle = () => {
    if (!talleSeleccionado) {
      setAlertaTalle(true)
      setTimeout(() => setAlertaTalle(false), 3000)
      return false
    }
    return true
  }

  const handleAgregarAlCarrito = () => {
    if (!validarTalle()) return
    const productoConColor = colorSeleccionado
      ? { ...producto, _color: colorSeleccionado.nombre }
      : producto
    agregar(productoConColor, talleSeleccionado, cantidad)
    toast.success(`${producto.nombre} agregado al carrito`)
    onCerrar()
    setTimeout(() => abrir(), 150)
  }

  const handlePedir = () => {
    if (!validarTalle()) return
    const productoConColor = colorSeleccionado
      ? { ...producto, _color: colorSeleccionado.nombre }
      : producto
    onPedir(productoConColor, talleSeleccionado, cantidad)
  }

  const cambiarImagen = (idx) => {
    setSelectedIdx(idx)
    setImgError(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Cerrar */}
        <button onClick={onCerrar}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-1.5 shadow-md text-stone-400 hover:text-stone-700 transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="grid md:grid-cols-2 min-h-[480px]">

          {/* Panel imagen */}
          <div className="bg-gradient-to-br from-orange-light to-caramel-light rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none flex flex-col">

            {/* Imagen principal con 3D + zoom al click */}
            <div
              className="flex-1 flex items-center justify-center p-8 select-none"
              style={{ perspective: '900px', cursor: imagenActual && !imgError ? 'zoom-in' : 'default' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => { setHovering(false); setRotate({ x: 0, y: 0 }) }}
              onClick={() => imagenActualConColor && !imgError && setLightbox(true)}
            >
              <div style={{
                transform: hovering
                  ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.08,1.08,1.08)`
                  : 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
                transition: hovering ? 'none' : 'transform 0.7s cubic-bezier(0.23,1,0.32,1)',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
              }}>
                {imagenActualConColor && !imgError ? (
                  <img
                    key={colorSeleccionado?.nombre || selectedIdx}
                    src={imagenActualConColor}
                    alt={producto.nombre}
                    onError={() => setImgError(true)}
                    draggable={false}
                    className="max-h-64 w-full object-contain"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))' }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-caramel/40">
                    <span className="text-9xl">👠</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails (solo si hay más de 1 imagen) */}
            {todasImagenes.length > 1 && (
              <div className="flex gap-2 justify-center px-6 pb-5">
                {todasImagenes.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => cambiarImagen(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-150 flex-shrink-0 ${
                      selectedIdx === idx
                        ? 'border-orange shadow-md scale-105'
                        : 'border-white/60 hover:border-orange/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Panel info */}
          <div className="p-6 md:p-8 flex flex-col gap-5">

            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="font-inter text-xs text-stone-400 uppercase tracking-widest">{producto.categoria}</p>
                {producto.etiqueta && (
                  <span className={`badge-etiqueta ${
                    producto.etiqueta === 'Nuevo' ? 'bg-orange text-white' : 'bg-caramel text-white'
                  }`}>{producto.etiqueta}</span>
                )}
              </div>
              <h2 className="font-playfair text-3xl font-bold text-stone-900 leading-tight">
                {producto.nombre}
              </h2>
              {producto.descripcion && (
                <p className="font-inter text-sm text-stone-500 mt-2 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
            </div>

            <p className="font-inter text-3xl font-bold text-orange">
              {formatPrecio(producto.precio)}
            </p>

            {/* Colores */}
            {colores.length > 0 && (
              <div>
                <p className="font-inter text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                  Color
                  {colorSeleccionado && (
                    <span className="ml-2 text-orange normal-case font-bold">— {colorSeleccionado.nombre}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colores.map((color) => {
                    const seleccionado = colorSeleccionado?.nombre === color.nombre
                    return (
                      <button key={color.nombre}
                        type="button"
                        onClick={() => setColorSeleccionado(seleccionado ? null : color)}
                        className={`flex items-center gap-2 font-inter text-sm px-3 py-2 rounded-xl border-2 transition-all duration-150 ${
                          seleccionado
                            ? 'border-orange shadow-lg shadow-orange/20 scale-105 bg-orange-light'
                            : 'border-border hover:border-orange/50 bg-white'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-white/50 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: color.hex }} />
                        <span className="text-stone-700">{color.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Talles */}
            <div>
              <p className="font-inter text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Talle
                {talleSeleccionado && (
                  <span className="ml-2 text-orange normal-case font-bold">— {talleSeleccionado}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {stock
                  .sort((a, b) => a.talle.localeCompare(b.talle, undefined, { numeric: true }))
                  .map(({ talle, cantidad: cant }) => {
                    const disponible = cant > 0
                    const seleccionado = talleSeleccionado === talle
                    return (
                      <button key={talle}
                        onClick={() => disponible && setTalleSeleccionado(talle)}
                        disabled={!disponible}
                        className={`
                          font-inter text-sm px-4 py-2 rounded-xl border-2 transition-all duration-150 font-medium
                          ${seleccionado
                            ? 'bg-orange text-white border-orange shadow-lg shadow-orange/25 scale-105'
                            : disponible
                              ? 'bg-white text-stone-700 border-border hover:border-orange hover:text-orange'
                              : 'text-stone-300 border-border/40 line-through cursor-not-allowed opacity-40'
                          }
                        `}>
                        {talle}
                      </button>
                    )
                  })}
              </div>
              {alertaTalle && (
                <p className="text-xs text-red-500 font-inter mt-2 animate-pulse">
                  ← Seleccioná un talle primero
                </p>
              )}
            </div>

            {/* Cantidad */}
            <div>
              <p className="font-inter text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Cantidad
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-full border-2 border-border text-stone-600 hover:border-orange hover:text-orange transition-colors font-bold text-lg flex items-center justify-center">
                  −
                </button>
                <span className="font-playfair text-2xl font-bold text-stone-900 w-8 text-center">{cantidad}</span>
                <button onClick={() => setCantidad(c => c + 1)}
                  className="w-9 h-9 rounded-full border-2 border-border text-stone-600 hover:border-orange hover:text-orange transition-colors font-bold text-lg flex items-center justify-center">
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-2 mt-auto">
              <button onClick={handleAgregarAlCarrito}
                className="bg-orange hover:bg-orange-dark text-white font-inter font-semibold w-full py-4 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-base shadow-lg shadow-orange/20">
                <IconCarrito />
                Agregar al carrito
              </button>
              <button onClick={handlePedir}
                className="border-2 border-orange text-orange hover:bg-orange hover:text-white font-inter font-semibold w-full py-3 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-sm">
                <IconWhatsApp />
                Pedir por WhatsApp
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <p className="font-inter text-xs font-semibold text-stone-700">Compra segura</p>
                  <p className="font-inter text-xs text-stone-400">Tus datos protegidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🚚</span>
                <div>
                  <p className="font-inter text-xs font-semibold text-stone-700">Envío a todo el país</p>
                  <p className="font-inter text-xs text-stone-400">Andreani · Correo Arg.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-stone-900/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="24" y1="8" x2="8" y2="24"/><line x1="8" y1="8" x2="24" y2="24"/>
            </svg>
          </button>
          <img
            src={imagenActualConColor}
            alt={producto.nombre}
            className="max-w-full max-h-full object-contain rounded-xl"
            style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
    </svg>
  )
}

function IconCarrito() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}
