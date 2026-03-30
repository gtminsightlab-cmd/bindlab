import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { NaicsCode } from '../types/database'

export function useNaicsCodes() {
  const [codes, setCodes] = useState<NaicsCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('naics_codes')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCodes(data || [])
      }
      setLoading(false)
    }

    fetchCodes()
  }, [])

  return { codes, loading, error }
}

export function useNaicsCodeSearch() {
  const [searchResults, setSearchResults] = useState<NaicsCode[]>([])
  const [allCodes, setAllCodes] = useState<NaicsCode[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('naics_codes')
        .select('*')
        .eq('is_active', true)
        .order('code')
        .limit(100)

      setAllCodes(data || [])
    }
    fetchAll()
  }, [])

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('naics_codes')
        .select('*')
        .eq('is_active', true)
        .or(`code.ilike.%${query}%,title.ilike.%${query}%,sector.ilike.%${query}%`)
        .order('code')
        .limit(50)

      setSearchResults(data || [])
      setLoading(false)
    }, 300)
  }, [])

  return { searchResults, allCodes, search, loading }
}
