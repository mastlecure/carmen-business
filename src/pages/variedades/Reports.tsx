import { useState, useEffect } from 'react'
import { FileDown, TrendingUp } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import { useInventory } from '../../hooks/useInventory'
import { supabase } from '../../lib/supabase'
import { exportInventoryToExcel, exportSalesToExcel } from '../../lib/excel'
import type { Sale } from '../../types'

export default function Reports() {
  const { products } = useInventory('variedades')
  const [sales, setSales] = useState<Sale[]>([])
  const [todayCash, setTodayCash] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      supabase.from('sales').select('*').eq('business', 'variedades').order('created_at', { ascending: false }).limit(20),
      supabase.from('cash_register').select('*').eq('business', 'variedades').eq('register_date', today).single(),
    ]).then(([{ data: s }, { data: c }]) => {
      setSales(s ?? [])
      setTodayCash(c?.total_sales ?? 0)
      setLoading(false)
    })
  }, [])

  const lowStock = products.filter(p => p.stock <= p.low_stock_alert)

  return (
    <Layout title="Reportes" showBack backTo="/variedades">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-5 text-white mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={20} />
          <span className="font-medium">Caja del día</span>
        </div>
        <p className="text-4xl font-bold">C${todayCash.toFixed(2)}</p>
        <p className="text-green-100 text-sm">
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="font-bold text-amber-700 mb-2">⚠️ Stock bajo ({lowStock.length} productos)</p>
          {lowStock.map(p => (
            <div key={p.id} className="flex justify-between text-sm text-amber-800">
              <span>{p.name}</span>
              <span className="font-bold">Stock: {p.stock}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => exportInventoryToExcel(products, 'inventario-variedades')}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-carmen-500 active:bg-gray-50"
        >
          <FileDown size={24} className="text-carmen-600" />
          <span className="text-sm font-semibold text-gray-700">Exportar inventario</span>
        </button>
        <button
          onClick={() => exportSalesToExcel(sales, 'ventas-variedades')}
          className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-carmen-500 active:bg-gray-50"
        >
          <FileDown size={24} className="text-green-600" />
          <span className="text-sm font-semibold text-gray-700">Exportar ventas</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">Últimas ventas</h3>
        {loading ? (
          <p className="text-center text-gray-400 py-4">Cargando...</p>
        ) : (
          <div className="space-y-2">
            {sales.map(s => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(s.created_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('es-NI')}</p>
                </div>
                <span className="font-bold text-green-600">C${s.total.toFixed(2)}</span>
              </div>
            ))}
            {sales.length === 0 && <p className="text-center text-gray-400 py-4">Sin ventas aún</p>}
          </div>
        )}
      </div>
    </Layout>
  )
}
