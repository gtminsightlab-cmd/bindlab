import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useProfile } from './useProfile'
import {
  ProspectExposure,
  ProspectExposureFormData,
  DEFAULT_WC_EXPOSURE,
  DEFAULT_GL_EXPOSURE,
  DEFAULT_AUTO_EXPOSURE,
  DEFAULT_BOP_EXPOSURE,
  DEFAULT_PROPERTY_EXPOSURE,
  DEFAULT_UMBRELLA_EXPOSURE,
  DEFAULT_CYBER_EXPOSURE,
  DEFAULT_PROFESSIONAL_EXPOSURE,
  DEFAULT_LOSS_HISTORY
} from '../types/database'

export function useProspectExposures() {
  const [exposures, setExposures] = useState<ProspectExposure[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useProfile()

  const fetchExposures = useCallback(async () => {
    if (!profile?.org_id) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('prospect_exposures')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setExposures(data || [])
    }
    setLoading(false)
  }, [profile?.org_id])

  const createExposure = async (data: ProspectExposureFormData): Promise<ProspectExposure | null> => {
    if (!profile?.org_id) {
      setError('No organization found')
      return null
    }

    const { data: newExposure, error: insertError } = await supabase
      .from('prospect_exposures')
      .insert({
        org_id: profile.org_id,
        ...data
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return null
    }

    setExposures((prev) => [newExposure, ...prev])
    return newExposure
  }

  const updateExposure = async (id: string, data: Partial<ProspectExposureFormData>): Promise<boolean> => {
    const { error: updateError } = await supabase
      .from('prospect_exposures')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return false
    }

    setExposures((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    )
    return true
  }

  const deleteExposure = async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('prospect_exposures')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    setExposures((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return {
    exposures,
    loading,
    error,
    fetchExposures,
    createExposure,
    updateExposure,
    deleteExposure
  }
}

export function useProspectExposure(id: string | undefined) {
  const [exposure, setExposure] = useState<ProspectExposure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExposure = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('prospect_exposures')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setExposure(data)
    }
    setLoading(false)
  }, [id])

  return { exposure, loading, error, refetch: fetchExposure }
}

export function getDefaultExposureFormData(): ProspectExposureFormData {
  return {
    prospect_name: '',
    state: '',
    naics_code: null,
    years_in_business: null,
    employee_count: null,
    annual_revenue_cents: null,
    market_segment: null,
    wc_exposure: { ...DEFAULT_WC_EXPOSURE },
    gl_exposure: { ...DEFAULT_GL_EXPOSURE },
    auto_exposure: { ...DEFAULT_AUTO_EXPOSURE },
    bop_exposure: { ...DEFAULT_BOP_EXPOSURE },
    property_exposure: { ...DEFAULT_PROPERTY_EXPOSURE },
    umbrella_exposure: { ...DEFAULT_UMBRELLA_EXPOSURE },
    cyber_exposure: { ...DEFAULT_CYBER_EXPOSURE },
    professional_exposure: { ...DEFAULT_PROFESSIONAL_EXPOSURE },
    business_description: null,
    risk_narrative: null,
    market_status: null,
    incumbent_carrier: null,
    expiring_premium_cents: null,
    reason_for_shopping: null,
    loss_history: { ...DEFAULT_LOSS_HISTORY }
  }
}
