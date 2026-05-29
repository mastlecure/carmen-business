import { useState } from 'react'
import { Plus, Phone, Pencil, Trash2, Search } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import { useClients } from '../../hooks/useClients'
import { useAuth } from '../../context/AuthContext'
import type { Client } from '../../types'

interface ClientFormProps {
  initial?: Client
  onSubmit: (c: Omit<Client, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

function ClientForm({ initial, onSubmit, onCancel }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [birthday, setBirthday] = useState(initial?.birthday ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const inputClass = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-salon-500"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      birthday: birthday || undefined,
      notes: notes.trim() || undefined,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Nombre completo" required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="Ej: 8888-0000" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Cumpleaños</label>
        <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Notas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} rows={3} placeholder="Tipo de cabello, alergias, preferencias..." />
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

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients()
  const { mode } = useAuth()
  const isAdmin = mode === 'admin'
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  return (
    <Layout title="Clientes" showBack backTo="/salon">
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-salon-500" />
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 bg-salon-100 rounded-full flex items-center justify-center text-salon-600 font-bold text-lg flex-shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-sm text-salon-600 flex items-center gap-1">
                    <Phone size={12} /> {c.phone}
                  </a>
                )}
                {c.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{c.notes}</p>}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => setEditClient(c)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No hay clientes</p>}
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-salon-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-salon-600 active:scale-95 transition-transform">
        <Plus size={28} />
      </button>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar cliente">
        <ClientForm onSubmit={async c => { await addClient(c); setShowAdd(false) }} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal open={!!editClient} onClose={() => setEditClient(null)} title="Editar cliente">
        {editClient && (
          <ClientForm initial={editClient} onSubmit={async c => { await updateClient(editClient.id, c); setEditClient(null) }} onCancel={() => setEditClient(null)} />
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} message="¿Eliminar este cliente?" confirmLabel="Eliminar" confirmColor="red"
        onConfirm={async () => { if (deleteId) { await deleteClient(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)} />
    </Layout>
  )
}
