import { useNavigate } from 'react-router-dom'
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
    <Layout title="🛍️ Variedades" showBack backTo="/">
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 text-amber-700 text-sm font-medium text-center">
          ⚠️ {lowStock.length} producto{lowStock.length > 1 ? 's' : ''} con poco stock
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <BigButton icon="💰" label="Registrar venta" onClick={() => navigate('/variedades/venta')} color="green" />
        <BigButton icon="📦" label="Ver productos" onClick={() => navigate('/variedades/inventario')} color="amber" />
        {mode === 'admin' && (
          <>
            <BigButton icon="📊" label="Reportes" onClick={() => navigate('/variedades/reportes')} color="pink" />
            <BigButton icon="📥" label="Exportar Excel" onClick={() => navigate('/variedades/reportes')} color="gray" />
          </>
        )}
      </div>
    </Layout>
  )
}
