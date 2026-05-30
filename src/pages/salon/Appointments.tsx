import { useState } from 'react'
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useAppointments } from '../../hooks/useAppointments'
import { useClients } from '../../hooks/useClients'
import { useServices } from '../../hooks/useServices'
import { localDate } from '../../lib/date'
import type { AppointmentStatus } from '../../types'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  done:      'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', done: 'Realizada', cancelled: 'Cancelada',
}

function AppointmentForm({ onSubmit, onCancel }: { onSubmit: (a: any) => Promise<void>; onCancel: () => void }) {
  const { clients } = useClients()
  const { services } = useServices()
  const [clientId, setClientId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(localDate())
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const inputClass = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-salon-500"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !serviceId) return
    setSaving(true)
    const client = clients.find(c => c.id === clientId)!
    const service = services.find(s => s.id === serviceId)!
    await onSubmit({
      client_id: clientId,
      client_name: client.name,
      service_id: serviceId,
      service_name: service.name,
      service_price: service.price,
      appointment_date: date,
      appointment_time: time,
      status: 'pending' as AppointmentStatus,
      notes: notes.trim() || undefined,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente *</label>
        <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputClass} required>
          <option value="">Seleccionar cliente...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Servicio *</label>
        <select value={serviceId} onChange={e => setServiceId(e.target.value)} className={inputClass} required>
          <option value="">Seleccionar servicio...</option>
          {services.filter(s => s.active).map(s => (
            <option key={s.id} value={s.id}>{s.name} — C${s.price}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hora *</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Notas</label>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Opcional..." />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl bg-gray-100 font-semibold">Cancelar</button>
        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-salon-500 text-white font-semibold disabled:opacity-50">
          {saving ? 'Guardando...' : 'Agendar'}
        </button>
      </div>
    </form>
  )
}

export default function Appointments() {
  const today = localDate()
  const [selectedDate, setSelectedDate] = useState(today)
  const { appointments, loading, addAppointment, updateStatus, deleteAppointment } = useAppointments(selectedDate)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <Layout title="Agenda de citas" showBack backTo="/salon">
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 mb-4 text-base focus:outline-none focus:border-salon-500"
      />

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-gray-900">{a.client_name}</p>
                  <p className="text-sm text-gray-600">
                    {a.service_name} · <span className="text-salon-600 font-semibold">C${a.service_price}</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={12} /> {a.appointment_time}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[a.status]}`}>
                  {STATUS_LABELS[a.status]}
                </span>
              </div>
              {a.notes && <p className="text-xs text-gray-500 mb-2">{a.notes}</p>}
              <div className="flex gap-2">
                {a.status === 'pending' && (
                  <button onClick={() => updateStatus(a.id, 'confirmed')}
                    className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium">
                    Confirmar
                  </button>
                )}
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <button onClick={() => updateStatus(a.id, 'done')}
                    className="flex-1 py-2 rounded-xl bg-green-50 text-green-600 text-sm font-medium flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Realizada
                  </button>
                )}
                <button onClick={() => setDeleteId(a.id)}
                  className="py-2 px-3 rounded-xl bg-red-50 text-red-500 text-sm">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="text-center text-gray-400 py-10">No hay citas para este día</p>
          )}
        </div>
      )}

      <button onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-salon-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-salon-600 active:scale-95 transition-transform">
        <Plus size={28} />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nueva cita">
        <AppointmentForm onSubmit={async a => { await addAppointment(a); setShowAdd(false) }} onCancel={() => setShowAdd(false)} />
      </Modal>

      <ConfirmDialog open={!!deleteId} message="¿Eliminar esta cita?" confirmLabel="Eliminar" confirmColor="red"
        onConfirm={async () => { if (deleteId) { await deleteAppointment(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} />
    </Layout>
  )
}
