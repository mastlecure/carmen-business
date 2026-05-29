import { useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle, ArrowLeft } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import { useInventory } from '../../hooks/useInventory'
import { useSales } from '../../hooks/useSales'
import type { CartItem, Product } from '../../types'

const CATEGORIES = [
  { label: 'Ropa', icon: '👕' },
  { label: 'Bolsos y Mochilas', icon: '👜' },
  { label: 'Zapatos', icon: '👟' },
  { label: 'Bebidas', icon: '🥤' },
  { label: 'Accesorios', icon: '💍' },
  { label: 'Cosméticos', icon: '💄' },
  { label: 'Chiverias', icon: '🎁' },
  { label: 'Otros', icon: '📦' },
]

export default function POS() {
  const { products, loading, refetch } = useInventory('variedades')
  const { registerSale, saving } = useSales()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  const productsInCategory = selectedCategory
    ? products.filter(p => p.stock > 0 && p.category === selectedCategory)
    : []

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

  const removeFromCart = (productId: string) =>
    setCart(prev => prev.filter(i => i.product.id !== productId))

  const total = cart.reduce((sum, i) => sum + i.product.sell_price * i.quantity, 0)
  const paid = parseFloat(paidAmount) || 0
  const change = paid - total

  const handleCheckout = async () => {
    if (cart.length === 0) return
    const { error } = await registerSale('variedades', cart, notes)
    if (!error) {
      setCart([])
      setNotes('')
      setPaidAmount('')
      setSelectedCategory(null)
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
      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando...</p>
      ) : (
        <>
          {/* PASO 1: Elegir categoría */}
          {!selectedCategory && (
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-3 text-center">¿Qué tipo de producto?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const count = products.filter(p => p.stock > 0 && p.category === cat.label).length
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.label)}
                      disabled={count === 0}
                      className="bg-white rounded-3xl py-5 px-4 flex flex-col items-center gap-2 shadow-sm border-2 border-transparent active:scale-95 transition-transform disabled:opacity-40 hover:border-carmen-300"
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm text-center">{cat.label}</span>
                      <span className="text-xs text-gray-400">{count} producto{count !== 1 ? 's' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* PASO 2: Elegir producto */}
          {selectedCategory && (
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-carmen-600 font-semibold mb-4 active:opacity-70"
              >
                <ArrowLeft size={18} /> Cambiar categoría
              </button>

              <p className="text-sm font-semibold text-gray-500 mb-3">
                {CATEGORIES.find(c => c.label === selectedCategory)?.icon} {selectedCategory}
              </p>

              {productsInCategory.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Sin productos con stock en esta categoría</p>
              ) : (
                <div className="space-y-2">
                  {productsInCategory.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full bg-white rounded-2xl p-4 flex justify-between items-center shadow-sm text-left active:bg-carmen-50 border-2 border-transparent active:border-carmen-200 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Stock disponible: {p.stock}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-carmen-600 text-lg">C${p.sell_price.toFixed(2)}</p>
                        <p className="text-xs text-green-600">+ Agregar</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Carrito (siempre visible si hay items) */}
          {cart.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-sm mt-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart size={18} className="text-carmen-600" />
                <span className="font-bold text-gray-900">Carrito ({cart.length})</span>
              </div>

              <div className="space-y-3 mb-4">
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

              <div className="border-t pt-4 space-y-3">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Total a cobrar:</span>
                  <span className="text-2xl font-bold text-carmen-600">C${total.toFixed(2)}</span>
                </div>

                {/* Calculadora de cambio */}
                <div className="bg-gray-50 rounded-2xl p-3">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Cliente pagó (C$)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-lg font-bold text-center focus:outline-none focus:border-carmen-500"
                  />
                  {paid > 0 && (
                    <div className={`mt-2 text-center rounded-xl py-2 font-bold text-lg ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {change >= 0
                        ? `Cambio: C$${change.toFixed(2)}`
                        : `Faltan: C$${Math.abs(change).toFixed(2)}`}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Nota opcional..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />

                <button
                  onClick={handleCheckout}
                  disabled={saving || (paid > 0 && change < 0)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Registrando...' : '✓ Confirmar venta'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
