import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, Scissors, CalendarPlus, BarChart2 } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import BigButton from '../../components/shared/BigButton'
import { useAuth } from '../../context/AuthContext'

export default function SalonHome() {
  const navigate = useNavigate()
  const { mode } = useAuth()

  return (
    <Layout title="Salón de Belleza" showBack backTo="/">
      <div className="grid grid-cols-2 gap-4">
        <BigButton icon={<CalendarDays size={32} />} label="Citas de hoy" onClick={() => navigate('/salon/citas')} color="purple" />
        <BigButton icon={<Users size={32} />} label="Clientes" onClick={() => navigate('/salon/clientes')} color="pink" />
        {mode === 'admin' && (
          <>
            <BigButton icon={<Scissors size={32} />} label="Servicios" onClick={() => navigate('/salon/servicios')} color="gray" />
            <BigButton icon={<CalendarPlus size={32} />} label="Nueva cita" onClick={() => navigate('/salon/citas')} color="green" />
            <BigButton icon={<BarChart2 size={32} />} label="Reportes" onClick={() => navigate('/salon/reportes')} color="pink" />
          </>
        )}
      </div>
    </Layout>
  )
}
