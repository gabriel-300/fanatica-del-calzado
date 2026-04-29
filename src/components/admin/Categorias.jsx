import { useState } from 'react'
import { useCategorias } from '../../hooks/useCategorias'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Categorias() {
  const { categorias, agregarCategoria, eliminarCategoria, recargar } = useCategorias()
  const [nueva, setNueva] = useState('')
  const [editando, setEditando] = useState(null) // nombre original
  const [editNombre, setEditNombre] = useState('')
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const handleAgregar = async () => {
    if (!nueva.trim()) return
    const ok = await agregarCategoria(nueva)
    if (ok) setNueva('')
  }

  const iniciarEditar = (nombre) => {
    setEditando(nombre)
    setEditNombre(nombre)
    setConfirmEliminar(null)
  }

  const guardarEdicion = async () => {
    const nuevoNombre = editNombre.trim()
    if (!nuevoNombre || nuevoNombre === editando) { setEditando(null); return }
    if (categorias.includes(nuevoNombre)) { toast.error('Esa categoría ya existe'); return }

    setGuardando(true)
    try {
      // Renombrar en tabla categorias
      const { error: e1 } = await supabase
        .from('categorias')
        .update({ nombre: nuevoNombre })
        .eq('nombre', editando)
      if (e1) throw e1

      // Actualizar todos los productos que tenían la categoría vieja
      const { error: e2 } = await supabase
        .from('productos')
        .update({ categoria: nuevoNombre })
        .eq('categoria', editando)
      if (e2) throw e2

      toast.success(`"${editando}" renombrada a "${nuevoNombre}"`)
      setEditando(null)
      await recargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    } finally {
      setGuardando(false)
    }
  }

  const confirmarEliminar = async (nombre) => {
    await eliminarCategoria(nombre)
    setConfirmEliminar(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold text-stone-900">Categorías</h1>
        <p className="font-inter text-sm text-stone-400">{categorias.length} categorías en total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 max-w-lg">

        {/* Agregar nueva */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={nueva}
            onChange={e => setNueva(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAgregar() } }}
            placeholder="Nueva categoría (ej: Alpargatas)"
            className="input-base flex-1"
          />
          <button onClick={handleAgregar}
            className="btn-orange text-sm px-4 whitespace-nowrap">
            + Agregar
          </button>
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {categorias.map(cat => (
            <div key={cat} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-cream/50 transition-colors">

              {editando === cat ? (
                /* Modo edición */
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editNombre}
                    onChange={e => setEditNombre(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') guardarEdicion(); if (e.key === 'Escape') setEditando(null) }}
                    className="input-base flex-1 py-1.5 text-sm"
                    autoFocus
                  />
                  <button onClick={guardarEdicion} disabled={guardando}
                    className="font-inter text-xs font-semibold text-white bg-orange hover:bg-orange-dark px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                    {guardando ? '...' : 'Guardar'}
                  </button>
                  <button onClick={() => setEditando(null)}
                    className="font-inter text-xs text-stone-400 hover:text-stone-700 px-2 py-1.5 transition-colors">
                    Cancelar
                  </button>
                </div>
              ) : (
                /* Modo normal */
                <>
                  <span className="font-inter text-sm font-medium text-stone-800 flex-1">{cat}</span>

                  {confirmEliminar === cat ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-inter text-xs text-stone-500">¿Eliminar?</span>
                      <button onClick={() => confirmarEliminar(cat)}
                        className="font-inter text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors">
                        Sí
                      </button>
                      <button onClick={() => setConfirmEliminar(null)}
                        className="font-inter text-xs text-stone-400 hover:text-stone-600 px-2 py-1 transition-colors">
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => iniciarEditar(cat)}
                        className="font-inter text-xs text-orange hover:text-orange-dark border border-orange/30 hover:border-orange px-3 py-1.5 rounded-lg transition-all">
                        Editar
                      </button>
                      <button onClick={() => setConfirmEliminar(cat)}
                        className="font-inter text-xs text-stone-300 hover:text-red-400 border border-stone-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all">
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {categorias.length === 0 && (
            <p className="text-center font-inter text-sm text-stone-300 py-6">
              No hay categorías. Agregá la primera.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
