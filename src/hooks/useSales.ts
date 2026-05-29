import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CartItem, Business } from '../types'

export function useSales() {
  const [saving, setSaving] = useState(false)

  const registerSale = async (business: Business, cart: CartItem[], notes?: string) => {
    setSaving(true)
    const total = cart.reduce((sum, item) => sum + item.product.sell_price * item.quantity, 0)

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({ business, total, notes })
      .select()
      .single()

    if (saleError || !sale) { setSaving(false); return { error: saleError } }

    const items = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.sell_price,
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(items)

    for (const item of cart) {
      const newStock = Math.max(0, item.product.stock - item.quantity)
      await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id)
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('cash_register')
      .select()
      .eq('business', business)
      .eq('register_date', today)
      .single()

    if (existing) {
      await supabase.from('cash_register')
        .update({ total_sales: existing.total_sales + total })
        .eq('id', existing.id)
    } else {
      await supabase.from('cash_register').insert({ business, register_date: today, total_sales: total })
    }

    setSaving(false)
    return { error: itemsError, saleId: sale.id }
  }

  return { registerSale, saving }
}
