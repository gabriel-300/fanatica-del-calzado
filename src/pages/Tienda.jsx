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

function TiendaConCarrito() {
  const [checkoutAbierto, setCheckoutAbierto] = useState(false)

  return (
    <div className="min-h-screen">
      <Navbar />
      <CarritoSidebar onCheckout={() => setCheckoutAbierto(true)} />
      {checkoutAbierto && <ModalCheckout onCerrar={() => setCheckoutAbierto(false)} />}
      <HeroCarrusel />
      <Catalogo />
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
