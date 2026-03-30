import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, ChevronUp, X, Info } from 'lucide-react'
import { useUnifiedMatcher } from '../../hooks/useUnifiedMatcher'
import { useNaicsCodeSearch } from '../../hooks/useNaicsCodes'
import { useWcStateBureaus } from '../../hooks/useWcClassCodes'
import { US_STATES } from '../../constants/states'
import {
  UnifiedMatchInput,
  MarketSegment,
  MarketStatus,
  NaicsCode,
  DEFAULT_WC_EXPOSURE,
  DEFAULT_GL_EXPOSURE,
  DEFAULT_AUTO_EXPOSURE,
  DEFAULT_BOP_EXPOSURE,
  DEFAULT_PROPERTY_EXPOSURE,
  DEFAULT_UMBRELLA_EXPOSURE,
  DEFAULT_CYBER_EXPOSURE,
  DEFAULT_PROFESSIONAL_EXPOSURE,
  DEFAULT_LOSS_HISTORY
} from '../../types/database'
import WcExposureForm from '../../components/matcher/WcExposureForm'
import GlExposureForm from '../../components/matcher/GlExposureForm'
import AutoExposureForm from '../../components/matcher/AutoExposureForm'
import PropertyExposureForm from '../../components/matcher/PropertyExposureForm'
import {
  BopExposureForm,
  UmbrellaExposureForm,
  CyberExposureForm,
  ProfessionalExposureForm
} from '../../components/matcher/SimpleExposureForms'
import MatchResults from '../../components/matcher/MatchResults'
import Spinner from '../../components/ui/Spinner'

const MARKET_SEGMENTS: MarketSegment[] = ['Micro', 'Small', 'Middle', 'Large']
const MARKET_STATUSES: MarketStatus[] = ['New Business', 'Remarketing', 'Non-Renewed', 'Declined']

const LOB_OPTIONS = [
  { id: 'wc', label: 'Workers Comp', key: 'wc_exposure' },
  { id: 'gl', label: 'General Liability', key: 'gl_exposure' },
  { id: 'auto', label: 'Business Auto', key: 'auto_exposure' },
  { id: 'bop', label: 'BOP', key: 'bop_exposure' },
  { id: 'property', label: 'Property', key: 'property_exposure' },
  { id: 'umbrella', label: 'Umbrella', key: 'umbrella_exposure' },
  { id: 'cyber', label: 'Cyber', key: 'cyber_exposure' },
  { id: 'professional', label: 'Professional Liability', key: 'professional_exposure' }
] as const

