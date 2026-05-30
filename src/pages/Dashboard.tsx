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
  pending:   'text-amber-700 bg-amber-50 border border-amber-100',
  confirmed: 'text-blue-700 bg-blue-50 border border-blue-100',
  done:      'text-green-700 bg-green-50 border border-green-100',
  cancelled: 'text-red-600 bg-red-50 border border-red-100',
}

interface DayData    { date: string; label: string; total: number }
interface TopProduct { name: string; revenue: number; qty: number }

function StatCard({ icon, label, value, bg, iconColor, valueColor }:
  { icon: React.ReactNode; label: string; value: string; bg: string; iconColor: string; valueColor: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col gap-2`}>
      <div className={`w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold leading-tight ${valueColor}`}>{value}</p>
      <p className="text-xs font-medium opacity-70">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [todaySales, setTodaySales]   = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [lowStock, setLowStock]       = useState(0)
  const [weekData, setWeekData]       = useState<DayData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading]         = useState(true)

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

      const map: Record<string, TopProduct> = {}
      ;(items ?? []).forEach(item => {
        if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, revenue: 0, qty: 0 }
        map[item.product_name].revenue += item.quantity * item.unit_price
        map[item.product_name].qty += item.quantity
      })
      setTopProducts(Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 4))
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
        <p className="text-sm font-medium text-gray-400 mb-0.5">
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h2 className="font-display text-3xl font-bold text-gray-900 italic leading-tight">
          {greeting},<br />Carmen
        </h2>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatCard
            icon={<TrendingUp size={16} />}
            label="Ventas hoy"
            value={`C$${todaySales.toFixed(0)}`}
            bg="bg-gradient-to-br from-green-400 to-green-600"
            iconColor="text-green-700"
            valueColor="text-white"
          />
          <StatCard
            icon={<CalendarClock size={16} />}
            label="Citas hoy"
            value={String(appointments.length)}
            bg="bg-gradient-to-br from-salon-400 to-salon-600"
            iconColor="text-salon-700"
            valueColor="text-white"
          />
          <StatCard
            icon={<AlertTriangle size={16} />}
            label="Stock bajo"
            value={String(lowStock)}
            bg={lowStock > 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-gray-200 to-gray-300'}
            iconColor={lowStock > 0 ? 'text-amber-700' : 'text-gray-500'}
            valueColor={lowStock > 0 ? 'text-white' : 'text-gray-600'}
          />
        </div>
      )}

      {/* Gráfica semanal */}
      {!loading && weekData.some(d => d.total > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ventas — 7 días</p>
          <div className="flex items-end gap-1.5" style={{ height: '72px' }}>
            {weekData.map(day => {
              const heightPct = (day.total / maxWeek) * 100
              const isToday = day.date === new Date().toISOString().split('T')[0]
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '52px' }}>
                    <div
                      className="w-full rounded-t-md transition-all"
                      style={{
                        height: day.total > 0 ? `${Math.max(heightPct, 8)}%` : '3px',
                        background: isToday
                          ? 'linear-gradient(180deg, #e97752, #C4614A)'
                          : day.total > 0
                            ? 'linear-gradient(180deg, #D0C4B8, #B0A095)'
                            : '#E8DDD4',
                      }}
                    />
                  </div>
                  <span className={`text-[9px] capitalize font-medium ${isToday ? 'text-carmen-600 font-bold' : 'text-gray-400'}`}>
                    {day.label.replace('.', '')}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Total semana</span>
            <span className="text-sm font-bold text-gray-800">C${weekData.reduce((s, d) => s + d.total, 0).toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Top productos */}
      {!loading && topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={14} className="text-store-500" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Más vendidos</p>
          </div>
          <div className="space-y-3.5">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-gray-300 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-800 truncate pr-2">{p.name}</span>
                    <span className="text-sm font-bold text-gray-700 flex-shrink-0">C${p.revenue.toFixed(0)}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(p.revenue / topProducts[0].revenue) * 100}%`,
                        background: 'linear-gradient(90deg, #e97752, #C4614A)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negocios */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Negocios</p>
      <div className="space-y-3 mb-5">
        <button
          onClick={() => navigate('/variedades')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-200 active:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f4d38a, #B8782A)' }}>
            <ShoppingBag size={22} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Variedades</p>
            <p className="text-sm text-gray-400 font-light">Ropa · Calzado · Accesorios</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>

        <button
          onClick={() => navigate('/salon')}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-200 active:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #d4bff0, #7B5EA7)' }}>
            <Scissors size={22} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900">Salón de Belleza</p>
            <p className="text-sm text-gray-400 font-light">Citas · Clientes · Servicios</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </button>
      </div>

      {/* Citas de hoy */}
      {appointments.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Citas de hoy</p>
          <div className="space-y-2">
            {appointments.slice(0, 4).map(a => (
              <div key={a.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-200">
                <div className="w-14 flex-shrink-0 text-center">
                  <p className="text-sm font-bold text-salon-600">{a.appointment_time.slice(0, 5)}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{a.client_name}</p>
                  <p className="text-xs text-gray-400 truncate">{a.service_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_COLORS[a.status] ?? ''}`}>
                  {STATUS_LABELS[a.status]}
                </span>
              </div>
            ))}
            {appointments.length > 4 && (
              <button
                onClick={() => navigate('/salon/citas')}
                className="w-full text-center text-sm text-salon-600 font-semibold py-2"
              >
                Ver {appointments.length - 4} más →
              </button>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
