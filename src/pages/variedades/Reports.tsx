import { useState, useEffect } from 'react'
import { FileDown, TrendingUp, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/shared/Layout'
import { useInventory } from '../../hooks/useInventory'
import { localDate } from '../../lib/date'
import { supabase } from '../../lib/supabase'
import { exportInventoryToExcel, exportSalesToExcel } from '../../lib/excel'
import type { Sale } from '../../types'

export default function Reports() {
  const navigate = useNavigate()
  const { products } = useInventory('variedades')
  const [sales, setSales] = useState<Sale[]>([])
  const [todayCash, setTodayCash] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = localDate()
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
      {/* Caja del día */}
      <div className="bg-white rounded-2xl p-5 mb-4 border-l-4 border-l-green-400 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-green-600">
          <TrendingUp size={18} />
          <span className="font-bold text-sm">Caja del día</span>
        </div>
        <p className="text-4xl font-bold text-gray-900">C${todayCash.toFixed(2)}</p>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stock bajo */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-l-amber-400 rounded-r-2xl px-4 py-3 mb-4">
          <p className="font-bold text-amber-700 mb-2 text-sm">Stock bajo — {lowStock.length} producto{lowStock.length > 1 ? 's' : ''}</p>
          {lowStock.map(p => (
            <div key={p.id} className="flex justify-between text-sm text-amber-800 py-0.5">
              <span>{p.name}</span>
              <span className="font-bold">Stock: {p.stock}</span>
            </div>
          ))}
        </div>
      )}

      {/* Exportar */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => exportInventoryToExcel(products, 'inventario-variedades')}
          className="bg-white border border-gray-200 border-l-4 border-l-carmen-400 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-gray-50"
        >
          <FileDown size={22} className="text-carmen-600" />
          <span className="text-sm font-bold text-gray-700 text-center">Exportar inventario</span>
        </button>
        <button
          onClick={() => exportSalesToExcel(sales, 'ventas-variedades')}
          className="bg-white border border-gray-200 border-l-4 border-l-green-400 rounded-2xl p-4 flex flex-col items-center gap-2 active:bg-gray-50"
        >
          <FileDown size={22} className="text-green-600" />
          <span className="text-sm font-bold text-gray-700 text-center">Exportar ventas</span>
        </button>
      </div>

      {/* Historial completo */}
      <button
        onClick={() => navigate('/variedades/historial')}
        className="w-full bg-white border border-gray-200 border-l-4 border-l-violet-400 rounded-2xl p-4 flex items-center gap-3 mb-4 active:bg-gray-50"
      >
        <History size={22} className="text-violet-500" />
        <span className="font-bold text-gray-700 flex-1 text-left">Ver historial completo</span>
        <span className="text-xs text-gray-400">con detalle →</span>
      </button>

      {/* Últimas ventas */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Últimas ventas</h3>
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sales.map(s => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(s.created_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('es-NI')}</p>
                </div>
                <span className="font-bold text-green-600 text-base">C${s.total.toFixed(2)}</span>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-center text-gray-400 py-8">Sin ventas aún</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
