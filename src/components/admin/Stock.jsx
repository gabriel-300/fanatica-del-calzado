import { useState } from 'react'
import { useProductosAdmin } from '../../hooks/useProductos'
import { useStock } from '../../hooks/useStock'

function BadgeCantidad({ cantidad }) {
  if (cantidad === 0) return <span className="inline-block w-2 h-2 rounded-full bg-red-400" title="Sin stock" />
  if (cantidad <= 2) return <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" title="Stock bajo" />
  return <span className="inline-block w-2 h-2 rounded-full bg-green-400" title="Con stock" />
}

function FilaTalle({ talle, cantidad, guardando, onChange }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <BadgeCantidad cantidad={parseInt(cantidad) || 0} />
          <span className="font-inter text-sm font-medium">Talle {talle}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={cantidad}
            onChange={e => onChange(talle, parseInt(e.target.value) || 0)}
            className="input-base w-20 text-center text-sm py-1.5"
          />
          {guardando && (
            <svg className="animate-spin w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`font-inter text-xs px-2 py-1 rounded-full ${
          parseInt(cantidad) === 0 ? 'bg-red-50 text-red-500' :
          parseInt(cantidad) <= 2 ? 'bg-yellow-50 text-yellow-600' :
          'bg-green-50 text-green-600'
        }`}>
          {parseInt(cantidad) === 0 ? 'Sin stock' : parseInt(cantidad) <= 2 ? 'Stock bajo' : 'Disponible'}
        </span>
      </td>
    </tr>
  )
}

export default function Stock() {
  const { productos, cargando: cargandoProductos } = useProductosAdmin()
  const [productoId, setProductoId] = useState('')
  const { stock, cargando, guardando, actualizarCantidad, agregarTalle } = useStock(productoId)

  const productoSeleccionado = productos.find(p => p.id === productoId)

  const handleAgregarUnico = () => agregarTalle('Único')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-3xl font-bold text-stone-900">Stock</h1>
        <p className="font-inter text-sm text-stone-400">Administrá el inventario por talle (auto-guarda)</p>
      </div>

      {/* Selector de producto */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <label className="block font-inter text-sm text-stone-500 mb-2">Seleccionar producto</label>
        {cargandoProductos ? (
          <div className="h-10 bg-cream rounded-lg animate-pulse" />
        ) : (
          <select
            className="input-base"
            value={productoId}
            onChange={e => setProductoId(e.target.value)}
          >
            <option value="">— Elegí un producto —</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.categoria})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tabla de stock */}
      {productoId && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-playfair text-xl font-semibold text-stone-900">
                {productoSeleccionado?.nombre}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 font-inter text-xs text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-400" /> Disponible
                </span>
                <span className="flex items-center gap-1 font-inter text-xs text-yellow-600">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Stock bajo (≤2)
                </span>
                <span className="flex items-center gap-1 font-inter text-xs text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> Sin stock
                </span>
              </div>
            </div>

            {/* Botón talle Único */}
            {!stock.find(s => s.talle === 'Único') && (
              <button
                onClick={handleAgregarUnico}
                className="flex items-center gap-1.5 text-xs font-inter font-medium text-orange border border-orange px-3 py-1.5 rounded-full hover:bg-orange hover:text-white transition-colors"
              >
                + Agregar talle Único
              </button>
            )}
          </div>

          {cargando ? (
            <div className="p-10 text-center font-inter text-stone-400">Cargando stock...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-cream">
                <tr>
                  <th className="text-left px-4 py-2.5 font-inter text-xs text-stone-400 uppercase tracking-wider">Talle</th>
                  <th className="text-left px-4 py-2.5 font-inter text-xs text-stone-400 uppercase tracking-wider">Cantidad</th>
                  <th className="text-left px-4 py-2.5 font-inter text-xs text-stone-400 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(({ talle, cantidad }) => (
                  <FilaTalle
                    key={talle}
                    talle={talle}
                    cantidad={cantidad}
                    guardando={guardando[talle]}
                    onChange={actualizarCantidad}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!productoId && !cargandoProductos && (
        <div className="text-center py-16 text-stone-300 font-inter">
          Seleccioná un producto para ver su stock
        </div>
      )}
    </div>
  )
}
