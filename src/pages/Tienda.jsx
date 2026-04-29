import { useState } from 'react'
import { CarritoProvider } from '../context/CarritoContext'
import Navbar from '../components/Navbar'
import HeroCarrusel from '../components/HeroCarrusel'
import Catalogo from '../components/Catalogo'
import ComoComprar from '../components/ComoComprar'
import Instagram from '../components/Instagram'
import Footer from '../components/Footer'
import CarritoSidebar from '../components/CarritoSidebar'
import ModalCheckout from '../components/ModalCheckout'
import Marcas from '../components/Marcas'

function TiendaConCarrito() {
  const [checkoutAbierto, setCheckoutAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  return (
    <div className="min-h-screen">
      <Navbar busqueda={busqueda} onBusqueda={setBusqueda} />
      <CarritoSidebar onCheckout={() => setCheckoutAbierto(true)} />
      {checkoutAbierto && <ModalCheckout onCerrar={() => setCheckoutAbierto(false)} />}
      <HeroCarrusel />
      <Marcas />
      <Catalogo busqueda={busqueda} onLimpiarBusqueda={() => setBusqueda('')} />
      <ComoComprar />
      <Instagram />
      <Footer />
    </div>
  )
}

export default function Tienda() {
  return (
    <CarritoProvider>
      <TiendaConCarrito />
    </CarritoProvider>
  )
}
