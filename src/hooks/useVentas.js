import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useVentas() {
  const [ventas, setVentas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setVentas(data || [])
    } catch (e) {
      toast.error('Error cargando ventas: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const registrarVenta = async ({ producto_id, producto_nombre, talle, cantidad, precio, metodo_pago }) => {
    try {
      // Verificar stock actual
      const { data: stockData, error: errStock } = await supabase
        .from('stock')
        .select('cantidad')
        .eq('producto_id', producto_id)
        .eq('talle', talle)
        .single()
      if (errStock) throw errStock

      const cantidadActual = stockData?.cantidad || 0
      if (cantidadActual < cantidad) {
        toast.error(`Stock insuficiente. Quedan ${cantidadActual} en talle ${talle}`)
        return false
      }

      // Insertar venta
      const { error: errVenta } = await supabase
        .from('ventas')
        .insert([{ producto_id, producto_nombre, talle, cantidad, precio, metodo_pago }])
      if (errVenta) throw errVenta

      // Descontar stock
      const { error: errUpdate } = await supabase
        .from('stock')
        .update({ cantidad: cantidadActual - cantidad })
        .eq('producto_id', producto_id)
        .eq('talle', talle)
      if (errUpdate) throw errUpdate

      toast.success('Venta registrada')
      await cargar()
      return true
    } catch (e) {
      toast.error('Error al registrar: ' + e.message)
      return false
    }
  }

  const eliminarVenta = async (id, { producto_id, talle, cantidad }) => {
    try {
      // Devolver stock
      const { data: stockData } = await supabase
        .from('stock')
        .select('cantidad')
        .eq('producto_id', producto_id)
        .eq('talle', talle)
        .single()

      const { error: errVenta } = await supabase.from('ventas').delete().eq('id', id)
      if (errVenta) throw errVenta

      if (stockData) {
        await supabase
          .from('stock')
          .update({ cantidad: (stockData.cantidad || 0) + cantidad })
          .eq('producto_id', producto_id)
          .eq('talle', talle)
      }

      toast.success('Venta eliminada y stock repuesto')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  return { ventas, cargando, registrarVenta, eliminarVenta, recargar: cargar }
}
