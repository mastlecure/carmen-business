import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Appointment, AppointmentStatus } from '../types'

export function useAppointments(date?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async (d?: string) => {
    setLoading(true)
    let query = supabase.from('appointments').select('*').order('appointment_time')
    if (d) query = query.eq('appointment_date', d)
    const { data } = await query
    setAppointments(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAppointments(date) }, [date])

  const addAppointment = async (a: Omit<Appointment, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('appointments').insert(a)
    if (!error) await fetchAppointments(date)
    return { error }
  }

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (!error) await fetchAppointments(date)
    return { error }
  }

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (!error) await fetchAppointments(date)
    return { error }
  }

  return { appointments, loading, addAppointment, updateStatus, deleteAppointment }
}
