import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Client } from '../types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const fetchClients = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const addClient = async (c: Omit<Client, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('clients').insert(c)
    if (!error) await fetchClients()
    return { error }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id)
    if (!error) await fetchClients()
    return { error }
  }

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) await fetchClients()
    return { error }
  }

  return { clients, loading, addClient, updateClient, deleteClient }
}
