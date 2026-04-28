import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function usePedidos(filtroEstado = null) {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      let query = supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtroEstado) query = query.eq('estado', filtroEstado)

      const { data, error } = await query
      if (error) throw error
      setPedidos(data || [])
    } catch (e) {
      toast.error('Error cargando pedidos: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [filtroEstado])

  useEffect(() => { cargar() }, [cargar])

  const cambiarEstado = async (id, estado) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado })
        .eq('id', id)
      if (error) throw error
      toast.success('Estado actualizado')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  return { pedidos, cargando, cambiarEstado, recargar: cargar }
}

// Guarda un pedido nuevo y hace upsert del cliente
export async function crearPedido({ producto, talle, cliente }) {
  // Upsert cliente por teléfono
  await supabase
    .from('clientes')
    .upsert(
      [{ nombre: cliente.nombre, telefono: cliente.telefono }],
      { onConflict: 'telefono', ignoreDuplicates: false }
    )

  const { error } = await supabase
    .from('pedidos')
    .insert([{
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      talle,
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
    }])

  if (error) throw error
}