export default function UnifiedMatcherPage() {
  const { lobResults, programRecommendation, loading, findMatches, clearResults } = useUnifiedMatcher()
  const { getBureauForState } = useWcStateBureaus()
  const { searchResults: naicsResults, search: searchNaics, allCodes: allNaics } = useNaicsCodeSearch()

  const [formData, setFormData] = useState<UnifiedMatchInput>({
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
    professional_exposure: { ...DEFAULT_PROFESSIONAL_EXPOSURE }
  })

  const [additionalContext, setAdditionalContext] = useState({
    business_description: '',
    risk_narrative: '',
    market_status: '' as MarketStatus | '',
    incumbent_carrier: '',
    expiring_premium_cents: 0,
    reason_for_shopping: '',
    loss_history: { ...DEFAULT_LOSS_HISTORY }
  })

  const [expandedLobs, setExpandedLobs] = useState<string[]>([])
  const [showAdditionalContext, setShowAdditionalContext] = useState(false)
  const [naicsSearch, setNaicsSearch] = useState('')
  const [showNaicsDropdown, setShowNaicsDropdown] = useState(false)
  const [selectedNaics, setSelectedNaics] = useState<NaicsCode | null>(null)

  const naicsRef = useRef<HTMLDivElement>(null)
  const bureau = formData.state ? getBureauForState(formData.state) : null

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (naicsRef.current && !naicsRef.current.contains(e.target as Node)) {
        setShowNaicsDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (naicsSearch) {
      searchNaics(naicsSearch)
    }
  }, [naicsSearch, searchNaics])

  const handleLobToggle = (lobKey: string) => {
    const key = `${lobKey}_exposure` as keyof UnifiedMatchInput
    const current = formData[key] as { enabled: boolean }
    const currentValue = formData[key] as unknown as Record<string, unknown>
    setFormData({
      ...formData,
      [key]: { ...currentValue, enabled: !current.enabled }
    })

    if (!current.enabled) {
      setExpandedLobs((prev) => [...prev, lobKey])
    }
  }

  const handleLobExpand = (lobKey: string) => {
    setExpandedLobs((prev) =>
      prev.includes(lobKey) ? prev.filter((l) => l !== lobKey) : [...prev, lobKey]
    )
  }

  const handleNaicsSelect = (code: NaicsCode) => {
    setSelectedNaics(code)
    setFormData({ ...formData, naics_code: code.code })
    setNaicsSearch('')
    setShowNaicsDropdown(false)
  }

  const formatDollars = (cents: number) => {
    if (!cents) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(cents / 100)
  }

  const parseDollars = (value: string): number => {
    const num = parseInt(value.replace(/[^0-9]/g, '')) || 0
    return num * 100
  }

  const handleSearch = () => {
    const enabledLobs = LOB_OPTIONS.filter((lob) => {
      const key = `${lob.id}_exposure` as keyof UnifiedMatchInput
      return (formData[key] as { enabled: boolean }).enabled
    })

    if (!formData.state || enabledLobs.length === 0) {
      return
    }

    findMatches(formData)
  }

  const handleReset = () => {
    setFormData({
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
      professional_exposure: { ...DEFAULT_PROFESSIONAL_EXPOSURE }
    })
    setSelectedNaics(null)
    setExpandedLobs([])
    clearResults()
  }

  const enabledLobsCount = LOB_OPTIONS.filter((lob) => {
    const key = `${lob.id}_exposure` as keyof UnifiedMatchInput
    return (formData[key] as { enabled: boolean }).enabled
  }).length

  const canSearch = formData.state && enabledLobsCount > 0

  const naicsOptions = naicsSearch ? naicsResults : allNaics.slice(0, 50)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carrier Matcher</h1>
        <p className="text-gray-600 mt-1">Find the best carriers for your prospect across all lines of business</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Prospect Details</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.prospect_name}
                onChange={(e) => setFormData({ ...formData, prospect_name: e.target.value })}
                placeholder="Enter business name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select state...</option>
                {US_STATES.map((state) => (
                  <option key={state.abbreviation} value={state.abbreviation}>
                    {state.name}
                  </option>
                ))}
              </select>
              {bureau && (
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-600">
                    {bureau.uses_ncci ? 'NCCI State' : bureau.bureau_abbreviation}
                  </span>
                </div>
              )}
            </div>

            <div ref={naicsRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">NAICS Code</label>
              {selectedNaics ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="font-mono text-sm">{selectedNaics.code}</span>
                  <span className="text-sm text-gray-600 truncate flex-1">{selectedNaics.title}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNaics(null)
                      setFormData({ ...formData, naics_code: null })
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={naicsSearch}
                    onChange={(e) => setNaicsSearch(e.target.value)}
                    onFocus={() => setShowNaicsDropdown(true)}
                    placeholder="Search NAICS code..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {showNaicsDropdown && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {naicsOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No codes found</div>
                      ) : (
                        naicsOptions.map((code) => (
                          <button
                            key={code.id}
                            type="button"
                            onClick={() => handleNaicsSelect(code)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-teal-600">{code.code}</span>
                              <span className="text-sm text-gray-700 truncate">{code.title}</span>
                            </div>
                            {code.sector && (
                              <div className="text-xs text-gray-500 mt-0.5">{code.sector}</div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years in Business</label>
              <input
                type="number"
                value={formData.years_in_business || ''}
                onChange={(e) => setFormData({ ...formData, years_in_business: parseInt(e.target.value) || null })}
                placeholder="e.g., 10"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
              <input
                type="number"
                value={formData.employee_count || ''}
                onChange={(e) => setFormData({ ...formData, employee_count: parseInt(e.target.value) || null })}
                placeholder="e.g., 25"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
              <input
                type="text"
                value={formData.annual_revenue_cents ? formatDollars(formData.annual_revenue_cents) : ''}
                onChange={(e) => setFormData({ ...formData, annual_revenue_cents: parseDollars(e.target.value) })}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Market Segment</label>
              <select
                value={formData.market_segment || ''}
                onChange={(e) => setFormData({ ...formData, market_segment: (e.target.value || null) as MarketSegment | null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select segment...</option>
                {MARKET_SEGMENTS.map((seg) => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Lines of Business Needed <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              {LOB_OPTIONS.map((lob) => {
                const key = `${lob.id}_exposure` as keyof UnifiedMatchInput
                const exposure = formData[key] as { enabled: boolean }
                const isExpanded = expandedLobs.includes(lob.id)

                return (
                  <div key={lob.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        exposure.enabled ? 'bg-teal-50' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={exposure.enabled}
                          onChange={() => handleLobToggle(lob.id)}
                          className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className={`font-medium ${exposure.enabled ? 'text-teal-700' : 'text-gray-700'}`}>
                          {lob.label}
                        </span>
                      </label>
                      {exposure.enabled && (
                        <button
                          type="button"
                          onClick={() => handleLobExpand(lob.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                    {exposure.enabled && isExpanded && (
                      <div className="px-4 py-4 border-t border-gray-200 bg-white">
                        {lob.id === 'wc' && (
                          <WcExposureForm
                            exposure={formData.wc_exposure}
                            onChange={(wc_exposure) => setFormData({ ...formData, wc_exposure })}
                            selectedState={formData.state}
                          />
                        )}
                        {lob.id === 'gl' && (
                          <GlExposureForm
                            exposure={formData.gl_exposure}
                            onChange={(gl_exposure) => setFormData({ ...formData, gl_exposure })}
                          />
                        )}
                        {lob.id === 'auto' && (
                          <AutoExposureForm
                            exposure={formData.auto_exposure}
                            onChange={(auto_exposure) => setFormData({ ...formData, auto_exposure })}
                          />
                        )}
                        {lob.id === 'bop' && (
                          <BopExposureForm
                            exposure={formData.bop_exposure}
                            onChange={(bop_exposure) => setFormData({ ...formData, bop_exposure })}
                          />
                        )}
                        {lob.id === 'property' && (
                          <PropertyExposureForm
                            exposure={formData.property_exposure}
                            onChange={(property_exposure) => setFormData({ ...formData, property_exposure })}
                          />
                        )}
                        {lob.id === 'umbrella' && (
                          <UmbrellaExposureForm
                            exposure={formData.umbrella_exposure}
                            onChange={(umbrella_exposure) => setFormData({ ...formData, umbrella_exposure })}
                          />
                        )}
                        {lob.id === 'cyber' && (
                          <CyberExposureForm
                            exposure={formData.cyber_exposure}
                            onChange={(cyber_exposure) => setFormData({ ...formData, cyber_exposure })}
                          />
                        )}
                        {lob.id === 'professional' && (
                          <ProfessionalExposureForm
                            exposure={formData.professional_exposure}
                            onChange={(professional_exposure) => setFormData({ ...formData, professional_exposure })}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <button
              type="button"
              onClick={() => setShowAdditionalContext(!showAdditionalContext)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdditionalContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Additional Context (Optional)
            </button>

            {showAdditionalContext && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                  <textarea
                    value={additionalContext.business_description}
                    onChange={(e) => setAdditionalContext({ ...additionalContext, business_description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of operations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Market Status</label>
                    <select
                      value={additionalContext.market_status}
                      onChange={(e) => setAdditionalContext({ ...additionalContext, market_status: e.target.value as MarketStatus | '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select status...</option>
                      {MARKET_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incumbent Carrier</label>
                    <input
                      type="text"
                      value={additionalContext.incumbent_carrier}
                      onChange={(e) => setAdditionalContext({ ...additionalContext, incumbent_carrier: e.target.value })}
                      placeholder="Current carrier name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiring Premium</label>
                    <input
                      type="text"
                      value={additionalContext.expiring_premium_cents ? formatDollars(additionalContext.expiring_premium_cents) : ''}
                      onChange={(e) => setAdditionalContext({ ...additionalContext, expiring_premium_cents: parseDollars(e.target.value) })}
                      placeholder="$0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Shopping</label>
                  <input
                    type="text"
                    value={additionalContext.reason_for_shopping}
                    onChange={(e) => setAdditionalContext({ ...additionalContext, reason_for_shopping: e.target.value })}
                    placeholder="Why is the client shopping?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Loss History (3-Year)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Number of Losses</label>
                      <input
                        type="number"
                        value={additionalContext.loss_history.lossCount3yr || ''}
                        onChange={(e) => setAdditionalContext({
                          ...additionalContext,
                          loss_history: { ...additionalContext.loss_history, lossCount3yr: parseInt(e.target.value) || 0 }
                        })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Total Incurred</label>
                      <input
                        type="text"
                        value={additionalContext.loss_history.lossTotal3yrCents ? formatDollars(additionalContext.loss_history.lossTotal3yrCents) : ''}
                        onChange={(e) => setAdditionalContext({
                          ...additionalContext,
                          loss_history: { ...additionalContext.loss_history, lossTotal3yrCents: parseDollars(e.target.value) }
                        })}
                        placeholder="$0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Largest Loss</label>
                      <input
                        type="text"
                        value={additionalContext.loss_history.largestLossCents ? formatDollars(additionalContext.loss_history.largestLossCents) : ''}
                        onChange={(e) => setAdditionalContext({
                          ...additionalContext,
                          loss_history: { ...additionalContext.loss_history, largestLossCents: parseDollars(e.target.value) }
                        })}
                        placeholder="$0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {enabledLobsCount > 0 && (
              <span>{enabledLobsCount} line{enabledLobsCount !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={!canSearch || loading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
              Find Matching Carriers
            </button>
          </div>
        </div>
      </div>

      <MatchResults lobResults={lobResults} programRecommendation={programRecommendation} />
    </div>
  )
}
