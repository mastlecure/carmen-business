import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useServices } from '../../hooks/useServices'
import { useAuth } from '../../context/AuthContext'
import type { Service } from '../../types'

interface ServiceFormProps {
  initial?: Service
  onSubmit: (s: Omit<Service, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [duration, setDuration] = useState(initial?.duration_minutes?.toString() ?? '60')
  const [saving, setSaving] = useState(false)

  const inputClass = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-salon-500"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({ name: name.trim(), price: parseFloat(price), duration_minutes: parseInt(duration), active: true })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del servicio *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Ej: Corte y peinado" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (C$) *</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} min="0" step="0.01" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Duración (min)</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} min="15" step="15" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl bg-gray-100 font-semibold">Cancelar</button>
        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-salon-500 text-white font-semibold disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function Services() {
  const { services, loading, addService, updateService, deleteService } = useServices()
  const { mode } = useAuth()
  const isAdmin = mode === 'admin'
  const [showAdd, setShowAdd] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <Layout title="Servicios" showBack backTo="/salon">
      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.duration_minutes} min · <span className="text-salon-600 font-bold">C${s.price.toFixed(2)}</span></p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => setEditService(s)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
          {services.length === 0 && <p className="text-center text-gray-400 py-10">No hay servicios aún</p>}
        </div>
      )}

      {isAdmin && (
        <button onClick={() => setShowAdd(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-salon-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-salon-600 active:scale-95 transition-transform">
          <Plus size={28} />
        </button>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar servicio">
        <ServiceForm onSubmit={async s => { await addService(s); setShowAdd(false) }} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editService} onClose={() => setEditService(null)} title="Editar servicio">
        {editService && (
          <ServiceForm initial={editService} onSubmit={async s => { await updateService(editService.id, s); setEditService(null) }} onCancel={() => setEditService(null)} />
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} message="¿Eliminar este servicio?" confirmLabel="Eliminar" confirmColor="red"
        onConfirm={async () => { if (deleteId) { await deleteService(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} />
    </Layout>
  )
}
