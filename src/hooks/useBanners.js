import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useBanners() {
  const [banners, setBanners] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
      if (error) throw error
      setBanners(data || [])
    } catch (e) {
      console.error('Error cargando banners:', e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  return { banners, cargando, recargar: cargar }
}

export function useBannersAdmin() {
  const [banners, setBanners] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('orden', { ascending: true })
      if (error) throw error
      setBanners(data || [])
    } catch (e) {
      toast.error('Error cargando banners')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (datos) => {
    try {
      const maxOrden = banners.length > 0 ? Math.max(...banners.map(b => b.orden)) + 1 : 0
      const { error } = await supabase.from('banners').insert([{ ...datos, orden: maxOrden }])
      if (error) throw error
      toast.success('Banner creado')
      await cargar()
      return true
    } catch (e) {
      toast.error('Error: ' + e.message)
      return false
    }
  }

  const editar = async (id, datos) => {
    try {
      const { error } = await supabase.from('banners').update(datos).eq('id', id)
      if (error) throw error
      toast.success('Banner actualizado')
      await cargar()
      return true
    } catch (e) {
      toast.error('Error: ' + e.message)
      return false
    }
  }

  const eliminar = async (id) => {
    try {
      const { error } = await supabase.from('banners').delete().eq('id', id)
      if (error) throw error
      toast.success('Banner eliminado')
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  const toggleActivo = async (id, activo) => {
    try {
      const { error } = await supabase.from('banners').update({ activo }).eq('id', id)
      if (error) throw error
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    }
  }

  const moverArriba = async (idx) => {
    if (idx === 0) return
    const a = banners[idx]
    const b = banners[idx - 1]
    try {
      await Promise.all([
        supabase.from('banners').update({ orden: b.orden }).eq('id', a.id),
        supabase.from('banners').update({ orden: a.orden }).eq('id', b.id),
      ])
      await cargar()
    } catch (e) {
      toast.error('Error reordenando')
    }
  }

  const moverAbajo = async (idx) => {
    if (idx >= banners.length - 1) return
    const a = banners[idx]
    const b = banners[idx + 1]
    try {
      await Promise.all([
        supabase.from('banners').update({ orden: b.orden }).eq('id', a.id),
        supabase.from('banners').update({ orden: a.orden }).eq('id', b.id),
      ])
      await cargar()
    } catch (e) {
      toast.error('Error reordenando')
    }
  }

  return { banners, cargando, crear, editar, eliminar, toggleActivo, moverArriba, moverAbajo, recargar: cargar }
}
