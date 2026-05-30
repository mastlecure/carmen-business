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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        {showBack && (
          <button
            onClick={() => navigate(backTo || (-1 as unknown as string))}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
        )}
        <h1 className="flex-1 text-xl font-bold text-gray-900 truncate">{title}</h1>

        <button
          onClick={() => setMode(mode === 'admin' ? 'carmen' : 'admin')}
          title={mode === 'admin' ? 'Cambiar a modo Carmen' : 'Cambiar a modo Admin'}
          className={`p-2 rounded-full transition-colors ${
            mode === 'admin'
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'hover:bg-gray-100 text-gray-400'
          }`}
        >
          <Settings size={20} />
        </button>

        <button
          onClick={signOut}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Admin badge */}
      {mode === 'admin' && (
        <div className="bg-blue-600 text-white text-xs text-center py-1.5 font-semibold tracking-wide">
          MODO ADMIN
        </div>
      )}

      {/* Content */}
      <main className={`flex-1 p-4 ${hasBottomNav ? 'pb-28' : 'pb-6'}`}>
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
