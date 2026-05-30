import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Scissors } from 'lucide-react'

const TABS = [
  { path: '/',           icon: LayoutDashboard, label: 'Inicio' },
  { path: '/variedades', icon: ShoppingBag,      label: 'Variedades' },
  { path: '/salon',      icon: Scissors,          label: 'Salón' },
]

const NAV_ROUTES = ['/', '/variedades', '/salon']

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  if (!NAV_ROUTES.includes(location.pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 max-w-lg mx-auto">
      <div className="flex">
        {TABS.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors active:bg-gray-50 ${
                active ? 'text-carmen-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={23} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>{tab.label}</span>
              {active && <div className="w-5 h-0.5 rounded-full bg-carmen-500 -mt-0.5" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
