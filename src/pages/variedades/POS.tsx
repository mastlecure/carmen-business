import { useState, useRef, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle, ArrowLeft, Mic, MicOff, Scan, Tag, ShoppingBag, Package, Coffee, Star, Sparkles, Gift, Box, Camera, type LucideProps } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import BarcodeScanner from '../../components/shared/BarcodeScanner'
import { useInventory } from '../../hooks/useInventory'
import { useSales } from '../../hooks/useSales'
import type { CartItem, Product } from '../../types'

type IconComponent = React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>

const CATEGORIES: { label: string; icon: IconComponent }[] = [
  { label: 'Ropa',             icon: Tag },
  { label: 'Bolsos y Mochilas', icon: ShoppingBag },
  { label: 'Zapatos',          icon: Package },
  { label: 'Bebidas',          icon: Coffee },
  { label: 'Accesorios',       icon: Star },
  { label: 'Cosméticos',       icon: Sparkles },
  { label: 'Chiverias',        icon: Gift },
  { label: 'Otros',            icon: Box },
]

export default function POS() {
  const { products, loading, refetch } = useInventory('variedades')
  const { registerSale, saving } = useSales()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [notes, setNotes] = useState('')
  const [paidAmount, setPaidAmount] = useState('')

  // Barcode
  const [barcodeInput, setBarcodeInput] = useState('')
  const [barcodeMsg, setBarcodeMsg] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Audio
  const [listening, setListening] = useState(false)
  const [audioResult, setAudioResult] = useState('')
  const [audioMsg, setAudioMsg] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (barcodeMsg) {
      const t = setTimeout(() => setBarcodeMsg(''), 2000)
      return () => clearTimeout(t)
    }
  }, [barcodeMsg])

  useEffect(() => {
    if (audioMsg) {
      const t = setTimeout(() => setAudioMsg(''), 3000)
      return () => clearTimeout(t)
    }
  }, [audioMsg])

  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        const newQty = existing.quantity + qty
        if (newQty > product.stock) return prev
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i)
      }
      if (qty > product.stock) return prev
      return [...prev, { product, quantity: qty }]
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

  // Barcode scan
  const handleBarcodeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      lookupBarcode(barcodeInput.trim())
      setBarcodeInput('')
    }
  }

  const lookupBarcode = (code: string) => {
    const found = products.find(p => p.barcode === code && p.stock > 0)
    if (found) {
      addToCart(found)
      setBarcodeMsg(`✓ ${found.name} agregado`)
    } else {
      setBarcodeMsg('Producto no encontrado')
    }
  }

  // Audio mode
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setAudioMsg('Tu navegador no soporta el modo de voz')
      return
    }

    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = 'es-419'
    recognition.interimResults = false
    recognition.maxAlternatives = 3

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      setAudioResult(transcript)
      parseAndAdd(transcript)
    }

    recognition.onerror = () => {
      setListening(false)
      setAudioMsg('No se escuchó nada, intenta de nuevo')
    }

    recognition.onend = () => setListening(false)

    setListening(true)
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const parseAndAdd = (text: string) => {
    const lower = text.toLowerCase().trim()
    const numWords: Record<string, number> = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 }

    let qty = 1
    let productText = lower

    const numMatch = lower.match(/^(\d+)\s+(.+)/)
    if (numMatch) {
      qty = parseInt(numMatch[1])
      productText = numMatch[2]
    } else {
      for (const [word, num] of Object.entries(numWords)) {
        if (lower.startsWith(word + ' ')) {
          qty = num
          productText = lower.slice(word.length + 1)
          break
        }
      }
    }

    const available = products.filter(p => p.stock > 0)
    const found = available.find(p => {
      const pn = p.name.toLowerCase()
      return pn.includes(productText) ||
        productText.includes(pn) ||
        pn.split(' ').some(w => w.length > 3 && productText.includes(w))
    })

    if (found) {
      addToCart(found, qty)
      setAudioMsg(`✓ ${qty > 1 ? qty + 'x ' : ''}${found.name} agregado`)
    } else {
      setAudioMsg(`No encontré "${productText}"`)
    }
  }

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

  if (showScanner) {
    return (
      <BarcodeScanner
        onScan={(code) => {
          setShowScanner(false)
          lookupBarcode(code)
        }}
        onClose={() => setShowScanner(false)}
      />
    )
  }

  if (success) {
    return (
      <Layout title="Venta registrada" showBack backTo="/variedades">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={52} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">¡Venta exitosa!</p>
          <p className="text-gray-400">El inventario fue actualizado</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Registrar venta" showBack backTo="/variedades">
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Barcode scan */}
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2 items-center bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-carmen-400 transition-colors">
                <Scan size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeKey}
                  placeholder="Código de barras..."
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </div>
              <button
                onClick={() => setShowScanner(true)}
                className="flex-shrink-0 w-14 bg-carmen-50 border-2 border-carmen-200 rounded-2xl flex items-center justify-center text-carmen-600 active:bg-carmen-100 transition-colors"
              >
                <Camera size={22} />
              </button>
            </div>
            {barcodeMsg && (
              <p className={`text-sm mt-1.5 ml-1 font-medium ${barcodeMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {barcodeMsg}
              </p>
            )}
          </div>

          {/* Audio mode */}
          <div className="mb-4">
            <button
              onClick={listening ? stopListening : startListening}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all ${
                listening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-carmen-300'
              }`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
              {listening ? 'Escuchando... (toca para parar)' : 'Modo de voz'}
            </button>
            {audioResult && !listening && (
              <p className="text-xs text-gray-400 mt-1 ml-1">Escuché: "{audioResult}"</p>
            )}
            {audioMsg && (
              <p className={`text-sm mt-1 ml-1 font-medium ${audioMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {audioMsg}
              </p>
            )}
          </div>

          {/* Categorías */}
          {!selectedCategory && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">¿Qué tipo de producto?</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const count = products.filter(p => p.stock > 0 && p.category === cat.label).length
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.label)}
                      disabled={count === 0}
                      className="bg-white rounded-2xl py-5 px-4 flex flex-col items-center gap-2 shadow-sm border border-gray-100 border-l-4 border-l-carmen-400 active:scale-95 transition-transform disabled:opacity-40"
                    >
                      <cat.icon size={26} className="text-carmen-500" />
                      <span className="font-bold text-gray-800 text-sm text-center">{cat.label}</span>
                      <span className="text-xs text-gray-400">{count} producto{count !== 1 ? 's' : ''}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* Productos de la categoría */}
          {selectedCategory && (
            <>
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-carmen-600 font-bold mb-4 active:opacity-70"
              >
                <ArrowLeft size={18} /> Cambiar categoría
              </button>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{selectedCategory}</p>

              {products.filter(p => p.stock > 0 && p.category === selectedCategory).length === 0 ? (
                <p className="text-center text-gray-400 py-10">Sin productos con stock</p>
              ) : (
                <div className="space-y-2">
                  {products.filter(p => p.stock > 0 && p.category === selectedCategory).map(p => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm text-left active:bg-gray-50 border border-gray-100"
                    >
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base truncate">{p.name}</p>
                        <p className="text-sm text-gray-400">Stock: {p.stock}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-carmen-600 text-lg">C${p.sell_price.toFixed(2)}</p>
                        <p className="text-xs text-green-600 font-medium">+ Agregar</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Carrito */}
          {cart.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm mt-4 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <ShoppingCart size={18} className="text-carmen-600" />
                <span className="font-bold text-gray-900">Carrito</span>
                <span className="ml-auto text-sm text-gray-400">{cart.length} ítem{cart.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="px-4 py-3 space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">C${(item.product.sell_price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.product.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"><Minus size={14} /></button>
                      <span className="w-6 text-center font-bold text-base">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"><Plus size={14} /></button>
                      <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 active:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700 text-base">Total a cobrar:</span>
                  <span className="text-2xl font-bold text-carmen-600">C${total.toFixed(2)}</span>
                </div>

                {/* Calculadora de cambio */}
                <div className="bg-gray-50 rounded-2xl p-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Cliente pagó (C$)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-3 py-2.5 text-xl font-bold text-center focus:outline-none focus:border-carmen-400"
                  />
                  {paid > 0 && (
                    <div className={`mt-2 text-center rounded-xl py-2.5 font-bold text-lg ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {change >= 0 ? `Cambio: C$${change.toFixed(2)}` : `Faltan: C$${Math.abs(change).toFixed(2)}`}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Nota opcional..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                />

                <button
                  onClick={handleCheckout}
                  disabled={saving || (paid > 0 && change < 0)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-50 active:bg-green-700 transition-colors"
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
