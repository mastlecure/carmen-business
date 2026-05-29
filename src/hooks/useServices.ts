import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Service } from '../types'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('name')
    setServices(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [])

  const addService = async (s: Omit<Service, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('services').insert(s)
    if (!error) await fetchServices()
    return { error }
  }

  const updateService = async (id: string, updates: Partial<Service>) => {
    const { error } = await supabase.from('services').update(updates).eq('id', id)
    if (!error) await fetchServices()
    return { error }
  }

  const deleteService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (!error) await fetchServices()
    return { error }
  }

  return { services, loading, addService, updateService, deleteService }
}
