import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { GlClassCode } from '../types/database'

export function useGlClassCodes() {
  const [codes, setCodes] = useState<GlClassCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCodes = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('gl_class_codes')
        .select('*')
        .eq('is_active', true)
        .order('class_code')

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

export function useGlClassCodeSearch() {
  const [searchResults, setSearchResults] = useState<GlClassCode[]>([])
  const [allCodes, setAllCodes] = useState<GlClassCode[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('gl_class_codes')
        .select('*')
        .eq('is_active', true)
        .order('class_code')
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
        .from('gl_class_codes')
        .select('*')
        .eq('is_active', true)
        .or(`class_code.ilike.%${query}%,description.ilike.%${query}%,industry_group.ilike.%${query}%`)
        .order('class_code')
        .limit(50)

      setSearchResults(data || [])
      setLoading(false)
    }, 300)
  }, [])

  return { searchResults, allCodes, search, loading }
}
