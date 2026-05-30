import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import { supabase } from '../../lib/supabase'
import type { Sale } from '../../types'

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('sales')
      .select('*, sale_items(*)')
      .eq('business', 'variedades')
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setSales((data ?? []) as Sale[])
        setLoading(false)
      })
  }, [])

  // Group by date
  const grouped = sales.reduce<Record<string, Sale[]>>((acc, sale) => {
    const date = new Date(sale.created_at).toLocaleDateString('es-NI', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(sale)
    return acc
  }, {})

  return (
    <Layout title="Historial de ventas" showBack backTo="/variedades/reportes">
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Receipt size={48} className="text-gray-200" />
          <p className="text-gray-400 font-medium">Sin ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, daySales]) => (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide capitalize">{date}</p>
                <p className="text-xs font-bold text-green-600">
                  C${daySales.reduce((s, v) => s + v.total, 0).toFixed(2)} total
                </p>
              </div>
              <div className="space-y-2">
                {daySales.map(sale => (
                  <div key={sale.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 active:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Receipt size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">
                          C${sale.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(sale.created_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}
                          {sale.items && ` · ${sale.items.length} producto${sale.items.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                      {expanded === sale.id
                        ? <ChevronUp size={18} className="text-gray-400" />
                        : <ChevronDown size={18} className="text-gray-400" />
                      }
                    </button>

                    {expanded === sale.id && sale.items && sale.items.length > 0 && (
                      <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-2">
                        {sale.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                              <p className="text-xs text-gray-400">×{item.quantity} · C${item.unit_price.toFixed(2)} c/u</p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              C${(item.quantity * item.unit_price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                        {sale.notes && (
                          <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">
                            Nota: {sale.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
