import { useState, useEffect } from 'react'
import { useConfiguracion } from '../../hooks/useConfiguracion'
import toast from 'react-hot-toast'

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

export default function AdminConfig() {
  const { config, cargando, updateConfig } = useConfiguracion()
  const [descuento, setDescuento] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!cargando) setDescuento(config.descuento_efectivo_pct ?? '0')
  }, [cargando, config.descuento_efectivo_pct])

  const guardar = async (e) => {
    e.preventDefault()
    const val = parseInt(descuento)
    if (isNaN(val) || val < 0 || val > 50) {
      toast.error('El descuento debe ser entre 0 y 50%')
      return
    }
    setGuardando(true)
    const ok = await updateConfig('descuento_efectivo_pct', val)
    if (ok) toast.success('Configuración guardada')
    else toast.error('Error al guardar. Verificá que la tabla "configuracion" exista en Supabase.')
    setGuardando(false)
  }

  const pct = parseInt(descuento) || 0
  const ejemploPrecio = 35000
  const ejemploEfectivo = Math.round(ejemploPrecio * (1 - pct / 100))

  return (
    <div className="max-w-xl">
      <h1 className="font-playfair text-3xl font-bold text-stone-900 mb-1">Configuración</h1>
      <p className="font-inter text-sm text-stone-400 mb-8">Ajustes globales de la tienda</p>

      {/* Descuento efectivo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <span className="text-2xl">💵</span>
          <div>
            <h2 className="font-inter font-semibold text-stone-800">Descuento efectivo / transferencia</h2>
            <p className="font-inter text-sm text-stone-400 mt-0.5">
              Porcentaje de descuento que se muestra en todos los productos para pago en efectivo o transferencia
            </p>
          </div>
        </div>

        {cargando ? (
          <div className="h-10 bg-border/40 rounded-lg animate-pulse" />
        ) : (
          <form onSubmit={guardar} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={descuento}
                  onChange={e => setDescuento(e.target.value)}
                  className="input-base w-28 pr-7 text-lg font-semibold text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-inter text-stone-400 font-semibold">%</span>
              </div>
              <button
                type="submit"
                disabled={guardando}
                className="btn-orange text-sm disabled:opacity-60"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            {/* Preview */}
            {pct > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="font-inter text-xs text-green-700 font-semibold uppercase tracking-wider mb-2">
                  Vista previa en la tienda
                </p>
                <div className="space-y-1">
                  <p className="font-inter text-sm text-stone-500">
                    Con tarjeta: <span className="font-semibold text-orange">{formatPrecio(ejemploPrecio)}</span>
                  </p>
                  <p className="font-inter text-sm text-stone-500">
                    Efectivo / transferencia:{' '}
                    <span className="font-semibold text-green-700">{formatPrecio(ejemploEfectivo)}</span>
                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      -{pct}% OFF
                    </span>
                  </p>
                </div>
              </div>
            )}
            {pct === 0 && (
              <p className="font-inter text-xs text-stone-400">
                Con 0% no se mostrará precio de efectivo/transferencia en la tienda.
              </p>
            )}
          </form>
        )}
      </div>

      {/* Instrucciones SQL */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="font-inter text-sm font-semibold text-amber-800 mb-2">
          ⚠️ Requiere configuración en Supabase
        </p>
        <p className="font-inter text-xs text-amber-700 mb-3">
          Si la configuración no guarda, ejecutá este SQL en Supabase → SQL Editor:
        </p>
        <pre className="font-mono text-xs bg-white border border-amber-200 rounded-lg p-3 overflow-x-auto text-stone-600 leading-relaxed whitespace-pre-wrap">{`-- Tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  clave text PRIMARY KEY,
  valor text NOT NULL
);
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON configuracion
  FOR SELECT USING (true);
CREATE POLICY "anon_write" ON configuracion
  FOR ALL USING (true);
INSERT INTO configuracion (clave, valor)
  VALUES ('descuento_efectivo_pct', '15')
  ON CONFLICT (clave) DO NOTHING;

-- Campos oferta en productos
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS oferta_pct integer DEFAULT 0;
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS oferta_hasta timestamptz;`}</pre>
      </div>
    </div>
  )
}
