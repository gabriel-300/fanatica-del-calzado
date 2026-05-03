import { useState, useMemo } from 'react'
import { useVentas } from '../../hooks/useVentas'

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const METODO_LABEL = { tarjeta: 'Tarjeta', efectivo: 'Efectivo', transferencia: 'Transferencia' }
const METODO_COLOR = {
  tarjeta:       'bg-blue-100 text-blue-700',
  efectivo:      'bg-green-100 text-green-700',
  transferencia: 'bg-purple-100 text-purple-700',
}

export default function AdminVentas() {
  const { ventas, cargando, eliminarVenta } = useVentas()
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [metodoFiltro, setMetodoFiltro] = useState('todos')
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const fecha = new Date(v.created_at)
      if (desde && fecha < new Date(desde)) return false
      if (hasta && fecha > new Date(hasta + 'T23:59:59')) return false
      if (metodoFiltro !== 'todos' && v.metodo_pago !== metodoFiltro) return false
      return true
    })
  }, [ventas, desde, hasta, metodoFiltro])

  const totales = useMemo(() => {
    const t = { tarjeta: 0, efectivo: 0, transferencia: 0, total: 0, cantidad: 0 }
    ventasFiltradas.forEach(v => {
      const monto = (v.precio || 0) * (v.cantidad || 1)
      t[v.metodo_pago] = (t[v.metodo_pago] || 0) + monto
      t.total += monto
      t.cantidad += v.cantidad || 1
    })
    return t
  }, [ventasFiltradas])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-stone-900">Ventas</h1>
          <p className="font-inter text-sm text-stone-400">{ventasFiltradas.length} ventas registradas</p>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', valor: totales.total, cantidad: totales.cantidad, color: 'bg-stone-900 text-white', sub: 'text-white/60' },
          { label: 'Tarjeta', valor: totales.tarjeta, color: 'bg-blue-50 text-blue-800', sub: 'text-blue-500' },
          { label: 'Efectivo', valor: totales.efectivo, color: 'bg-green-50 text-green-800', sub: 'text-green-500' },
          { label: 'Transferencia', valor: totales.transferencia, color: 'bg-purple-50 text-purple-800', sub: 'text-purple-500' },
        ].map(({ label, valor, cantidad, color, sub }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}>
            <p className={`font-inter text-xs font-semibold uppercase tracking-wider mb-1 ${sub}`}>{label}</p>
            <p className="font-playfair text-2xl font-bold">{formatPrecio(valor)}</p>
            {cantidad !== undefined && (
              <p className={`font-inter text-xs mt-1 ${sub}`}>{cantidad} unidades</p>
            )}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="font-inter text-xs text-stone-400">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="input-base text-sm py-1.5 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-inter text-xs text-stone-400">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="input-base text-sm py-1.5 w-36" />
        </div>
        <div className="flex gap-1.5">
          {['todos', 'tarjeta', 'efectivo', 'transferencia'].map(m => (
            <button key={m}
              onClick={() => setMetodoFiltro(m)}
              className={`font-inter text-xs px-3 py-1.5 rounded-full border transition-all ${
                metodoFiltro === m
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-border text-stone-500 hover:border-stone-400'
              }`}>
              {m === 'todos' ? 'Todos' : METODO_LABEL[m]}
            </button>
          ))}
        </div>
        {(desde || hasta || metodoFiltro !== 'todos') && (
          <button onClick={() => { setDesde(''); setHasta(''); setMetodoFiltro('todos') }}
            className="font-inter text-xs text-stone-400 hover:text-stone-700 transition-colors ml-auto">
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center font-inter text-stone-400">Cargando...</div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">💰</span>
            <p className="font-playfair text-xl text-stone-400">No hay ventas registradas</p>
            <p className="font-inter text-sm text-stone-300 mt-1">
              Usá el botón "Vender" en la sección Productos
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream border-b border-border">
                <tr>
                  {['Fecha', 'Producto', 'Talle', 'Cant.', 'Precio unit.', 'Total', 'Método', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-inter text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {ventasFiltradas.map(v => (
                  <tr key={v.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-inter text-xs text-stone-400 whitespace-nowrap">
                      {formatFecha(v.created_at)}
                    </td>
                    <td className="px-4 py-3 font-inter text-sm font-medium text-stone-800 max-w-[200px]">
                      <span className="line-clamp-2">{v.producto_nombre}</span>
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-stone-600">{v.talle}</td>
                    <td className="px-4 py-3 font-inter text-sm text-stone-600">{v.cantidad}</td>
                    <td className="px-4 py-3 font-inter text-sm text-stone-700">{formatPrecio(v.precio)}</td>
                    <td className="px-4 py-3 font-inter text-sm font-semibold text-orange">
                      {formatPrecio((v.precio || 0) * (v.cantidad || 1))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-inter text-xs font-medium px-2.5 py-1 rounded-full ${METODO_COLOR[v.metodo_pago] || 'bg-stone-100 text-stone-600'}`}>
                        {METODO_LABEL[v.metodo_pago] || v.metodo_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {confirmEliminar === v.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              await eliminarVenta(v.id, { producto_id: v.producto_id, talle: v.talle, cantidad: v.cantidad })
                              setConfirmEliminar(null)
                            }}
                            className="font-inter text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors"
                          >
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmEliminar(null)}
                            className="font-inter text-xs text-stone-400 hover:text-stone-600 px-2 py-1 transition-colors">
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmEliminar(v.id)}
                          className="font-inter text-xs text-stone-300 hover:text-red-400 border border-stone-200 hover:border-red-300 px-2.5 py-1 rounded-lg transition-all">
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
