import { useState, useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import type { Product, Business } from '../../types'
import { uploadProductImage } from '../../lib/storage'

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
  const [barcode, setBarcode] = useState(initial?.barcode ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const inputClass = "w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base focus:outline-none focus:border-carmen-400 transition-colors"
  const labelClass = "block text-sm font-bold text-gray-600 mb-1.5"

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let finalImageUrl = imageUrl

    if (imageFile) {
      const uploaded = await uploadProductImage(imageFile)
      if (uploaded) finalImageUrl = uploaded
    }

    await onSubmit({
      name: name.trim(),
      category,
      buy_price: parseFloat(buyPrice) || 0,
      sell_price: parseFloat(sellPrice) || 0,
      stock: parseInt(stock) || 0,
      business,
      low_stock_alert: 3,
      barcode: barcode.trim() || undefined,
      image_url: finalImageUrl || undefined,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Foto */}
      <div>
        <label className={labelClass}>Foto del producto</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center cursor-pointer hover:border-carmen-300 transition-colors overflow-hidden"
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setImagePreview(''); setImageFile(null); setImageUrl('') }}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow"
              >
                <X size={12} className="text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImagePlus size={28} />
              <span className="text-sm">Toca para agregar foto</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      </div>

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

      <div>
        <label className={labelClass}>Código de barras (opcional)</label>
        <input
          type="text"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          className={inputClass}
          placeholder="Escanea o escribe el código"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-gray-100 font-bold text-gray-700 active:bg-gray-200">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-4 rounded-2xl bg-carmen-600 text-white font-bold disabled:opacity-50 active:bg-carmen-700">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
