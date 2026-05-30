import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import BottomNav from './BottomNav'

interface LayoutProps {
  title: string
  children: ReactNode
  showBack?: boolean
  backTo?: string
}

const BOTTOM_NAV_ROUTES = ['/', '/variedades', '/salon']

export default function Layout({ title, children, showBack, backTo }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, mode, setMode } = useAuth()
  const hasBottomNav = BOTTOM_NAV_ROUTES.includes(location.pathname)
  const isHome = !showBack

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 flex items-center gap-3 sticky top-0 z-20">
        {/* Left: back or spacing */}
        <div className="w-10 flex-shrink-0 flex items-center">
          {showBack && (
            <button
              onClick={() => navigate(backTo || (-1 as unknown as string))}
              className="w-10 h-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 py-4 text-center">
          {isHome ? (
            <span className="font-display text-lg font-semibold text-gray-900 italic tracking-wide">
              {title}
            </span>
          ) : (
            <span className="text-base font-semibold text-gray-800 tracking-tight">
              {title}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="w-10 flex items-center justify-end gap-0.5 flex-shrink-0">
          <button
            onClick={() => setMode(mode === 'admin' ? 'carmen' : 'admin')}
            title={mode === 'admin' ? 'Modo Carmen' : 'Modo Admin'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              mode === 'admin'
                ? 'bg-carmen-100 text-carmen-600'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <Settings size={18} />
          </button>
        </div>

        <button
          onClick={signOut}
          className="w-9 h-9 rounded-xl hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Admin badge */}
      {mode === 'admin' && (
        <div className="bg-carmen-500 text-white text-xs text-center py-1.5 font-semibold tracking-widest uppercase">
          Modo Admin
        </div>
      )}

      {/* Content */}
      <main className={`flex-1 p-4 ${hasBottomNav ? 'pb-28' : 'pb-8'}`}>
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
