import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import { useInventory } from '../../hooks/useInventory'
import { useSales } from '../../hooks/useSales'
import type { CartItem, Product } from '../../types'

export default function POS() {
  const { products, loading, refetch } = useInventory('variedades')
  const { registerSale, saving } = useSales()
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')

  const filtered = products
    .filter(p => p.stock > 0)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    )

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.product.id !== productId))

  const total = cart.reduce((sum, i) => sum + i.product.sell_price * i.quantity, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    const { error } = await registerSale('variedades', cart, notes)
    if (!error) {
      setCart([])
      setNotes('')
      setSuccess(true)
      await refetch()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (success) {
    return (
      <Layout title="Venta registrada" showBack backTo="/variedades">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <CheckCircle size={80} className="text-green-500" />
          <p className="text-2xl font-bold text-gray-900">¡Venta exitosa!</p>
          <p className="text-gray-500">El inventario fue actualizado</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Registrar venta" showBack backTo="/variedades">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar producto..."
        className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:border-carmen-500"
      />

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-4">Cargando...</p>
        ) : filtered.map(p => (
          <button key={p.id} onClick={() => addToCart(p)}
            className="w-full bg-white rounded-2xl p-3 flex justify-between items-center shadow-sm text-left active:bg-gray-50">
            <div>
              <p className="font-medium text-gray-900">{p.name}</p>
              <p className="text-xs text-gray-400">{p.category} · Stock: {p.stock}</p>
            </div>
            <span className="font-bold text-carmen-600">C${p.sell_price.toFixed(2)}</span>
          </button>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart size={18} className="text-carmen-600" />
            <span className="font-bold text-gray-900">Carrito</span>
          </div>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">C${(item.product.sell_price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={14} /></button>
                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Plus size={14} /></button>
                  <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-3">
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Nota opcional..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3"
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-carmen-600">C${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-50"
            >
              {saving ? 'Registrando...' : '✓ Confirmar venta'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
