import { Routes, Route } from 'react-router-dom'
import Tienda from './pages/Tienda'
import Admin from './pages/Admin'
import PagoExitoso from './pages/PagoExitoso'
import PagoFallido from './pages/PagoFallido'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Tienda />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/pago-exitoso" element={<PagoExitoso />} />
      <Route path="/pago-fallido" element={<PagoFallido />} />
    </Routes>
  )
}
