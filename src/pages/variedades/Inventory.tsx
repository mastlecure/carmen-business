import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Layout from '../../components/shared/Layout'
import Modal from '../../components/shared/Modal'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import ProductCard from '../../components/variedades/ProductCard'
import AddProductForm from '../../components/variedades/AddProductForm'
import { useInventory } from '../../hooks/useInventory'
import { useAuth } from '../../context/AuthContext'
import type { Product } from '../../types'

export default function Inventory() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useInventory('variedades')
  const { mode } = useAuth()
  const isAdmin = mode === 'admin'

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Layout title="Inventario" showBack backTo="/variedades">
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar producto o categoría..."
          className="w-full bg-white border-2 border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-carmen-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={isAdmin}
              onEdit={() => setEditProduct(p)}
              onDelete={() => setDeleteId(p.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10">No hay productos</p>
          )}
        </div>
      )}

      {isAdmin && (
        <button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-carmen-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-carmen-700 active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar producto">
        <AddProductForm
          business="variedades"
          onSubmit={async (p) => { await addProduct(p); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Editar producto">
        {editProduct && (
          <AddProductForm
            business="variedades"
            initial={editProduct}
            onSubmit={async (p) => { await updateProduct(editProduct.id, p); setEditProduct(null) }}
            onCancel={() => setEditProduct(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        message="¿Eliminar este producto del inventario?"
        confirmLabel="Eliminar"
        confirmColor="red"
        onConfirm={async () => { if (deleteId) { await deleteProduct(deleteId); setDeleteId(null) } }}
        onCancel={() => setDeleteId(null)}
      />
    </Layout>
  )
}
