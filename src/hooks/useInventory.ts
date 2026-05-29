import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Business } from '../types'

export function useInventory(business: Business) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business', business)
      .order('name')
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [business])

  const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('products').insert(product)
    if (!error) await fetchProducts()
    return { error }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id)
    if (!error) await fetchProducts()
    return { error }
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) await fetchProducts()
    return { error }
  }

  const updateStock = async (id: string, delta: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    const newStock = Math.max(0, product.stock + delta)
    await updateProduct(id, { stock: newStock })
  }

  return { products, loading, addProduct, updateProduct, deleteProduct, updateStock, refetch: fetchProducts }
}
