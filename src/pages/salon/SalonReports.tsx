import { useState, useEffect } from 'react'
import { TrendingUp, FileDown, CheckCircle } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import { supabase } from '../../lib/supabase'
import { exportAppointmentsToExcel } from '../../lib/excel'
import { localDate } from '../../lib/date'
import type { Appointment } from '../../types'

interface DayData { date: string; label: string; income: number; count: number }

export default function SalonReports() {
  const [todayIncome, setTodayIncome] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [recent, setRecent] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = localDate()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = localDate(sevenDaysAgo)

    Promise.all([
      supabase.from('appointments').select('*').eq('status', 'done').gte('appointment_date', startDate).order('appointment_date', { ascending: false }),
    ]).then(([{ data: appts }]) => {
      const all = (appts ?? []) as Appointment[]

      // Today
      const todayDone = all.filter(a => a.appointment_date === today)
      setTodayIncome(todayDone.reduce((s, a) => s + a.service_price, 0))
      setTodayCount(todayDone.length)

      // 7-day chart
      const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = localDate(d)
        const dayAppts = all.filter(a => a.appointment_date === dateStr)
        return {
          date: dateStr,
          label: d.toLocaleDateString('es-NI', { weekday: 'short' }),
          income: dayAppts.reduce((s, a) => s + a.service_price, 0),
          count: dayAppts.length,
        }
      })
      setWeekData(days)

      // Recent 15 done appointments
      setRecent(all.slice(0, 15))
      setLoading(false)
    })
  }, [])

  const weekTotal = weekData.reduce((s, d) => s + d.income, 0)
  const maxIncome = Math.max(...weekData.map(d => d.income), 1)

  return (
    <Layout title="Reportes — Salón" showBack backTo="/salon">
      {/* Caja del día */}
      <div className="bg-white rounded-2xl p-5 mb-4 border-l-4 border-l-violet-400 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-violet-600">
          <TrendingUp size={18} />
          <span className="font-bold text-sm">Ingresos hoy</span>
        </div>
        <p className="text-4xl font-bold text-gray-900">C${todayIncome.toFixed(2)}</p>
        <p className="text-gray-400 text-sm mt-1">
          {todayCount} cita{todayCount !== 1 ? 's' : ''} completada{todayCount !== 1 ? 's' : ''} ·{' '}
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Gráfica semanal */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Ingresos — últimos 7 días</p>
          <div className="flex items-end gap-1.5 h-20">
            {weekData.map(day => {
              const heightPct = maxIncome > 0 ? (day.income / maxIncome) * 100 : 0
              const isToday = day.date === localDate()
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-violet-500' : 'bg-violet-200'}`}
                      style={{ height: `${Math.max(heightPct, day.income > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] capitalize ${isToday ? 'font-bold text-violet-600' : 'text-gray-400'}`}>
                    {day.label.replace('.', '')}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Esta semana: <span className="font-bold text-gray-700">C${weekTotal.toFixed(0)}</span>
          </p>
        </div>
      )}

      {/* Exportar */}
      <button
        onClick={() => exportAppointmentsToExcel(recent, 'citas-salon')}
        className="w-full bg-white border border-gray-200 border-l-4 border-l-violet-400 rounded-2xl p-4 flex items-center gap-3 mb-4 active:bg-gray-50"
      >
        <FileDown size={22} className="text-violet-500" />
        <span className="font-bold text-gray-700 flex-1 text-left">Exportar citas a Excel</span>
        <span className="text-xs text-gray-400">últimas 15 →</span>
      </button>

      {/* Citas completadas recientes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" />
          <h3 className="font-bold text-gray-900">Citas completadas</h3>
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Sin citas completadas aún</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(a => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 text-center flex-shrink-0">
                  <p className="text-xs font-bold text-violet-600">{a.appointment_time.slice(0, 5)}</p>
                  <p className="text-[10px] text-gray-400">{new Date(a.appointment_date + 'T12:00:00').toLocaleDateString('es-NI', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{a.client_name}</p>
                  <p className="text-xs text-gray-400 truncate">{a.service_name}</p>
                </div>
                <span className="font-bold text-violet-600 flex-shrink-0">C${a.service_price.toFixed(0)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
