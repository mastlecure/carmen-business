import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Correo o contraseña incorrectos')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #FAF6F2 0%, #F4EDE5 50%, #EDE8E3 100%)' }}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, #f7a07e 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, #b594e4 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #C4614A, #7B5EA7)' }} />

        <div className="p-8 pt-7">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #e97752 0%, #C4614A 100%)', boxShadow: '0 8px 24px rgba(196, 97, 74, 0.35)' }}
            >
              <span className="font-display text-4xl font-bold text-white italic leading-none" style={{ marginTop: '2px' }}>C</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 italic">Carmen Business</h1>
            <p className="text-gray-400 text-sm mt-1 font-light">Gestión de negocios</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">Iniciar sesión</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base bg-gray-50 focus:outline-none focus:border-carmen-400 focus:bg-white transition-all"
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base bg-gray-50 focus:outline-none focus:border-carmen-400 focus:bg-white transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 rounded-2xl text-base transition-all disabled:opacity-50 active:scale-[0.98] mt-2"
              style={{ background: loading ? '#e97752' : 'linear-gradient(135deg, #e97752 0%, #C4614A 100%)', boxShadow: '0 4px 16px rgba(196, 97, 74, 0.3)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-6 font-light">
            Variedades · Salón de Belleza
          </p>
        </div>
      </div>
    </div>
  )
}
