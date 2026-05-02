import { useState, useMemo } from 'react'
import { useProductos } from '../hooks/useProductos'
import { useConfiguracion } from '../hooks/useConfiguracion'
import ProductCard from './ProductCard'
import FiltrosCategorias from './FiltrosCategorias'
import ModalProducto from './ModalProducto'
import ModalPedido from './ModalPedido'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-square bg-border/40" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-border/40 rounded w-1/3" />
        <div className="h-5 bg-border/40 rounded w-2/3" />
        <div className="h-6 bg-border/40 rounded w-1/4" />
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-5 w-8 bg-border/40 rounded" />)}
        </div>
      </div>
    </div>
  )
}

export default function Catalogo({ busqueda = '', onLimpiarBusqueda }) {
  const { productos, cargando, error } = useProductos()
  const { config } = useConfiguracion()
  const descuentoEfectivo = parseInt(config.descuento_efectivo_pct) || 0
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [detalleModal, setDetalleModal] = useState(null)
  const [pedidoModal, setPedidoModal] = useState(null)

  const conteos = useMemo(() => {
    return productos.reduce((acc, p) => {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1
      return acc
    }, {})
  }, [productos])

  const productosFiltrados = useMemo(() => {
    let lista = categoriaActiva === 'Todas' ? productos : productos.filter(p => p.categoria === categoriaActiva)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      lista = lista.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [productos, categoriaActiva, busqueda])

  const abrirDetalle = (producto) => setDetalleModal(producto)

  const abrirPedido = (producto, talle, cantidad = 1) => {
    setDetalleModal(null)
    setPedidoModal({ producto, talle, cantidad })
  }

  return (
    <section id="catalogo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <p className="font-inter text-sm font-medium tracking-[0.2em] text-orange uppercase mb-3">
          Colección actual
        </p>
        <h2 className="font-playfair text-5xl font-bold text-stone-900 mb-4">
          Nuestro catálogo
        </h2>
        <p className="font-inter text-stone-500 max-w-md mx-auto">
          Calzado seleccionado para que cada paso sea tuyo
        </p>
      </div>

      {/* Filtros */}
      {!cargando && productos.length > 0 && (
        <div className="mb-10 -mx-4 sm:-mx-6 lg:-mx-8">
          <FiltrosCategorias
            activa={categoriaActiva}
            onChange={setCategoriaActiva}
            conteos={conteos}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="font-inter text-red-500 mb-2">No se pudo cargar el catálogo</p>
          <p className="font-inter text-sm text-stone-400">{error}</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cargando
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : productosFiltrados.map(producto => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onVerDetalle={abrirDetalle}
                descuentoEfectivo={descuentoEfectivo}
              />
            ))
        }
      </div>

      {/* Sin productos */}
      {!cargando && !error && productosFiltrados.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">👠</span>
          <p className="font-playfair text-2xl text-stone-400 mb-2">
            {busqueda.trim()
              ? `Sin resultados para "${busqueda}"`
              : categoriaActiva === 'Todas'
                ? 'No hay productos disponibles por el momento'
                : `No hay ${categoriaActiva.toLowerCase()} disponibles`}
          </p>
          {(busqueda.trim() || categoriaActiva !== 'Todas') && (
            <button onClick={() => { onLimpiarBusqueda?.(); setCategoriaActiva('Todas') }} className="btn-outline mt-4 text-sm">
              Ver todo el catálogo
            </button>
          )}
        </div>
      )}

      {/* Modal detalle producto */}
      {detalleModal && (
        <ModalProducto
          producto={detalleModal}
          onCerrar={() => setDetalleModal(null)}
          onPedir={abrirPedido}
          descuentoEfectivo={descuentoEfectivo}
        />
      )}

      {/* Modal pedido WhatsApp */}
      {pedidoModal && (
        <ModalPedido
          producto={pedidoModal.producto}
          talle={pedidoModal.talle}
          cantidad={pedidoModal.cantidad}
          onCerrar={() => setPedidoModal(null)}
        />
      )}
    </section>
  )
}
