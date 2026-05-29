import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Scissors } from 'lucide-react'
import Layout from '../components/shared/Layout'
import BigButton from '../components/shared/BigButton'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Layout title="Carmen Business">
      <div className="flex flex-col gap-5 pt-4">
        <p className="text-center text-gray-400 text-sm">¿Qué negocio vas a gestionar?</p>
        <BigButton icon={<ShoppingBag size={34} />} label="Variedades" onClick={() => navigate('/variedades')} color="amber" />
        <BigButton icon={<Scissors size={34} />} label="Salón de Belleza" onClick={() => navigate('/salon')} color="purple" />
      </div>
    </Layout>
  )
}
