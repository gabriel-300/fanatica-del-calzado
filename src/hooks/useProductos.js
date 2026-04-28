import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// Devuelve productos activos con su stock agrupado por talle
export function useProductos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('productos')
        .select(`*, stock(talle, cantidad)`)
        .eq('activo', true)
        .order('created_at', { ascending: false })

      if (err) throw err

      // Solo muestra productos con al menos un talle con stock > 0
      const conStock = (data || []).filter(p =>
        p.stock && p.stock.some(s => s.cantidad > 0)
      )
      setProductos(conStock)
    } catch (e) {
      setError(e.message)
      console.error('Error cargando productos:', e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { productos, cargando, error, recargar: cargar }
}

// Todos los productos para el panel admin (activos e inactivos)
export function useProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('productos')
        .select(`*, stock(talle, cantidad)`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProductos(data || [])
    } catch (e) {
      toast.error('Error cargando productos: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crearProducto = async (datos, stockPorTalle) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([datos])
        .select()
        .single()
      if (error) throw error

      // Insertar stock por talle
      await guardarStock(data.id, stockPorTalle)
      toast.success('Producto creado')
      await cargar()
      return true
    } catch (e) {
      toast.error('Error creando producto: ' + e.message)
      return false
    }
  }

  const editarProducto = async (id, datos, stockPorTalle) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update(datos)
        .eq('id', id)
      if (error) throw error

      await guardarStock(id, stockPorTalle)
      toast.success('Producto actualizado')
      await cargar()
      return true
    } catch (e) {
      toast.error('Error actualizando producto: ' + e.message)
      return false
    }
  }

  const toggleActivo = async (id, activo) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo })
        .eq('id', id)
      if (error) throw error
      toast.success(activo ? 'Producto activado' : 'Producto desactivado')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  const eliminarProducto = async (id) => {
    try {
      // Eliminar stock primero (FK constraint)
      await supabase.from('stock').delete().eq('producto_id', id)
      const { error } = await supabase.from('productos').delete().eq('id', id)
      if (error) throw error
      toast.success('Producto eliminado')
      await cargar()
    } catch (e) {
      toast.error('Error eliminando producto: ' + e.message)
    }
  }

  return { productos, cargando, crearProducto, editarProducto, eliminarProducto, toggleActivo, recargar: cargar }
}

// Hace upsert del stock de todos los talles de un producto
async function guardarStock(productoId, stockPorTalle) {
  const filas = Object.entries(stockPorTalle).map(([talle, cantidad]) => ({
    producto_id: productoId,
    talle,
    cantidad: parseInt(cantidad) || 0,
  }))

  if (!filas.length) return

  const { error } = await supabase
    .from('stock')
    .upsert(filas, { onConflict: 'producto_id,talle' })
  if (error) throw error
}
