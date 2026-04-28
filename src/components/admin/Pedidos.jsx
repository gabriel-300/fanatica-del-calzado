import { useState } from 'react'
import { usePedidos } from '../../hooks/usePedidos'

const ESTADOS = ['pendiente', 'confirmado', 'entregado', 'cancelado']
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

const COLORES_ESTADO = {
  pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmado: 'bg-blue-50 text-blue-700 border-blue-200',
  entregado: 'bg-green-50 text-green-700 border-green-200',
  cancelado: 'bg-red-50 text-red-600 border-red-200',
}

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Pedidos() {
  const [filtroEstado, setFiltroEstado] = useState('')
  const { pedidos, cargando, cambiarEstado } = usePedidos(filtroEstado || null)

  const fmt = (n) => n ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n) : ''

  const contactarWA = (pedido) => {
    const precio = pedido.producto_precio ? ` · ${fmt(pedido.producto_precio)}` : ''
    const cant   = pedido.cantidad > 1 ? ` (x${pedido.cantidad})` : ''
    const texto = [
      `Hola ${pedido.cliente_nombre}! 👋 Te escribimos de *Fanática del Calzado*.`,
      ``,
      `Recibimos tu pedido:`,
      `🛍️ *${pedido.producto_nombre}*${cant}`,
      `📏 Talle: *${pedido.talle}*${precio}`,
      ``,
      `¿Confirmamos el pedido?`,
    ].join('\n')
    window.open(`https://wa.me/${pedido.cliente_telefono?.replace(/\D/g,'')}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-cormorant text-3xl font-bold text-negro">Pedidos</h1>
          <p className="font-dm text-sm text-negro/40">{pedidos.length} pedidos {filtroEstado ? `(${filtroEstado})` : 'en total'}</p>
        </div>

        {/* Filtro estado */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroEstado('')}
            className={`font-dm text-xs px-3 py-1.5 rounded-full border transition-all ${
              filtroEstado === '' ? 'bg-coral text-white border-coral' : 'bg-white text-negro/60 border-gray-200 hover:border-coral hover:text-coral'
            }`}
          >
            Todos
          </button>
          {ESTADOS.map(e => (
            <button
              key={e}
              onClick={() => setFiltroEstado(filtroEstado === e ? '' : e)}
              className={`font-dm text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                filtroEstado === e ? 'bg-coral text-white border-coral' : 'bg-white text-negro/60 border-gray-200 hover:border-coral hover:text-coral'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center font-dm text-negro/40">Cargando pedidos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-nude/60 border-b border-nude-dark">
                <tr>
                  {['Fecha','Producto','Talle','Cliente','Teléfono','Estado','Acción'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-dm text-xs font-semibold text-negro/50 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nude/40">
                {pedidos.map(p => (
                  <tr key={p.id} className="hover:bg-nude/20 transition-colors">
                    <td className="px-4 py-3 font-dm text-xs text-negro/50 whitespace-nowrap">{formatFecha(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.producto_imagen ? (
                          <img src={p.producto_imagen} alt={p.producto_nombre}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-nude flex items-center justify-center text-lg flex-shrink-0">👠</div>
                        )}
                        <div>
                          <p className="font-dm text-sm text-negro font-medium leading-tight">{p.producto_nombre}</p>
                          <p className="font-dm text-xs text-negro/40 leading-tight">
                            {[p.categoria, p.producto_precio ? fmt(p.producto_precio) : null].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-dm text-sm font-semibold text-negro/80">{p.talle}</span>
                      {p.cantidad > 1 && <span className="font-dm text-xs text-negro/40 ml-1">x{p.cantidad}</span>}
                    </td>
                    <td className="px-4 py-3 font-dm text-sm text-negro">{p.cliente_nombre}</td>
                    <td className="px-4 py-3 font-dm text-sm text-negro/60">{p.cliente_telefono}</td>
                    <td className="px-4 py-3">
                      <select
                        value={p.estado}
                        onChange={e => cambiarEstado(p.id, e.target.value)}
                        className={`font-dm text-xs px-2 py-1.5 rounded-lg border capitalize cursor-pointer focus:outline-none focus:ring-1 focus:ring-coral ${COLORES_ESTADO[p.estado]}`}
                      >
                        {ESTADOS.map(e => <option key={e} value={e} className="bg-white text-negro">{e}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => contactarWA(p)}
                        title="Contactar por WhatsApp"
                        className="text-green-600 hover:text-green-700 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center font-dm text-negro/30">No hay pedidos todavía</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
