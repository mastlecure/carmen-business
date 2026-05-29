import { useNavigate } from 'react-router-dom'
import { CreditCard, Package, BarChart2, FileDown } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import BigButton from '../../components/shared/BigButton'
import { useAuth } from '../../context/AuthContext'
import { useInventory } from '../../hooks/useInventory'

export default function VariedadesHome() {
  const navigate = useNavigate()
  const { mode } = useAuth()
  const { products } = useInventory('variedades')
  const lowStock = products.filter(p => p.stock <= p.low_stock_alert)

  return (
    <Layout title="Variedades" showBack backTo="/">
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-l-amber-400 rounded-r-2xl px-4 py-3 mb-4 text-amber-700 text-sm font-medium">
          {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con poco stock
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <BigButton icon={<CreditCard size={32} />} label="Registrar venta" onClick={() => navigate('/variedades/venta')} color="green" />
        <BigButton icon={<Package size={32} />} label="Ver productos" onClick={() => navigate('/variedades/inventario')} color="amber" />
        {mode === 'admin' && (
          <>
            <BigButton icon={<BarChart2 size={32} />} label="Reportes" onClick={() => navigate('/variedades/reportes')} color="pink" />
            <BigButton icon={<FileDown size={32} />} label="Exportar Excel" onClick={() => navigate('/variedades/reportes')} color="gray" />
          </>
        )}
      </div>
    </Layout>
  )
}
