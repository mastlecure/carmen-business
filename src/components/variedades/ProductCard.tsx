import { Pencil, Trash2, AlertTriangle, Package } from 'lucide-react'
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 overflow-hidden">
      {/* Foto o placeholder */}
      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Package size={22} className="text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 py-3">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-gray-900 truncate text-base">{product.name}</p>
          {isLow && <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-carmen-600 font-bold text-base">C${product.sell_price.toFixed(2)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}>
            Stock: {product.stock}
          </span>
        </div>
        {product.barcode && (
          <p className="text-xs text-gray-300 mt-0.5 font-mono">{product.barcode}</p>
        )}
      </div>

      {isAdmin && (
        <div className="flex flex-col gap-1 pr-3">
          <button
            onClick={onEdit}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-400 active:bg-red-100"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
