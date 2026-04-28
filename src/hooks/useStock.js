import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TALLES_ESTANDAR = ['35', '36', '37', '38', '39', '40', '41']

export function useStock(productoId) {
  const [stock, setStock] = useState([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState({})
  const debounceRef = useRef({})

  const cargar = useCallback(async () => {
    if (!productoId) { setStock([]); return }
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('producto_id', productoId)
        .order('talle')
      if (error) throw error

      const existentes = data || []
      const tallesEnDB = existentes.map(s => s.talle)

      if (existentes.length === 0) {
        // Producto nuevo sin stock: muestra talles estándar vacíos
        setStock(TALLES_ESTANDAR.map(t => ({ talle: t, cantidad: 0, producto_id: productoId })))
      } else {
        // Muestra los talles reales de la DB + agrega estándar faltantes
        const faltantes = TALLES_ESTANDAR
          .filter(t => !tallesEnDB.includes(t))
          .map(t => ({ talle: t, cantidad: 0, producto_id: productoId }))

        const todos = [...existentes, ...faltantes].sort((a, b) => {
          const aNum = parseInt(a.talle)
          const bNum = parseInt(b.talle)
          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
          if (!isNaN(aNum)) return -1
          if (!isNaN(bNum)) return 1
          return a.talle.localeCompare(b.talle)
        })
        setStock(todos)
      }
    } catch (e) {
      toast.error('Error cargando stock: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [productoId])

  useEffect(() => { cargar() }, [cargar])

  const actualizarCantidad = (talle, cantidad) => {
    setStock(prev => prev.map(s => s.talle === talle ? { ...s, cantidad } : s))
    if (debounceRef.current[talle]) clearTimeout(debounceRef.current[talle])
    debounceRef.current[talle] = setTimeout(() => {
      guardarTalle(talle, cantidad)
    }, 600)
  }

  const agregarTalle = async (talle) => {
    const talleNorm = talle.trim()
    if (!talleNorm) return
    if (stock.find(s => s.talle === talleNorm)) {
      toast.error(`El talle "${talleNorm}" ya existe`)
      return
    }
    const nuevoTalle = { talle: talleNorm, cantidad: 0, producto_id: productoId }
    setStock(prev => [...prev, nuevoTalle].sort((a, b) => {
      const aNum = parseInt(a.talle)
      const bNum = parseInt(b.talle)
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
      if (!isNaN(aNum)) return -1
      if (!isNaN(bNum)) return 1
      return a.talle.localeCompare(b.talle)
    }))
    await guardarTalle(talleNorm, 0)
    toast.success(`Talle "${talleNorm}" agregado`)
  }

  const guardarTalle = async (talle, cantidad) => {
    setGuardando(prev => ({ ...prev, [talle]: true }))
    try {
      const { error } = await supabase
        .from('stock')
        .upsert(
          [{ producto_id: productoId, talle, cantidad: parseInt(cantidad) || 0 }],
          { onConflict: 'producto_id,talle' }
        )
      if (error) throw error
    } catch (e) {
      toast.error('Error guardando stock: ' + e.message)
    } finally {
      setGuardando(prev => ({ ...prev, [talle]: false }))
    }
  }

  const guardarTodo = async () => {
    try {
      const filas = stock.map(s => ({
        producto_id: productoId,
        talle: s.talle,
        cantidad: parseInt(s.cantidad) || 0,
      }))
      const { error } = await supabase
        .from('stock')
        .upsert(filas, { onConflict: 'producto_id,talle' })
      if (error) throw error
      toast.success('Stock guardado')
    } catch (e) {
      toast.error('Error guardando stock: ' + e.message)
    }
  }

  return { stock, cargando, guardando, actualizarCantidad, agregarTalle, guardarTodo, TALLES: TALLES_ESTANDAR }
}
