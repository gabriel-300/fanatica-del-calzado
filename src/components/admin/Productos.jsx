import { useState, useRef } from 'react'
import { useProductosAdmin } from '../../hooks/useProductos'
import { useCategorias } from '../../hooks/useCategorias'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ETIQUETAS = ['', 'Nuevo', 'Últimas unidades']
const TALLES_ESTANDAR = ['35', '36', '37', '38', '39', '40', '41']

const VACIO = {
  nombre: '', descripcion: '', categoria: '',
  precio: '', imagenes: [], etiqueta: '', activo: true,
  precio_costo: null, costo_reales: null, cotizacion: null, flete: null, ganancia_pct: null,
}

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

async function subirImagen(archivo) {
  const ext = archivo.name.split('.').pop().toLowerCase()
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from('productos')
    .upload(nombre, archivo, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(data.path)
  return publicUrl
}

// Multi-imagen: hasta 5 fotos, primera = principal
function SelectorImagenes({ imagenes, onChange }) {
  const [subiendo, setSubiendo] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const inputRef = useRef()

  const handleArchivo = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (imagenes.length >= 5) { toast.error('Máximo 5 imágenes'); return }
    setSubiendo(true)
    try {
      const url = await subirImagen(archivo)
      onChange([...imagenes, url])
      toast.success('Imagen subida')
    } catch (err) {
      toast.error('Error subiendo imagen: ' + err.message)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  const agregarUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!url.startsWith('http')) { toast.error('La URL debe empezar con http'); return }
    if (imagenes.length >= 5) { toast.error('Máximo 5 imágenes'); return }
    if (imagenes.includes(url)) { toast.error('Esa imagen ya está agregada'); return }
    onChange([...imagenes, url])
    setUrlInput('')
  }

  const quitarImagen = (idx) => onChange(imagenes.filter((_, i) => i !== idx))

  const moverPrincipal = (idx) => {
    if (idx === 0) return
    const nueva = [...imagenes]
    const [item] = nueva.splice(idx, 1)
    nueva.unshift(item)
    onChange(nueva)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {imagenes.map((url, idx) => (
          <div key={idx} className="relative group w-20 h-20 flex-shrink-0">
            <img src={url} alt={`Imagen ${idx + 1}`}
              className={`w-full h-full object-cover rounded-xl border-2 transition-all ${
                idx === 0 ? 'border-orange' : 'border-border'
              }`} />

            {idx === 0 && (
              <span className="absolute -top-1.5 -left-1.5 bg-orange text-white text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full leading-none">
                Principal
              </span>
            )}

            <div className="absolute inset-0 bg-stone-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
              {idx !== 0 && (
                <button type="button" onClick={() => moverPrincipal(idx)}
                  title="Hacer principal"
                  className="text-white text-xs bg-orange/80 hover:bg-orange rounded-full px-2 py-0.5 font-inter leading-none">
                  ★
                </button>
              )}
              <button type="button" onClick={() => quitarImagen(idx)}
                title="Quitar"
                className="text-white text-xs bg-red-500/80 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center leading-none">
                ✕
              </button>
            </div>
          </div>
        ))}

        {imagenes.length < 5 && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={subiendo}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-orange text-stone-400 hover:text-orange transition-colors flex flex-col items-center justify-center gap-1 flex-shrink-0">
            {subiendo ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <>
                <span className="text-xl font-bold leading-none">+</span>
                <span className="font-inter text-[10px]">Foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleArchivo} className="hidden" />

      {/* Input de URL */}
      {imagenes.length < 5 && (
        <div className="flex gap-1.5 mt-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarUrl() } }}
            placeholder="O pegá un link de imagen (https://...)"
            className="input-base flex-1 text-xs py-1.5"
          />
          <button type="button" onClick={agregarUrl}
            className="flex-shrink-0 px-3 py-1.5 bg-orange text-white text-xs font-inter rounded-lg hover:bg-orange-dark transition-colors">
            +
          </button>
        </div>
      )}

      {imagenes.length > 0 && (
        <p className="font-inter text-xs text-stone-400 mt-1">
          {imagenes.length}/5 imágenes · Hover para quitar o marcar como principal
        </p>
      )}
      {imagenes.length === 0 && (
        <p className="font-inter text-xs text-stone-400 mt-1">Subí una foto o pegá un link de imagen</p>
      )}
    </div>
  )
}

function StockTalles({ stockForm, setStockForm }) {
  const [nuevoTalle, setNuevoTalle] = useState('')

  const tallesActuales = Object.keys(stockForm)

  const agregarTalle = (talle) => {
    const t = talle.trim()
    if (!t) return
    if (stockForm.hasOwnProperty(t)) { toast.error(`El talle "${t}" ya existe`); return }
    setStockForm(s => ({ ...s, [t]: 0 }))
    setNuevoTalle('')
  }

  const quitarTalle = (talle) => {
    setStockForm(s => { const n = { ...s }; delete n[talle]; return n })
  }

  const agregarTodosEstandar = () => {
    setStockForm(s => {
      const n = { ...s }
      TALLES_ESTANDAR.forEach(t => { if (!n.hasOwnProperty(t)) n[t] = 0 })
      return n
    })
  }

  const tallesOrdenados = tallesActuales.sort((a, b) => {
    const aNum = parseInt(a), bNum = parseInt(b)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    if (!isNaN(aNum)) return -1
    if (!isNaN(bNum)) return 1
    return a.localeCompare(b)
  })

  return (
    <div>
      <p className="text-sm text-stone-500 mb-2 font-medium">Stock por talle</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <button type="button" onClick={agregarTodosEstandar}
          className="text-xs font-inter px-3 py-1.5 rounded-full border border-border text-stone-500 hover:border-orange hover:text-orange transition-colors">
          + Todos (35–41)
        </button>
        {!stockForm.hasOwnProperty('Único') && (
          <button type="button" onClick={() => agregarTalle('Único')}
            className="text-xs font-inter px-3 py-1.5 rounded-full border border-border text-stone-500 hover:border-orange hover:text-orange transition-colors">
            + Único
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-3">
        <input type="text" value={nuevoTalle} onChange={e => setNuevoTalle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarTalle(nuevoTalle) } }}
          placeholder="Agregar talle (ej: 42, XL…)" className="input-base flex-1 text-sm py-1.5" />
        <button type="button" onClick={() => agregarTalle(nuevoTalle)}
          className="px-3 py-1.5 bg-orange text-white text-sm rounded-lg hover:bg-orange-dark transition-colors font-inter">
          +
        </button>
      </div>
      {tallesOrdenados.length === 0 ? (
        <p className="text-xs text-stone-400 text-center py-3 border border-dashed border-border rounded-lg">
          Agregá talles con los botones de arriba
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {tallesOrdenados.map(t => (
            <div key={t} className="relative">
              <label className="block text-xs text-stone-400 mb-1 text-center">T. {t}</label>
              <div className="relative">
                <input type="number" min="0"
                  value={stockForm[t] ?? 0}
                  onChange={e => setStockForm(s => ({ ...s, [t]: parseInt(e.target.value) || 0 }))}
                  className="input-base text-center text-sm py-1.5 px-2 pr-5" />
                <button type="button" onClick={() => quitarTalle(t)}
                  className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-stone-300 hover:text-red-400 transition-colors text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CALC_KEY = 'fanatica_calc'

function CalculadorPrecio({ onAplicar, initialValues = {} }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(CALC_KEY)) || {} } catch { return {} } })()

  const [abierto,     setAbierto]     = useState(false)
  const [reales,      setReales]      = useState(initialValues.costo_reales ?? '')
  const [cotizacion,  setCotizacion]  = useState(initialValues.cotizacion  ?? saved.cotizacion  ?? 300)
  const [flete,       setFlete]       = useState(initialValues.flete       ?? saved.flete       ?? 3500)
  const [ganancia,    setGanancia]    = useState(initialValues.ganancia_pct ?? saved.ganancia    ?? 30)

  // Persiste configuración al cambiar
  const guardar = (key, val) => {
    const cfg = (() => { try { return JSON.parse(localStorage.getItem(CALC_KEY)) || {} } catch { return {} } })()
    localStorage.setItem(CALC_KEY, JSON.stringify({ ...cfg, [key]: val }))
  }

  const costoARS    = (parseFloat(reales) || 0) * (parseFloat(cotizacion) || 0)
  const costoTotal  = costoARS + (parseFloat(flete) || 0)
  const precioFinal = costoTotal * (1 + (parseFloat(ganancia) || 0) / 100)
  const listo       = reales > 0 && precioFinal > 0

  const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setAbierto(a => !a)}
        className="flex items-center gap-1.5 font-inter text-xs text-orange hover:text-orange-dark transition-colors"
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 1l5 5-5 5M7 6h5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {abierto ? 'Ocultar calculadora' : 'Calcular desde R$ (reales)'}
      </button>

      {abierto && (
        <div className="mt-2 bg-orange-light border border-orange/20 rounded-xl p-4 space-y-3">
          <p className="font-inter text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Calculadora de precio
          </p>

          {/* Fila 1: reales + cotización */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-inter text-xs text-stone-500 mb-1">Precio en R$</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-inter text-xs text-stone-400">R$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={reales}
                  onChange={e => setReales(e.target.value)}
                  className="input-base pl-8 py-2 text-sm"
                  placeholder="50"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="block font-inter text-xs text-stone-500 mb-1">Cotización (ARS/R$)</label>
              <input
                type="number" min="0" step="1"
                value={cotizacion}
                onChange={e => { setCotizacion(e.target.value); guardar('cotizacion', e.target.value) }}
                className="input-base py-2 text-sm"
                placeholder="300"
              />
            </div>
          </div>

          {/* Fila 2: flete + ganancia */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-inter text-xs text-stone-500 mb-1">Flete (ARS)</label>
              <input
                type="number" min="0" step="100"
                value={flete}
                onChange={e => { setFlete(e.target.value); guardar('flete', e.target.value) }}
                className="input-base py-2 text-sm"
                placeholder="3500"
              />
            </div>
            <div>
              <label className="block font-inter text-xs text-stone-500 mb-1">Ganancia (%)</label>
              <div className="relative">
                <input
                  type="number" min="0" step="1"
                  value={ganancia}
                  onChange={e => { setGanancia(e.target.value); guardar('ganancia', e.target.value) }}
                  className="input-base py-2 text-sm pr-7"
                  placeholder="30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-inter text-xs text-stone-400">%</span>
              </div>
            </div>
          </div>

          {/* Resultado */}
          {reales > 0 && (
            <div className="bg-white rounded-lg p-3 border border-orange/20 space-y-1">
              <div className="flex justify-between font-inter text-xs text-stone-500">
                <span>Conversión (R${reales} × {cotizacion})</span>
                <span>{fmt(costoARS)}</span>
              </div>
              <div className="flex justify-between font-inter text-xs text-stone-500">
                <span>+ Flete</span>
                <span>{fmt(parseFloat(flete) || 0)}</span>
              </div>
              <div className="flex justify-between font-inter text-xs text-stone-500 border-t border-border pt-1">
                <span>Costo total</span>
                <span className="font-semibold text-stone-700">{fmt(costoTotal)}</span>
              </div>
              <div className="flex justify-between font-inter text-sm font-bold text-orange border-t border-border pt-1">
                <span>Precio final (+{ganancia}%)</span>
                <span>{fmt(precioFinal)}</span>
              </div>
            </div>
          )}

          {listo && (
            <button
              type="button"
              onClick={() => {
                onAplicar({
                  precio:       Math.round(precioFinal),
                  precio_costo: Math.round(costoTotal),
                  costo_reales: parseFloat(reales),
                  cotizacion:   parseFloat(cotizacion),
                  flete:        parseFloat(flete),
                  ganancia_pct: parseFloat(ganancia),
                })
                setAbierto(false)
              }}
              className="w-full bg-orange hover:bg-orange-dark text-white font-inter font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              Aplicar {fmt(Math.round(precioFinal))}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function Productos() {
  const { productos, cargando, crearProducto, editarProducto, eliminarProducto, toggleActivo } = useProductosAdmin()
  const { categorias, agregarCategoria } = useCategorias()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [stockForm, setStockForm] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [nuevaCat, setNuevaCat] = useState('')
  const [mostrarNuevaCat, setMostrarNuevaCat] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const handleAgregarCategoria = async () => {
    const ok = await agregarCategoria(nuevaCat)
    if (ok) {
      setForm(f => ({ ...f, categoria: nuevaCat.trim() }))
      setNuevaCat('')
      setMostrarNuevaCat(false)
    }
  }

  const abrirNuevo = () => {
    setProductoEditando(null)
    setForm({ ...VACIO, categoria: categorias[0] || '', imagenes: [] })
    setStockForm({})
    setMostrarNuevaCat(false)
    setNuevaCat('')
    setModalAbierto(true)
  }

  const abrirEditar = (p) => {
    setProductoEditando(p)
    setMostrarNuevaCat(false)
    setNuevaCat('')
    // Reconstruir array de imágenes: imagen_url + imagenes[] sin duplicados
    const imgs = [p.imagen_url, ...((p.imagenes) || [])]
      .filter(Boolean)
      .filter((url, i, arr) => arr.indexOf(url) === i)
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      categoria: p.categoria || '',
      precio: p.precio || '',
      imagenes: imgs,
      etiqueta: p.etiqueta || '',
      activo: p.activo ?? true,
      precio_costo: p.precio_costo ?? null,
      costo_reales: p.costo_reales ?? null,
      cotizacion:   p.cotizacion   ?? null,
      flete:        p.flete        ?? null,
      ganancia_pct: p.ganancia_pct ?? null,
    })
    const stockActual = {}
    ;(p.stock || []).forEach(s => { stockActual[s.talle] = s.cantidad })
    setStockForm(stockActual)
    setModalAbierto(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre || !form.precio) { toast.error('Nombre y precio son obligatorios'); return }
    setGuardando(true)
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: parseFloat(form.precio) || 0,
      etiqueta: form.etiqueta || null,
      activo: form.activo,
      imagen_url: form.imagenes[0] || null,
      imagenes: form.imagenes,
      precio_costo: form.precio_costo ?? null,
      costo_reales: form.costo_reales ?? null,
      cotizacion:   form.cotizacion   ?? null,
      flete:        form.flete        ?? null,
      ganancia_pct: form.ganancia_pct ?? null,
    }
    let ok
    if (productoEditando) {
      ok = await editarProducto(productoEditando.id, datos, stockForm)
    } else {
      ok = await crearProducto(datos, stockForm)
    }
    if (ok) setModalAbierto(false)
    setGuardando(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900">Productos</h1>
          <p className="font-inter text-sm text-stone-400">{productos.length} productos en total</p>
        </div>
        <button onClick={abrirNuevo} className="btn-orange text-sm">+ Nuevo producto</button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center font-inter text-stone-400">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b border-border">
                <tr>
                  {['Producto','Categoría','Precio','Etiqueta','Estado','Acciones'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-inter text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {productos.map(p => (
                  <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imagen_url ? (
                          <img src={p.imagen_url} alt={p.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg flex-shrink-0">👠</div>
                        )}
                        <div>
                          <span className="font-inter text-sm font-medium text-stone-800">{p.nombre}</span>
                          {p.imagenes?.length > 0 && (
                            <p className="font-inter text-xs text-stone-400">{p.imagenes.length + 1} fotos</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-stone-500">{p.categoria}</td>
                    <td className="px-4 py-3">
                      <span className="font-inter text-sm font-semibold text-orange">{formatPrecio(p.precio)}</span>
                      {p.precio_costo > 0 && (
                        <div className="font-inter text-xs text-stone-400 leading-tight mt-0.5">
                          costo {formatPrecio(p.precio_costo)}
                          {p.ganancia_pct > 0 && (
                            <span className="ml-1.5 text-green-600 font-medium">
                              · desc. máx {Math.round(p.ganancia_pct / (1 + p.ganancia_pct / 100))}%
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.etiqueta && (
                        <span className={`badge-etiqueta ${p.etiqueta === 'Nuevo' ? 'bg-orange-light text-orange-dark' : 'bg-caramel-light text-caramel-dark'}`}>
                          {p.etiqueta}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActivo(p.id, !p.activo)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${p.activo ? 'bg-orange' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${p.activo ? 'translate-x-4' : 'translate-x-0.5'}`}/>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => abrirEditar(p)}
                          className="font-inter text-xs text-orange hover:text-orange-dark border border-orange/30 hover:border-orange px-3 py-1.5 rounded-lg transition-all">
                          Editar
                        </button>
                        {confirmEliminar === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={async () => { await eliminarProducto(p.id); setConfirmEliminar(null) }}
                              className="font-inter text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmEliminar(null)}
                              className="font-inter text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmEliminar(p.id)}
                            className="font-inter text-xs text-stone-300 hover:text-red-400 border border-stone-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center font-inter text-stone-300">Sin productos. Creá el primero.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6">
            <button onClick={() => setModalAbierto(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <h2 className="font-playfair text-2xl font-bold text-stone-900 mb-5">
              {productoEditando ? 'Editar producto' : 'Nuevo producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-stone-500 mb-1">Nombre *</label>
                <input className="input-base" value={form.nombre}
                  onChange={e => setForm(f => ({...f, nombre: e.target.value}))} required />
              </div>

              <div>
                <label className="block text-sm text-stone-500 mb-1">Descripción</label>
                <textarea className="input-base resize-none" rows={2} value={form.descripcion}
                  onChange={e => setForm(f => ({...f, descripcion: e.target.value}))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone-500 mb-1">Categoría *</label>
                  {!mostrarNuevaCat ? (
                    <div className="flex gap-1.5">
                      <select className="input-base flex-1" value={form.categoria}
                        onChange={e => setForm(f => ({...f, categoria: e.target.value}))}>
                        {categorias.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <button type="button" onClick={() => setMostrarNuevaCat(true)}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-orange hover:text-orange text-stone-400 transition-all text-lg">
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input type="text" value={nuevaCat} onChange={e => setNuevaCat(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAgregarCategoria() } }}
                        placeholder="Ej: Carteras" className="input-base flex-1" autoFocus />
                      <button type="button" onClick={handleAgregarCategoria}
                        className="flex-shrink-0 px-2.5 rounded-lg bg-orange text-white text-xs font-medium hover:bg-orange-dark transition-colors">OK</button>
                      <button type="button" onClick={() => { setMostrarNuevaCat(false); setNuevaCat('') }}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-border text-stone-400 hover:text-stone-700 transition-colors text-sm">✕</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-stone-500 mb-1">Precio (ARS) *</label>
                  <input type="number" className="input-base" value={form.precio}
                    onChange={e => setForm(f => ({...f, precio: e.target.value}))} min="0" required />
                  <CalculadorPrecio
                    initialValues={{
                      costo_reales: form.costo_reales,
                      cotizacion:   form.cotizacion,
                      flete:        form.flete,
                      ganancia_pct: form.ganancia_pct,
                    }}
                    onAplicar={datos => setForm(f => ({ ...f,
                      precio:       datos.precio,
                      precio_costo: datos.precio_costo,
                      costo_reales: datos.costo_reales,
                      cotizacion:   datos.cotizacion,
                      flete:        datos.flete,
                      ganancia_pct: datos.ganancia_pct,
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-stone-500 mb-1">Etiqueta</label>
                  <select className="input-base" value={form.etiqueta}
                    onChange={e => setForm(f => ({...f, etiqueta: e.target.value}))}>
                    {ETIQUETAS.map(e => <option key={e} value={e}>{e || '— Sin etiqueta —'}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.activo}
                      onChange={e => setForm(f => ({...f, activo: e.target.checked}))}
                      className="w-4 h-4 accent-orange" />
                    <span className="font-inter text-sm text-stone-600">Activo en tienda</span>
                  </label>
                </div>
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm text-stone-500 mb-2">
                  Fotos del producto
                  <span className="text-stone-400 font-normal ml-1">(la primera es la principal)</span>
                </label>
                <SelectorImagenes
                  imagenes={form.imagenes}
                  onChange={imgs => setForm(f => ({ ...f, imagenes: imgs }))}
                />
              </div>

              <StockTalles stockForm={stockForm} setStockForm={setStockForm} />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-outline flex-1 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn-orange flex-1 text-sm disabled:opacity-60">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
