import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useConfiguracion() {
  const [config, setConfig] = useState({ descuento_efectivo_pct: '0' })
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const { data } = await supabase.from('configuracion').select('clave, valor')
      if (data?.length) {
        const cfg = {}
        data.forEach(({ clave, valor }) => { cfg[clave] = valor })
        setConfig(prev => ({ ...prev, ...cfg }))
      }
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const updateConfig = async (clave, valor) => {
    const { error } = await supabase
      .from('configuracion')
      .upsert({ clave, valor: String(valor) }, { onConflict: 'clave' })
    if (!error) setConfig(prev => ({ ...prev, [clave]: String(valor) }))
    return !error
  }

  return { config, cargando, updateConfig, recargar: cargar }
}
