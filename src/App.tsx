import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import VariedadesHome from './pages/variedades/index'
import Inventory from './pages/variedades/Inventory'
import POS from './pages/variedades/POS'
import Reports from './pages/variedades/Reports'
import SalonHome from './pages/salon/index'
import Appointments from './pages/salon/Appointments'
import Clients from './pages/salon/Clients'
import Services from './pages/salon/Services'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/variedades" element={<ProtectedRoute><VariedadesHome /></ProtectedRoute>} />
      <Route path="/variedades/inventario" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/variedades/venta" element={<ProtectedRoute><POS /></ProtectedRoute>} />
      <Route path="/variedades/reportes" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/salon" element={<ProtectedRoute><SalonHome /></ProtectedRoute>} />
      <Route path="/salon/citas" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/salon/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/salon/servicios" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
