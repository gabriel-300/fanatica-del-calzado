import { useState, useRef } from 'react'
import { useBannersAdmin } from '../../hooks/useBanners'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const VACIO = {
  titulo: '',
  subtitulo: '',
  descripcion: '',
  badge: '',
  imagen_url: '',
  cta_texto: 'Ver catálogo',
  cta_link: '#catalogo',
  activo: true,
}

async function subirImagenBanner(archivo) {
  const ext = archivo.name.split('.').pop().toLowerCase()
  const nombre = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from('productos')
    .upload(nombre, archivo, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(data.path)
  return publicUrl
}

function PreviewSlide({ slide }) {
  return (
    <div className="bg-stone-50 rounded-xl border border-border p-3 flex items-center gap-3">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-orange-light to-caramel-light flex-shrink-0 flex items-center justify-center">
        {slide.imagen_url ? (
          <img src={slide.imagen_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <img src="/logo.png" alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {slide.badge && (
            <span className="bg-orange text-white font-inter text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
              {slide.badge}
            </span>
          )}
          <p className="font-playfair font-bold text-stone-900 text-sm truncate">{slide.titulo || '(sin título)'}</p>
          {slide.subtitulo && (
            <span className="font-inter text-xs italic text-orange truncate">{slide.subtitulo}</span>
          )}
        </div>
        {slide.descripcion && (
          <p className="font-inter text-xs text-stone-400 truncate mt-0.5">{slide.descripcion}</p>
        )}
      </div>
    </div>
  )
}

export default function Banners() {
  const { banners, cargando, crear, editar, eliminar, toggleActivo, moverArriba, moverAbajo } = useBannersAdmin()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [bannerEditando, setBannerEditando] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const inputImgRef = useRef()

  const campo = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const abrirNuevo = () => {
    setBannerEditando(null)
    setForm({ ...VACIO })
    setModalAbierto(true)
  }

  const abrirEditar = (b) => {
    setBannerEditando(b)
    setForm({
      titulo: b.titulo || '',
      subtitulo: b.subtitulo || '',
      descripcion: b.descripcion || '',
      badge: b.badge || '',
      imagen_url: b.imagen_url || '',
      cta_texto: b.cta_texto || 'Ver catálogo',
      cta_link: b.cta_link || '#catalogo',
      activo: b.activo ?? true,
    })
    setModalAbierto(true)
  }

  const handleImagen = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendoImg(true)
    try {
      const url = await subirImagenBanner(archivo)
      setForm(f => ({ ...f, imagen_url: url }))
      toast.success('Imagen subida')
    } catch (err) {
      toast.error('Error subiendo imagen: ' + err.message)
    } finally {
      setSubiendoImg(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { toast.error('El título es obligatorio'); return }
    setGuardando(true)
    const datos = {
      titulo: form.titulo.trim(),
      subtitulo: form.subtitulo.trim(),
      descripcion: form.descripcion.trim(),
      badge: form.badge.trim(),
      imagen_url: form.imagen_url,
      cta_texto: form.cta_texto.trim() || 'Ver catálogo',
      cta_link: form.cta_link.trim() || '#catalogo',
      activo: form.activo,
    }
    const ok = bannerEditando
      ? await editar(bannerEditando.id, datos)
      : await crear(datos)
    if (ok) setModalAbierto(false)
    setGuardando(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900">Banners / Carrusel</h1>
          <p className="font-inter text-sm text-stone-400">
            {banners.length} slide{banners.length !== 1 ? 's' : ''} · Visible en la página principal
          </p>
        </div>
        <button onClick={abrirNuevo} className="btn-orange text-sm">
          + Nuevo banner
        </button>
      </div>

      {/* Ayuda */}
      <div className="bg-orange-light border border-orange/20 rounded-xl p-4 mb-6 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">💡</span>
        <div className="font-inter text-sm text-stone-600">
          <p className="font-semibold mb-0.5">¿Cómo usar los banners?</p>
          <p className="text-stone-500">
            Cada banner es un slide del carrusel. Podés crear promos ("20% OFF"), destacar nuevas llegadas o cambiar el mensaje principal. Usá las flechas para reordenar. Los inactivos no aparecen en la tienda.
          </p>
        </div>
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-8 flex-shrink-0" />
                <div className="w-14 h-14 bg-border/40 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border/40 rounded w-1/3" />
                  <div className="h-3 bg-border/40 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-border">
          <span className="text-5xl block mb-3">🖼️</span>
          <p className="font-playfair text-xl text-stone-400 mb-1">Sin banners todavía</p>
          <p className="font-inter text-sm text-stone-400 mb-5">
            Mientras no haya banners, se muestra el slide por defecto de la tienda.
          </p>
          <button onClick={abrirNuevo} className="btn-orange text-sm">
            Crear primer banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div key={b.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 flex items-center gap-3">

                {/* Flechas reorden */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => moverArriba(i)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-25 transition-colors"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className="font-inter text-[10px] text-stone-300 text-center leading-none">{i + 1}</span>
                  <button
                    onClick={() => moverAbajo(i)}
                    disabled={i === banners.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-25 transition-colors"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Preview */}
                <div className="flex-1 min-w-0">
                  <PreviewSlide slide={b} />
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActivo(b.id, !b.activo)}
                    className={`font-inter text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      b.activo
                        ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {b.activo ? '● Activo' : '○ Inactivo'}
                  </button>

                  <button
                    onClick={() => abrirEditar(b)}
                    className="font-inter text-xs text-stone-500 hover:text-orange transition-colors px-2 py-1.5 border border-border rounded-lg hover:border-orange"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => setConfirmEliminar(b.id)}
                    className="font-inter text-xs text-stone-400 hover:text-red-500 transition-colors px-2 py-1.5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Confirmar eliminación */}
              {confirmEliminar === b.id && (
                <div className="bg-red-50 border-t border-red-100 px-5 py-3 flex items-center justify-between">
                  <p className="font-inter text-sm text-red-600 font-medium">¿Eliminar este banner?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmEliminar(null)}
                      className="font-inter text-xs text-stone-500 hover:text-stone-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => { await eliminar(b.id); setConfirmEliminar(null) }}
                      className="font-inter text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal crear / editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setModalAbierto(false)}
          />

          <div className="relative bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto flex flex-col">
            {/* Encabezado */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="font-playfair text-xl font-bold text-stone-900">
                {bannerEditando ? 'Editar banner' : 'Nuevo banner'}
              </h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-stone-400 hover:text-stone-700 transition-colors"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="flex-1 px-6 py-6 space-y-5">

                {/* Vista previa en tiempo real */}
                {(form.titulo || form.badge) && (
                  <div>
                    <p className="font-inter text-xs text-stone-400 uppercase tracking-wider mb-2">Vista previa</p>
                    <PreviewSlide slide={form} />
                  </div>
                )}

                {/* Badge */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Badge / Promoción
                    <span className="ml-1 text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={campo('badge')}
                    placeholder="Ej: 20% OFF · NUEVA LLEGADA · VERANO 2025"
                    className="input-base"
                    maxLength={40}
                  />
                  <p className="font-inter text-xs text-stone-400 mt-1">
                    Aparece como chip naranja arriba del título
                  </p>
                </div>

                {/* Título */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Título <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={campo('titulo')}
                    placeholder="Ej: Liquidación de temporada"
                    className="input-base"
                    required
                    maxLength={60}
                  />
                </div>

                {/* Subtítulo */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Subtítulo en naranja
                    <span className="ml-1 text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.subtitulo}
                    onChange={campo('subtitulo')}
                    placeholder="Ej: hasta 40% de descuento."
                    className="input-base"
                    maxLength={60}
                  />
                  <p className="font-inter text-xs text-stone-400 mt-1">
                    Aparece en itálica naranja debajo del título principal
                  </p>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Descripción
                    <span className="ml-1 text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={campo('descripcion')}
                    placeholder="Ej: Aprovechá los precios de fin de temporada en zapatillas y botas."
                    className="input-base resize-none"
                    rows={2}
                    maxLength={180}
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Imagen del lado derecho
                    <span className="ml-1 text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <div className="flex gap-3 items-center">
                    {form.imagen_url && (
                      <div className="relative group w-16 h-16 flex-shrink-0">
                        <img
                          src={form.imagen_url}
                          alt="preview"
                          className="w-full h-full object-cover rounded-xl border-2 border-orange"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, imagen_url: '' }))}
                          className="absolute inset-0 bg-stone-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => inputImgRef.current?.click()}
                      disabled={subiendoImg}
                      className="flex items-center gap-2 font-inter text-sm text-stone-500 hover:text-orange border border-border hover:border-orange rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
                    >
                      {subiendoImg ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      )}
                      {subiendoImg ? 'Subiendo...' : form.imagen_url ? 'Cambiar imagen' : 'Subir imagen'}
                    </button>
                    <input
                      ref={inputImgRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImagen}
                      className="hidden"
                    />
                  </div>
                  {!form.imagen_url && (
                    <p className="font-inter text-xs text-stone-400 mt-1.5">
                      Sin imagen se muestra el logo de la tienda
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div>
                  <label className="block font-inter text-sm font-medium text-stone-700 mb-1.5">
                    Botón principal
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={form.cta_texto}
                        onChange={campo('cta_texto')}
                        placeholder="Ver catálogo"
                        className="input-base"
                        maxLength={30}
                      />
                      <p className="font-inter text-xs text-stone-400 mt-1">Texto del botón</p>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.cta_link}
                        onChange={campo('cta_link')}
                        placeholder="#catalogo"
                        className="input-base"
                      />
                      <p className="font-inter text-xs text-stone-400 mt-1">
                        Link (ej: #catalogo, #como-comprar)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activo toggle */}
                <div className="flex items-center justify-between py-3 border-t border-border">
                  <div>
                    <p className="font-inter text-sm font-medium text-stone-700">Visible en la tienda</p>
                    <p className="font-inter text-xs text-stone-400">Si está inactivo no aparece en el carrusel</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      form.activo ? 'bg-orange' : 'bg-stone-200'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                      form.activo ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Footer fijo */}
              <div className="px-6 py-4 border-t border-border bg-white sticky bottom-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 font-inter text-sm text-stone-600 border border-border rounded-full py-3 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 btn-orange text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : bannerEditando ? 'Guardar cambios' : 'Crear banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
