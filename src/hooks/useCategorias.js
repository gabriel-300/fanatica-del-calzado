import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('nombre')
        .order('nombre')
      if (error) throw error
      setCategorias((data || []).map(c => c.nombre))
    } catch (e) {
      console.error('Error cargando categorias:', e)
      // Fallback con las categorías por defecto si falla la DB
      setCategorias(['Zapatillas', 'Sandalias', 'Botas', 'Accesorios'])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const agregarCategoria = async (nombre) => {
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) return false
    if (categorias.includes(nombreLimpio)) {
      toast.error('Esa categoría ya existe')
      return false
    }
    try {
      const { error } = await supabase
        .from('categorias')
        .insert([{ nombre: nombreLimpio }])
      if (error) throw error
      toast.success(`Categoría "${nombreLimpio}" agregada`)
      await cargar()
      return true
    } catch (e) {
      toast.error('Error agregando categoría: ' + e.message)
      return false
    }
  }

  const eliminarCategoria = async (nombre) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('nombre', nombre)
      if (error) throw error
      toast.success(`Categoría "${nombre}" eliminada`)
      await cargar()
    } catch (e) {
      toast.error('Error eliminando categoría: ' + e.message)
    }
  }

  return { categorias, cargando, agregarCategoria, eliminarCategoria, recargar: cargar }
}
