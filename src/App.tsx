import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VariedadesHome from './pages/variedades/index'
import Inventory from './pages/variedades/Inventory'
import POS from './pages/variedades/POS'
import Reports from './pages/variedades/Reports'
import SalesHistory from './pages/variedades/SalesHistory'
import SalonHome from './pages/salon/index'
import Appointments from './pages/salon/Appointments'
import Clients from './pages/salon/Clients'
import Services from './pages/salon/Services'
import SalonReports from './pages/salon/SalonReports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-carmen-200 border-t-carmen-600 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/variedades" element={<ProtectedRoute><VariedadesHome /></ProtectedRoute>} />
      <Route path="/variedades/inventario" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/variedades/venta" element={<ProtectedRoute><POS /></ProtectedRoute>} />
      <Route path="/variedades/reportes" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/variedades/historial" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
      <Route path="/salon" element={<ProtectedRoute><SalonHome /></ProtectedRoute>} />
      <Route path="/salon/citas" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/salon/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/salon/servicios" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="/salon/reportes" element={<ProtectedRoute><SalonReports /></ProtectedRoute>} />
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
