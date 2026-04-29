import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import Productos from '../components/admin/Productos'
import Stock from '../components/admin/Stock'
import Pedidos from '../components/admin/Pedidos'
import Clientes from '../components/admin/Clientes'
import Banners from '../components/admin/Banners'
import Categorias from '../components/admin/Categorias'

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fanática2024'
const SESSION_KEY = 'fanatica_admin_session'

function LoginForm({ onLogin }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    // Pequeño delay para simular verificación
    await new Promise(r => setTimeout(r, 400))
    if (pass === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onLogin()
    } else {
      setError(true)
      setPass('')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-negro flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">👠</span>
          <h1 className="font-cormorant text-3xl font-bold text-negro">Panel Admin</h1>
          <p className="font-dm text-sm text-negro/40 mt-1">Fanática del Calzado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-dm text-sm text-negro/60 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false) }}
              className={`input-base ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="••••••••"
              autoFocus
              required
            />
            {error && (
              <p className="text-red-500 text-xs font-dm mt-1.5">Contraseña incorrecta</p>
            )}
          </div>

          <button type="submit" disabled={cargando} className="btn-coral w-full disabled:opacity-60">
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="font-dm text-xs text-negro/25 text-center mt-6">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  )
}

export default function Admin() {
  const [autenticado, setAutenticado] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setAutenticado(true)
    }
  }, [])

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAutenticado(false)
    navigate('/admin')
  }

  if (!autenticado) {
    return <LoginForm onLogin={() => setAutenticado(true)} />
  }

  return (
    <AdminLayout onLogout={logout}>
      <Routes>
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<Productos />} />
        <Route path="stock" element={<Stock />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="banners" element={<Banners />} />
      </Routes>
    </AdminLayout>
  )
}
