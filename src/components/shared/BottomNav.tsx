import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, Scissors } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const NAV_ROUTES = ['/', '/variedades', '/salon']

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    supabase
      .from('products')
      .select('stock, low_stock_alert')
      .eq('business', 'variedades')
      .then(({ data }) => {
        const count = (data ?? []).filter(p => p.stock <= p.low_stock_alert).length
        setLowStockCount(count)
      })
  }, [])

  if (!NAV_ROUTES.includes(location.pathname)) return null

  const TABS = [
    { path: '/',           icon: LayoutDashboard, label: 'Inicio',     badge: 0 },
    { path: '/variedades', icon: ShoppingBag,      label: 'Variedades', badge: lowStockCount },
    { path: '/salon',      icon: Scissors,          label: 'Salón',      badge: 0 },
  ]

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
              <div className="relative">
                <tab.icon size={23} strokeWidth={active ? 2.5 : 1.8} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>{tab.label}</span>
              {active && <div className="w-5 h-0.5 rounded-full bg-carmen-500 -mt-0.5" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
