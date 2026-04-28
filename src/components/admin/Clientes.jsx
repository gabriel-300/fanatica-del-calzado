import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalNotas, setModalNotas] = useState(null) // cliente seleccionado
  const [notas, setNotas] = useState('')
  const [guardandoNotas, setGuardandoNotas] = useState(false)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setClientes(data || [])
    } catch (e) {
      toast.error('Error cargando clientes: ' + e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirNotas = (cliente) => {
    setModalNotas(cliente)
    setNotas(cliente.notas || '')
  }

  const guardarNotas = async () => {
    if (!modalNotas) return
    setGuardandoNotas(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ notas })
        .eq('id', modalNotas.id)
      if (error) throw error
      toast.success('Notas guardadas')
      setModalNotas(null)
      await cargar()
    } catch (e) {
      toast.error('Error: ' + e.message)
    } finally {
      setGuardandoNotas(false)
    }
  }

  const contactarWA = (cliente) => {
    const numero = cliente.telefono?.replace(/\D/g, '') || WA_NUMBER
    window.open(`https://wa.me/${numero}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-negro">Clientes</h1>
        <p className="font-dm text-sm text-negro/40">{clientes.length} clientes registrados</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center font-dm text-negro/40">Cargando clientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-nude/60 border-b border-nude-dark">
                <tr>
                  {['Nombre','Teléfono','Instagram','Notas','Fecha','Acción'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-dm text-xs font-semibold text-negro/50 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-nude/40">
                {clientes.map(c => (
                  <tr key={c.id} className="hover:bg-nude/20 transition-colors">
                    <td className="px-4 py-3 font-dm text-sm font-medium text-negro">{c.nombre}</td>
                    <td className="px-4 py-3 font-dm text-sm text-negro/60">{c.telefono}</td>
                    <td className="px-4 py-3 font-dm text-sm text-negro/60">
                      {c.instagram && (
                        <a
                          href={`https://instagram.com/${c.instagram.replace('@','')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-coral hover:underline"
                        >
                          {c.instagram}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 font-dm text-xs text-negro/50 max-w-[180px] truncate">
                      {c.notas || <span className="italic text-negro/25">Sin notas</span>}
                    </td>
                    <td className="px-4 py-3 font-dm text-xs text-negro/40">{formatFecha(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirNotas(c)}
                          title="Editar notas"
                          className="font-dm text-xs text-coral hover:text-coral-dark border border-coral/30 hover:border-coral px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          Notas
                        </button>
                        <button
                          onClick={() => contactarWA(c)}
                          title="Contactar por WhatsApp"
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.526 5.855L.057 23.882a.5.5 0 00.61.61l6.027-1.469A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.787 9.787 0 01-5.012-1.375l-.36-.214-3.724.907.923-3.622-.234-.372A9.818 9.818 0 012.182 12C2.182 6.565 6.565 2.182 12 2.182S21.818 6.565 21.818 12 17.435 21.818 12 21.818z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center font-dm text-negro/30">No hay clientes todavía</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal notas */}
      {modalNotas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-negro/50 backdrop-blur-sm" onClick={() => setModalNotas(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <button onClick={() => setModalNotas(null)} className="absolute top-4 right-4 text-negro/40 hover:text-negro">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h2 className="font-cormorant text-2xl font-bold text-negro mb-1">Notas del cliente</h2>
            <p className="font-dm text-sm text-negro/50 mb-4">{modalNotas.nombre} · {modalNotas.telefono}</p>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={5}
              placeholder="Ej: Prefiere talles 37-38, le gustan las sandalias..."
              className="input-base resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalNotas(null)} className="btn-outline flex-1 text-sm">Cancelar</button>
              <button onClick={guardarNotas} disabled={guardandoNotas} className="btn-coral flex-1 text-sm disabled:opacity-60">
                {guardandoNotas ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
