import { useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import BigButton from '../../components/shared/BigButton'
import { useAuth } from '../../context/AuthContext'

export default function SalonHome() {
  const navigate = useNavigate()
  const { mode } = useAuth()

  return (
    <Layout title="💇‍♀️ Salón de Belleza" showBack backTo="/">
      <div className="grid grid-cols-2 gap-4">
        <BigButton icon="📅" label="Citas de hoy" onClick={() => navigate('/salon/citas')} color="purple" />
        <BigButton icon="👩" label="Clientes" onClick={() => navigate('/salon/clientes')} color="pink" />
        {mode === 'admin' && (
          <>
            <BigButton icon="✂️" label="Servicios" onClick={() => navigate('/salon/servicios')} color="gray" />
            <BigButton icon="➕" label="Nueva cita" onClick={() => navigate('/salon/citas')} color="green" />
          </>
        )}
      </div>
    </Layout>
  )
}
