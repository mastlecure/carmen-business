export type Business = 'variedades' | 'salon'
export type AppMode = 'carmen' | 'admin'

export interface Product {
  id: string
  name: string
  category: string
  buy_price: number
  sell_price: number
  stock: number
  business: Business
  low_stock_alert: number
  created_at: string
}

export interface Sale {
  id: string
  business: Business
  total: number
  notes?: string
  created_at: string
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export interface Client {
  id: string
  name: string
  phone?: string
  birthday?: string
  notes?: string
  created_at: string
}

export interface Service {
  id: string
  name: string
  price: number
  duration_minutes: number
  active: boolean
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'done' | 'cancelled'

export interface Appointment {
  id: string
  client_id: string
  client_name: string
  service_id: string
  service_name: string
  service_price: number
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
}

export interface CashRegister {
  id: string
  business: Business
  register_date: string
  total_sales: number
  notes?: string
}

export interface CartItem {
  product: Product
  quantity: number
}
