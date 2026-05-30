import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, CalendarClock, AlertTriangle, ShoppingBag, Scissors, ChevronRight, Award } from 'lucide-react'
import Layout from '../components/shared/Layout'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', done: 'Realizada', cancelled: 'Cancelada',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  confirmed: 'text-blue-600 bg-blue-50',
  done: 'text-green-600 bg-green-50',
  cancelled: 'text-red-500 bg-red-50',
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl p-4 border-t-4 ${color} shadow-sm`}>
      <div className="text-gray-400 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  )
}

interface DayData { date: string; label: string; total: number }
interface TopProduct { name: string; revenue: number; qty: number }

export default function Dashboard() {
  const navigate = useNavigate()
  const [todaySales, setTodaySales] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [lowStock, setLowStock] = useState(0)
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    Promise.all([
      supabase.from('cash_register').select('total_sales').eq('register_date', today),
      supabase.from('appointments').select('*').eq('appointment_date', today).neq('status', 'cancelled').order('appointment_time'),
      supabase.from('products').select('stock, low_stock_alert').eq('business', 'variedades'),
      supabase.from('cash_register').select('register_date, total_sales').eq('business', 'variedades').gte('register_date', startDate).order('register_date'),
      supabase.from('sale_items').select('product_name, quantity, unit_price').limit(500),
    ]).then(([{ data: cash }, { data: appts }, { data: prods }, { data: week }, { data: items }]) => {
      setTodaySales((cash ?? []).reduce((s, c) => s + (c.total_sales ?? 0), 0))
      setAppointments((appts ?? []) as Appointment[])
      setLowStock((prods ?? []).filter(p => p.stock <= p.low_stock_alert).length)

      // Build 7-day array
      const cashMap: Record<string, number> = {}
      ;(week ?? []).forEach(r => { cashMap[r.register_date] = r.total_sales })
      const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toISOString().split('T')[0]
        return {
          date: dateStr,
          label: d.toLocaleDateString('es-NI', { weekday: 'short' }),
          total: cashMap[dateStr] ?? 0,
        }
      })
      setWeekData(days)

      // Top products
      const map: Record<string, TopProduct> = {}
      ;(items ?? []).forEach(item => {
        if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, revenue: 0, qty: 0 }
        map[item.product_name].revenue += item.quantity * item.unit_price
        map[item.product_name].qty += item.quantity
      })
      const sorted = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 4)
      setTopProducts(sorted)

      setLoading(false)
    })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'
  const maxWeek = Math.max(...weekData.map(d => d.total), 1)

  return (
    <Layout title="Carmen Business">
      {/* Saludo */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{greeting}, Carmen</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard icon={<TrendingUp size={18} />} label="Ventas hoy" value={`C$${todaySales.toFixed(0)}`} color="border-green-400" />
          <StatCard icon={<CalendarClock size={18} />} label="Citas hoy" value={String(appointments.length)} color="border-violet-400" />
          <StatCard icon={<AlertTriangle size={18} />} label="Stock bajo" value={String(lowStock)} color={lowStock > 0 ? 'border-amber-400' : 'border-gray-200'} />
        </div>
      )}

      {/* Gráfica semanal */}
      {!loading && weekData.some(d => d.total > 0) && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Ventas — últimos 7 días</p>
          <div className="flex items-end gap-1.5 h-20">
            {weekData.map(day => {
              const heightPct = maxWeek > 0 ? (day.total / maxWeek) * 100 : 0
              const isToday = day.date === new Date().toISOString().split('T')[0]
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-green-500' : 'bg-green-200'}`}
                      style={{ height: `${Math.max(heightPct, day.total > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] capitalize ${isToday ? 'font-bold text-green-600' : 'text-gray-400'}`}>
                    {day.label.replace('.', '')}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Esta semana: <span className="font-bold text-gray-700">C${weekData.reduce((s, d) => s + d.total, 0).toFixed(0)}</span>
          </p>
        </div>
      )}

      {/* Top productos */}
      {!loading && topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={15} className="text-amber-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Productos más vendidos</p>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-300 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800 truncate pr-2">{p.name}</span>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0">C${p.revenue.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-carmen-400 rounded-full"
                      style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceso rápido */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Negocios</p>
      <div className="space-y-3 mb-5">
        <button
          onClick={() => navigate('/variedades')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border-l-4 border-l-amber-400 active:bg-gray-50 transition-colors"
        >
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center">
            <ShoppingBag size={22} className="text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900">Variedades</p>
            <p className="text-sm text-gray-500">Tienda de ropa y accesorios</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>

        <button
          onClick={() => navigate('/salon')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border-l-4 border-l-violet-400 active:bg-gray-50 transition-colors"
        >
          <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center">
            <Scissors size={22} className="text-violet-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900">Salón de Belleza</p>
            <p className="text-sm text-gray-500">Citas, clientes y servicios</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>

      {/* Citas de hoy */}
      {appointments.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Citas de hoy</p>
          <div className="space-y-2">
            {appointments.slice(0, 4).map(a => (
              <div key={a.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-12 text-center">
                  <p className="text-base font-bold text-violet-600">{a.appointment_time.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{a.client_name}</p>
                  <p className="text-sm text-gray-500 truncate">{a.service_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[a.status] ?? ''}`}>
                  {STATUS_LABELS[a.status]}
                </span>
              </div>
            ))}
            {appointments.length > 4 && (
              <button onClick={() => navigate('/salon/citas')} className="w-full text-center text-sm text-violet-600 font-medium py-2">
                Ver {appointments.length - 4} más →
              </button>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
