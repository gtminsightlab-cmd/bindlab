import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useProfile } from './useProfile'
import {
  CarrierWithAppointment,
  CarrierLobMatch,
  LineOfBusiness,
  UnifiedMatchInput,
  WcExposure,
  GlExposure,
  AutoExposure,
  BopExposure,
  PropertyExposure,
  UmbrellaExposure,
  CyberExposure,
  ProfessionalExposure
} from '../types/database'

interface LobResults {
  lob: LineOfBusiness
  matches: CarrierLobMatch[]
}

interface ProgramRecommendation {
  lobRecommendations: Record<string, { carrier: CarrierWithAppointment; score: number } | null>
  overallScore: number
  packageAlternative: { carrier: CarrierWithAppointment; avgScore: number; coversAll: boolean } | null
}

export function useUnifiedMatcher() {
  const [lobResults, setLobResults] = useState<LobResults[]>([])
  const [programRecommendation, setProgramRecommendation] = useState<ProgramRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useProfile()

  const fetchCarriersWithAppointments = async (): Promise<CarrierWithAppointment[]> => {
    const { data: carriers } = await supabase
      .from('carriers')
      .select('*')
      .eq('is_active', true)

    if (!carriers) return []

    if (profile?.org_id) {
      const { data: appointments } = await supabase
        .from('carrier_appointments')
        .select('*')
        .eq('org_id', profile.org_id)

      return carriers.map((carrier) => ({
        ...carrier,
        appointment: appointments?.find((a) => a.carrier_id === carrier.id) || null
      }))
    }

    return carriers.map((c) => ({ ...c, appointment: null }))
  }

  const scoreWcMatch = (carrier: CarrierWithAppointment, exposure: WcExposure, employeeCount: number | null): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Workers Comp')) return 0

    let score = 0
    const weights = { classCode: 40, employees: 25, payroll: 20, xmod: 15 }

    if (exposure.governingClassCode) {
      const hasCode = carrier.appetite_class_codes.includes(exposure.governingClassCode) ||
        carrier.appetite_class_codes.length === 0
      if (hasCode) score += weights.classCode
    }

    const empCount = employeeCount || 0
    if (empCount >= carrier.min_employees && empCount <= carrier.max_employees) {
      score += weights.employees
    }

    const payroll = exposure.payrollCents
    if (payroll >= carrier.min_payroll_cents && payroll <= carrier.max_payroll_cents) {
      score += weights.payroll
    }

    if (exposure.xmod <= carrier.max_xmod) {
      score += weights.xmod
    }

    return score
  }

  const scoreGlMatch = (carrier: CarrierWithAppointment, exposure: GlExposure, employeeCount: number | null): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('General Liability')) return 0

    let score = 0
    const weights = { classCode: 35, industry: 25, revenue: 20, subcontractor: 20 }

    if (exposure.primaryClassCode) {
      score += weights.classCode
    }

    score += weights.industry

    const empCount = employeeCount || 0
    if (empCount >= carrier.min_employees && empCount <= carrier.max_employees) {
      score += weights.revenue
    }

    if (exposure.subcontractorPercent < 50) {
      score += weights.subcontractor
    } else if (exposure.subcontractorPercent < 75) {
      score += weights.subcontractor * 0.5
    }

    return score
  }

  const scoreAutoMatch = (carrier: CarrierWithAppointment, exposure: AutoExposure): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Business Auto')) return 0

    let score = 0
    const weights = { vehicles: 25, radius: 25, commodity: 20, fleet: 15, telematics: 15 }

    if (exposure.vehicleCount > 0 && exposure.vehicleCount <= 100) {
      score += weights.vehicles
    } else if (exposure.vehicleCount <= 500) {
      score += weights.vehicles * 0.7
    }

    if (exposure.radiusLocal >= 50) {
      score += weights.radius
    } else if (exposure.radiusIntermediate >= 50) {
      score += weights.radius * 0.7
    } else {
      score += weights.radius * 0.4
    }

    if (exposure.commodities.length > 0 && !exposure.commodities.includes('Hazmat')) {
      score += weights.commodity
    } else if (exposure.commodities.includes('Hazmat')) {
      score += weights.commodity * 0.3
    }

    if (exposure.vehicleCount >= 5) {
      score += weights.fleet
    }

    if (exposure.hasTelematics) {
      score += weights.telematics
    }

    return score
  }

  const scoreBopMatch = (carrier: CarrierWithAppointment, exposure: BopExposure): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('BOP')) return 0

    let score = 0
    const weights = { occupancy: 40, revenue: 30, features: 30 }

    if (exposure.occupancyType) {
      score += weights.occupancy
    }

    if (exposure.revenueCents > 0 && exposure.revenueCents <= 500000000) {
      score += weights.revenue
    }

    if (!exposure.cookingOnPremises && !exposure.manufacturingOnPremises) {
      score += weights.features
    } else if (exposure.cookingOnPremises && !exposure.manufacturingOnPremises) {
      score += weights.features * 0.6
    }

    return score
  }

  const scorePropertyMatch = (carrier: CarrierWithAppointment, exposure: PropertyExposure): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Property')) return 0

    let score = 0
    const weights = { tiv: 25, construction: 25, age: 20, protection: 15, roof: 15 }

    const tiv = exposure.buildingValueCents + exposure.contentsValueCents
    if (tiv > 0) {
      score += weights.tiv
    }

    if (exposure.constructionType && ['Fire-Resistive', 'Non-Combustible', 'Masonry Non-Combustible'].includes(exposure.constructionType)) {
      score += weights.construction
    } else if (exposure.constructionType) {
      score += weights.construction * 0.6
    }

    const currentYear = new Date().getFullYear()
    const buildingAge = exposure.yearBuilt ? currentYear - exposure.yearBuilt : 50
    if (buildingAge <= 20) {
      score += weights.age
    } else if (buildingAge <= 40) {
      score += weights.age * 0.7
    } else {
      score += weights.age * 0.4
    }

    if (exposure.protectionClass && exposure.protectionClass <= 5) {
      score += weights.protection
    } else if (exposure.protectionClass && exposure.protectionClass <= 7) {
      score += weights.protection * 0.6
    }

    if (exposure.roofAge && exposure.roofAge <= 10) {
      score += weights.roof
    } else if (exposure.roofAge && exposure.roofAge <= 15) {
      score += weights.roof * 0.6
    }

    return score
  }

  const scoreUmbrellaMatch = (carrier: CarrierWithAppointment, exposure: UmbrellaExposure): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Umbrella')) return 0

    let score = 0
    const weights = { underlying: 50, accountSize: 30, segment: 20 }

    if (exposure.underlyingGlLimitCents >= 100000000 && exposure.underlyingAutoLimitCents >= 100000000) {
      score += weights.underlying
    } else if (exposure.underlyingGlLimitCents >= 100000000 || exposure.underlyingAutoLimitCents >= 100000000) {
      score += weights.underlying * 0.7
    }

    if (exposure.requestedLimitCents <= 500000000) {
      score += weights.accountSize
    } else if (exposure.requestedLimitCents <= 1000000000) {
      score += weights.accountSize * 0.7
    }

    score += weights.segment

    return score
  }

  const scoreCyberMatch = (carrier: CarrierWithAppointment, exposure: CyberExposure, revenueCents: number | null): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Cyber')) return 0

    let score = 0
    const weights = { revenue: 50, industry: 50 }

    const revenue = revenueCents || 0
    if (revenue > 0 && revenue <= 5000000000) {
      score += weights.revenue
    } else if (revenue <= 25000000000) {
      score += weights.revenue * 0.7
    }

    if (!exposure.hasPriorIncidents) {
      score += weights.industry
    } else {
      score += weights.industry * 0.3
    }

    return score
  }

  const scoreProfessionalMatch = (carrier: CarrierWithAppointment, exposure: ProfessionalExposure): number => {
    if (!exposure.enabled) return 0
    if (!carrier.lines_of_business.includes('Professional Liability')) return 0

    let score = 0
    const weights = { revenue: 50, industry: 50 }

    if (exposure.revenueCents > 0 && exposure.revenueCents <= 5000000000) {
      score += weights.revenue
    } else if (exposure.revenueCents <= 25000000000) {
      score += weights.revenue * 0.7
    }

    score += weights.industry

    return score
  }

  const findMatches = useCallback(async (input: UnifiedMatchInput) => {
    setLoading(true)
    setError(null)

    try {
      const carriers = await fetchCarriersWithAppointments()
      const results: LobResults[] = []
      const enabledLobs: LineOfBusiness[] = []

      if (input.wc_exposure.enabled) enabledLobs.push('Workers Comp')
      if (input.gl_exposure.enabled) enabledLobs.push('General Liability')
      if (input.auto_exposure.enabled) enabledLobs.push('Business Auto')
      if (input.bop_exposure.enabled) enabledLobs.push('BOP')
      if (input.property_exposure.enabled) enabledLobs.push('Property')
      if (input.umbrella_exposure.enabled) enabledLobs.push('Umbrella')
      if (input.cyber_exposure.enabled) enabledLobs.push('Cyber')
      if (input.professional_exposure.enabled) enabledLobs.push('Professional Liability')

      for (const lob of enabledLobs) {
        const matches: CarrierLobMatch[] = []

        for (const carrier of carriers) {
          if (!carrier.lines_of_business.includes(lob)) continue

          const stateMatch = carrier.appetite_states.includes('ALL') ||
            carrier.appetite_states.includes(input.state)
          if (!stateMatch) continue

          let score = 0
          let matchDetails = {
            classCodeMatch: false,
            sizeMatch: false,
            revenuePayrollMatch: false,
            additionalMatch: false
          }

          switch (lob) {
            case 'Workers Comp':
              score = scoreWcMatch(carrier, input.wc_exposure, input.employee_count)
              matchDetails.classCodeMatch = input.wc_exposure.governingClassCode
                ? carrier.appetite_class_codes.includes(input.wc_exposure.governingClassCode) || carrier.appetite_class_codes.length === 0
                : true
              matchDetails.sizeMatch = (input.employee_count || 0) >= carrier.min_employees && (input.employee_count || 0) <= carrier.max_employees
              matchDetails.revenuePayrollMatch = input.wc_exposure.payrollCents >= carrier.min_payroll_cents && input.wc_exposure.payrollCents <= carrier.max_payroll_cents
              matchDetails.additionalMatch = input.wc_exposure.xmod <= carrier.max_xmod
              break
            case 'General Liability':
              score = scoreGlMatch(carrier, input.gl_exposure, input.employee_count)
              matchDetails.classCodeMatch = !!input.gl_exposure.primaryClassCode
              matchDetails.sizeMatch = (input.employee_count || 0) >= carrier.min_employees && (input.employee_count || 0) <= carrier.max_employees
              matchDetails.revenuePayrollMatch = true
              matchDetails.additionalMatch = input.gl_exposure.subcontractorPercent < 75
              break
            case 'Business Auto':
              score = scoreAutoMatch(carrier, input.auto_exposure)
              matchDetails.classCodeMatch = true
              matchDetails.sizeMatch = input.auto_exposure.vehicleCount <= 500
              matchDetails.revenuePayrollMatch = true
              matchDetails.additionalMatch = !input.auto_exposure.commodities.includes('Hazmat')
              break
            case 'BOP':
              score = scoreBopMatch(carrier, input.bop_exposure)
              matchDetails.classCodeMatch = !!input.bop_exposure.occupancyType
              matchDetails.sizeMatch = true
              matchDetails.revenuePayrollMatch = input.bop_exposure.revenueCents <= 500000000
              matchDetails.additionalMatch = !input.bop_exposure.manufacturingOnPremises
              break
            case 'Property':
              score = scorePropertyMatch(carrier, input.property_exposure)
              matchDetails.classCodeMatch = !!input.property_exposure.constructionType
              matchDetails.sizeMatch = true
              matchDetails.revenuePayrollMatch = true
              matchDetails.additionalMatch = (input.property_exposure.protectionClass || 10) <= 7
              break
            case 'Umbrella':
              score = scoreUmbrellaMatch(carrier, input.umbrella_exposure)
              matchDetails.classCodeMatch = true
              matchDetails.sizeMatch = true
              matchDetails.revenuePayrollMatch = input.umbrella_exposure.requestedLimitCents <= 1000000000
              matchDetails.additionalMatch = input.umbrella_exposure.underlyingGlLimitCents >= 100000000
              break
            case 'Cyber':
              score = scoreCyberMatch(carrier, input.cyber_exposure, input.annual_revenue_cents)
              matchDetails.classCodeMatch = true
              matchDetails.sizeMatch = (input.annual_revenue_cents || 0) <= 25000000000
              matchDetails.revenuePayrollMatch = true
              matchDetails.additionalMatch = !input.cyber_exposure.hasPriorIncidents
              break
            case 'Professional Liability':
              score = scoreProfessionalMatch(carrier, input.professional_exposure)
              matchDetails.classCodeMatch = !!input.professional_exposure.type
              matchDetails.sizeMatch = true
              matchDetails.revenuePayrollMatch = input.professional_exposure.revenueCents <= 25000000000
              matchDetails.additionalMatch = true
              break
          }

          if (score > 0) {
            matches.push({ carrier, score, matchDetails })
          }
        }

        matches.sort((a, b) => b.score - a.score)
        results.push({ lob, matches: matches.slice(0, 10) })
      }

      setLobResults(results)

      const lobRecommendations: Record<string, { carrier: CarrierWithAppointment; score: number } | null> = {}
      let totalScore = 0
      let lobCount = 0

      for (const result of results) {
        if (result.matches.length > 0) {
          const best = result.matches[0]
          lobRecommendations[result.lob] = { carrier: best.carrier, score: best.score }
          totalScore += best.score
          lobCount++
        } else {
          lobRecommendations[result.lob] = null
        }
      }

      let packageAlternative: { carrier: CarrierWithAppointment; avgScore: number; coversAll: boolean } | null = null

      if (enabledLobs.length > 1) {
        const carrierScores = new Map<string, { carrier: CarrierWithAppointment; scores: number[]; lobs: string[] }>()

        for (const result of results) {
          for (const match of result.matches) {
            const existing = carrierScores.get(match.carrier.id)
            if (existing) {
              existing.scores.push(match.score)
              existing.lobs.push(result.lob)
            } else {
              carrierScores.set(match.carrier.id, {
                carrier: match.carrier,
                scores: [match.score],
                lobs: [result.lob]
              })
            }
          }
        }

        let bestPackage: { carrier: CarrierWithAppointment; avgScore: number; coversAll: boolean } | null = null
        let bestPackageScore = 0

        for (const [, data] of carrierScores) {
          if (data.lobs.length >= enabledLobs.length) {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
            if (avgScore > bestPackageScore) {
              bestPackageScore = avgScore
              bestPackage = {
                carrier: data.carrier,
                avgScore,
                coversAll: data.lobs.length === enabledLobs.length
              }
            }
          }
        }

        packageAlternative = bestPackage
      }

      setProgramRecommendation({
        lobRecommendations,
        overallScore: lobCount > 0 ? Math.round(totalScore / lobCount) : 0,
        packageAlternative
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }

    setLoading(false)
  }, [profile?.org_id])

  const clearResults = useCallback(() => {
    setLobResults([])
    setProgramRecommendation(null)
  }, [])

  return {
    lobResults,
    programRecommendation,
    loading,
    error,
    findMatches,
    clearResults
  }
}
