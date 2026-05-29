import { useState } from 'react'
import type { Product, Business } from '../../types'

const CATEGORIES_VARIEDADES = ['Ropa', 'Bolsos y Mochilas', 'Zapatos', 'Bebidas', 'Accesorios', 'Cosméticos', 'Chiverias', 'Otros']
const CATEGORIES_SALON = ['Tintes', 'Tratamientos', 'Shampoo', 'Acondicionador', 'Aceites', 'Herramientas', 'Otros']

interface AddProductFormProps {
  business: Business
  onSubmit: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  initial?: Product
}

export default function AddProductForm({ business, onSubmit, onCancel, initial }: AddProductFormProps) {
  const cats = business === 'variedades' ? CATEGORIES_VARIEDADES : CATEGORIES_SALON
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? cats[0])
  const [buyPrice, setBuyPrice] = useState(initial?.buy_price?.toString() ?? '0')
  const [sellPrice, setSellPrice] = useState(initial?.sell_price?.toString() ?? '')
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      name: name.trim(),
      category,
      buy_price: parseFloat(buyPrice) || 0,
      sell_price: parseFloat(sellPrice) || 0,
      stock: parseInt(stock) || 0,
      business,
      low_stock_alert: 3,
    })
    setSaving(false)
  }

  const inputClass = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-carmen-500"
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nombre del producto *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Ej: Blusa floral talla M" required />
      </div>
      <div>
        <label className={labelClass}>Categoría</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Precio compra (C$)</label>
          <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className={inputClass} min="0" step="0.01" />
        </div>
        <div>
          <label className={labelClass}>Precio venta (C$) *</label>
          <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className={inputClass} min="0" step="0.01" required />
        </div>
      </div>
      <div>
        <label className={labelClass}>Stock (cantidad)</label>
        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className={inputClass} min="0" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl bg-gray-100 font-semibold">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-carmen-600 text-white font-semibold disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
