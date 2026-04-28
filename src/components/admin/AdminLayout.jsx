import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/productos', label: 'Productos', icon: '👟' },
  { to: '/admin/stock', label: 'Stock', icon: '📦' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '🛒' },
  { to: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { to: '/admin/banners', label: 'Banners', icon: '🖼️' },
]

export default function AdminLayout({ children, onLogout }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  return (
    <div className="flex h-screen bg-gray-100 font-dm overflow-hidden">
      {/* Overlay mobile */}
      {sidebarAbierto && (
        <div
          className="md:hidden fixed inset-0 bg-negro/40 z-20"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-negro text-white flex flex-col
        transition-transform duration-300
        ${sidebarAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-cormorant text-lg font-bold text-white">Fanática</span>
            <span>👠</span>
          </div>
          <p className="text-xs text-white/30 font-dm mt-0.5">Panel de administración</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-dm text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-coral text-white font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors w-full"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-negro/60 hover:text-negro"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="font-cormorant text-lg font-bold text-negro">Fanática 👠</span>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
