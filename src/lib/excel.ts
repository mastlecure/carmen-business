import * as XLSX from 'xlsx'
import type { Product, Sale, Appointment } from '../types'

export function exportInventoryToExcel(products: Product[], filename = 'inventario') {
  const data = products.map(p => ({
    'Nombre': p.name,
    'Categoría': p.category,
    'Precio compra (C$)': p.buy_price,
    'Precio venta (C$)': p.sell_price,
    'Stock': p.stock,
    'Alerta stock mínimo': p.low_stock_alert,
    'Creado': new Date(p.created_at).toLocaleDateString('es-NI'),
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportSalesToExcel(sales: Sale[], filename = 'ventas') {
  const data = sales.map(s => ({
    'Fecha': new Date(s.created_at).toLocaleDateString('es-NI'),
    'Hora': new Date(s.created_at).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }),
    'Total (C$)': s.total,
    'Nota': s.notes ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas')
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportAppointmentsToExcel(appointments: Appointment[], filename = 'citas-salon') {
  const data = appointments.map(a => ({
    'Fecha': a.appointment_date,
    'Hora': a.appointment_time,
    'Cliente': a.client_name,
    'Servicio': a.service_name,
    'Precio (C$)': a.service_price,
    'Estado': { pending: 'Pendiente', confirmed: 'Confirmada', done: 'Realizada', cancelled: 'Cancelada' }[a.status] ?? a.status,
    'Notas': a.notes ?? '',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Citas')
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}
