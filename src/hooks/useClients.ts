import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Client, ClientFormData } from '../types/database'

interface UseClientsOptions {
  orgId: string | null
  search?: string
  stateFilter?: string
  sortField?: keyof Client
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => void
  addClient: (data: ClientFormData) => Promise<{ error: string | null }>
  updateClient: (id: string, data: Partial<ClientFormData>) => Promise<{ error: string | null }>
}

export function useClients({
  orgId,
  search = '',
  stateFilter = '',
  sortField = 'business_name',
  sortDirection = 'asc',
  page = 1,
  pageSize = 25,
}: UseClientsOptions): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchClients = useCallback(async () => {
    if (!orgId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let query = supabase
      .from('clients')
      .select('*, producer:profiles!clients_producer_id_fkey(id, first_name, last_name)', { count: 'exact' })
      .eq('org_id', orgId)

    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,primary_contact_name.ilike.%${search}%,state.ilike.%${search}%`
      )
    }

    if (stateFilter) {
      query = query.eq('state', stateFilter)
    }

    query = query
      .order(sortField, { ascending: sortDirection === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setClients(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }, [orgId, search, stateFilter, sortField, sortDirection, page, pageSize])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = async (data: ClientFormData): Promise<{ error: string | null }> => {
    if (!orgId) {
      return { error: 'No organization found' }
    }

    const { error: insertError } = await supabase.from('clients').insert({
      ...data,
      org_id: orgId,
    })

    if (insertError) {
      return { error: insertError.message }
    }

    await fetchClients()
    return { error: null }
  }

  const updateClient = async (id: string, data: Partial<ClientFormData>): Promise<{ error: string | null }> => {
    const { error: updateError } = await supabase
      .from('clients')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return { error: updateError.message }
    }

    await fetchClients()
    return { error: null }
  }

  return {
    clients,
    loading,
    error,
    totalCount,
    refetch: fetchClients,
    addClient,
    updateClient,
  }
}
