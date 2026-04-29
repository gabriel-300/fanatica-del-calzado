import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useInstagramFotos() {
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('instagram_fotos')
        .select('*')
        .order('orden')
      if (error) throw error
      setFotos(data || [])
    } catch (e) {
      console.error('Error cargando fotos Instagram:', e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const agregarFoto = async (url) => {
    try {
      const maxOrden = fotos.length > 0 ? Math.max(...fotos.map(f => f.orden)) + 1 : 0
      const { error } = await supabase
        .from('instagram_fotos')
        .insert([{ url, orden: maxOrden }])
      if (error) throw error
      toast.success('Foto agregada')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  const eliminarFoto = async (id) => {
    try {
      const { error } = await supabase.from('instagram_fotos').delete().eq('id', id)
      if (error) throw error
      toast.success('Foto eliminada')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  const reordenar = async (id, direccion) => {
    const idx = fotos.findIndex(f => f.id === id)
    const destIdx = direccion === 'arriba' ? idx - 1 : idx + 1
    if (destIdx < 0 || destIdx >= fotos.length) return
    const a = fotos[idx], b = fotos[destIdx]
    try {
      await Promise.all([
        supabase.from('instagram_fotos').update({ orden: b.orden }).eq('id', a.id),
        supabase.from('instagram_fotos').update({ orden: a.orden }).eq('id', b.id),
      ])
      await cargar()
    } catch (e) {
      toast.error('Error reordenando')
    }
  }

  return { fotos, cargando, agregarFoto, eliminarFoto, reordenar, recargar: cargar }
}
