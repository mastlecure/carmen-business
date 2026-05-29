import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  isAdmin: boolean
}

export default function ProductCard({ product, onEdit, onDelete, isAdmin }: ProductCardProps) {
  const isLow = product.stock <= product.low_stock_alert

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
          {isLow && <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-500">{product.category}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-carmen-600 font-bold">C${product.sell_price.toFixed(2)}</span>
          <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            Stock: {product.stock}
          </span>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
