import { useState, useRef } from 'react'
import { useInstagramFotos } from '../../hooks/useInstagram'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

async function subirImagen(archivo) {
  const ext = archivo.name.split('.').pop().toLowerCase()
  const nombre = `instagram/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from('productos')
    .upload(nombre, archivo, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(data.path)
  return publicUrl
}

export default function InstagramAdmin() {
  const { fotos, cargando, agregarFoto, eliminarFoto, reordenar } = useInstagramFotos()
  const [url, setUrl] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const inputFileRef = useRef(null)

  const handleAgregarUrl = async () => {
    const u = url.trim()
    if (!u) return
    await agregarFoto(u)
    setUrl('')
  }

  const handleArchivos = async (archivos) => {
    if (!archivos?.length) return
    setSubiendo(true)
    try {
      for (const archivo of Array.from(archivos)) {
        const publicUrl = await subirImagen(archivo)
        await agregarFoto(publicUrl)
      }
    } catch (e) {
      toast.error('Error subiendo imagen: ' + e.message)
    } finally {
      setSubiendo(false)
      if (inputFileRef.current) inputFileRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleArchivos(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold text-stone-900">Instagram</h1>
        <p className="font-inter text-sm text-stone-400">
          {fotos.length} foto{fotos.length !== 1 ? 's' : ''} · Se muestran en la sección "Seguinos" de la tienda
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 max-w-2xl space-y-5">

        {/* Subir desde PC */}
        <div>
          <h2 className="font-inter text-sm font-semibold text-stone-700 mb-2">Subir desde tu PC</h2>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => !subiendo && inputFileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${subiendo ? 'border-orange/50 bg-orange/5 cursor-wait' : 'border-border hover:border-orange/50 hover:bg-cream/50'}`}
          >
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleArchivos(e.target.files)}
            />
            {subiendo ? (
              <p className="font-inter text-sm text-orange">Subiendo...</p>
            ) : (
              <>
                <svg className="mx-auto mb-2 text-stone-300" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <p className="font-inter text-sm text-stone-500">
                  Arrastrá imágenes acá o <span className="text-orange font-medium">hacé click</span>
                </p>
                <p className="font-inter text-xs text-stone-400 mt-1">Podés seleccionar varias a la vez</p>
              </>
            )}
          </div>
        </div>

        {/* Separador */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-inter text-xs text-stone-400">o por URL</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Agregar por URL */}
        <div>
          <h2 className="font-inter text-sm font-semibold text-stone-700 mb-2">Pegar link de imagen</h2>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAgregarUrl() } }}
              placeholder="https://ejemplo.com/foto.jpg"
              className="input-base flex-1"
            />
            <button
              onClick={handleAgregarUrl}
              disabled={!url.trim()}
              className="btn-orange text-sm px-4 whitespace-nowrap disabled:opacity-50"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de fotos */}
      {cargando ? (
        <div className="font-inter text-sm text-stone-400 py-8 text-center">Cargando...</div>
      ) : fotos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl">
          <p className="font-inter text-stone-400 text-sm">No hay fotos todavía. Subí la primera desde tu PC.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl">
          {fotos.map((foto, idx) => (
            <div key={foto.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden border border-border bg-cream">
                <img
                  src={foto.url}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-stone-900/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => reordenar(foto.id, 'arriba')}
                    disabled={idx === 0}
                    className="bg-white/90 hover:bg-white text-stone-700 rounded-lg p-1.5 disabled:opacity-30 transition-colors"
                    title="Mover izquierda"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 12L5 8l4-4"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => reordenar(foto.id, 'abajo')}
                    disabled={idx === fotos.length - 1}
                    className="bg-white/90 hover:bg-white text-stone-700 rounded-lg p-1.5 disabled:opacity-30 transition-colors"
                    title="Mover derecha"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12l4-4-4-4"/>
                    </svg>
                  </button>
                </div>

                {confirmEliminar === foto.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { eliminarFoto(foto.id); setConfirmEliminar(null) }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmEliminar(null)}
                      className="bg-white/90 hover:bg-white text-stone-700 text-xs px-2 py-1 rounded-lg transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmEliminar(foto.id)}
                    className="bg-red-500/90 hover:bg-red-500 text-white text-xs font-inter px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {/* Número */}
              <div className="absolute top-1.5 left-1.5 bg-stone-900/60 text-white text-xs font-inter w-5 h-5 rounded-full flex items-center justify-center">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
