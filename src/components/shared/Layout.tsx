import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface LayoutProps {
  title: string
  children: ReactNode
  showBack?: boolean
  backTo?: string
}

export default function Layout({ title, children, showBack, backTo }: LayoutProps) {
  const navigate = useNavigate()
  const { signOut, mode, setMode } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        {showBack && (
          <button onClick={() => navigate(backTo || (-1 as unknown as string))} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="flex-1 text-lg font-bold text-gray-900 truncate">{title}</h1>
        <button
          onClick={() => setMode(mode === 'admin' ? 'carmen' : 'admin')}
          title={mode === 'admin' ? 'Cambiar a modo Carmen' : 'Cambiar a modo Admin'}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <Settings size={20} />
        </button>
        <button onClick={signOut} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
          <LogOut size={20} />
        </button>
      </header>

      {mode === 'admin' && (
        <div className="bg-blue-50 text-blue-700 text-xs text-center py-1 font-medium">
          Modo Admin activo
        </div>
      )}

      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
