import { useNavigate } from 'react-router-dom'
import Layout from '../components/shared/Layout'
import BigButton from '../components/shared/BigButton'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout title="Carmen Business">
      <div className="flex flex-col gap-6 pt-4">
        <p className="text-center text-gray-500">¿Qué negocio vas a gestionar?</p>
        <BigButton icon="🛍️" label="Variedades" onClick={() => navigate('/variedades')} color="amber" />
        <BigButton icon="💇‍♀️" label="Salón de Belleza" onClick={() => navigate('/salon')} color="purple" />
      </div>
    </Layout>
  )
}
