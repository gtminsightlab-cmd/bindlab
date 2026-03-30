import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { GlExposure, GlClassCode } from '../../types/database'
import { useGlClassCodeSearch } from '../../hooks/useGlClassCodes'

interface GlExposureFormProps {
  exposure: GlExposure
  onChange: (exposure: GlExposure) => void
}

export default function GlExposureForm({ exposure, onChange }: GlExposureFormProps) {
  const { searchResults, allCodes, search } = useGlClassCodeSearch()

  const [primarySearch, setPrimarySearch] = useState('')
  const [additionalSearch, setAdditionalSearch] = useState('')
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false)
  const [showAdditionalDropdown, setShowAdditionalDropdown] = useState(false)
  const [selectedPrimary, setSelectedPrimary] = useState<GlClassCode | null>(null)
  const [selectedAdditional, setSelectedAdditional] = useState<GlClassCode[]>([])

  const primaryRef = useRef<HTMLDivElement>(null)
  const additionalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (primaryRef.current && !primaryRef.current.contains(e.target as Node)) {
        setShowPrimaryDropdown(false)
      }
      if (additionalRef.current && !additionalRef.current.contains(e.target as Node)) {
        setShowAdditionalDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (primarySearch) {
      search(primarySearch)
    }
  }, [primarySearch, search])

  useEffect(() => {
    if (additionalSearch) {
      search(additionalSearch)
    }
  }, [additionalSearch, search])

  const handleSelectPrimary = (code: GlClassCode) => {
    setSelectedPrimary(code)
    setPrimarySearch('')
    setShowPrimaryDropdown(false)
    onChange({
      ...exposure,
      primaryClassCode: code.class_code,
      primaryClassDescription: code.description
    })
  }

  const handleAddAdditional = (code: GlClassCode) => {
    if (!selectedAdditional.find((c) => c.class_code === code.class_code)) {
      const updated = [...selectedAdditional, code]
      setSelectedAdditional(updated)
      onChange({
        ...exposure,
        additionalClassCodes: updated.map((c) => c.class_code)
      })
    }
    setAdditionalSearch('')
    setShowAdditionalDropdown(false)
  }

  const handleRemoveAdditional = (code: GlClassCode) => {
    const updated = selectedAdditional.filter((c) => c.class_code !== code.class_code)
    setSelectedAdditional(updated)
    onChange({
      ...exposure,
      additionalClassCodes: updated.map((c) => c.class_code)
    })
  }

  const handleRemovePrimary = () => {
    setSelectedPrimary(null)
    onChange({
      ...exposure,
      primaryClassCode: null,
      primaryClassDescription: undefined
    })
  }

  const formatDollars = (cents: number) => {
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

  const primaryOptions = primarySearch
    ? searchResults.filter((c) => !selectedAdditional.find((ac) => ac.class_code === c.class_code))
    : allCodes.slice(0, 50)

  const additionalOptions = additionalSearch
    ? searchResults.filter(
        (c) =>
          c.class_code !== selectedPrimary?.class_code &&
          !selectedAdditional.find((ac) => ac.class_code === c.class_code)
      )
    : allCodes
        .filter(
          (c) =>
            c.class_code !== selectedPrimary?.class_code &&
            !selectedAdditional.find((ac) => ac.class_code === c.class_code)
        )
        .slice(0, 50)

  return (
    <div className="space-y-4">
      <div ref={primaryRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          GL Class Code <span className="text-red-500">*</span>
        </label>
        {selectedPrimary ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
            <span className="font-mono text-sm font-medium text-teal-700">{selectedPrimary.class_code}</span>
            <span className="text-sm text-gray-600 truncate flex-1">{selectedPrimary.description}</span>
            <button
              type="button"
              onClick={handleRemovePrimary}
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
              value={primarySearch}
              onChange={(e) => setPrimarySearch(e.target.value)}
              onFocus={() => setShowPrimaryDropdown(true)}
              placeholder="Search by code, description, or industry..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {showPrimaryDropdown && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {primaryOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No codes found</div>
                ) : (
                  primaryOptions.map((code) => (
                    <button
                      key={code.id}
                      type="button"
                      onClick={() => handleSelectPrimary(code)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-teal-600">{code.class_code}</span>
                        <span className="text-sm text-gray-700 truncate">{code.description}</span>
                      </div>
                      {code.industry_group && (
                        <div className="text-xs text-gray-500 mt-0.5">{code.industry_group}</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={additionalRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional GL Codes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={additionalSearch}
            onChange={(e) => setAdditionalSearch(e.target.value)}
            onFocus={() => setShowAdditionalDropdown(true)}
            placeholder="Add more codes..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {showAdditionalDropdown && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {additionalOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No codes found</div>
              ) : (
                additionalOptions.map((code) => (
                  <button
                    key={code.id}
                    type="button"
                    onClick={() => handleAddAdditional(code)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="font-mono text-sm text-teal-600">{code.class_code}</span>
                    <span className="text-sm text-gray-700 truncate">{code.description}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        {selectedAdditional.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedAdditional.map((code) => (
              <span
                key={code.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
              >
                <span className="font-mono">{code.class_code}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditional(code)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipts/Revenue</label>
          <input
            type="text"
            value={exposure.revenueCents > 0 ? formatDollars(exposure.revenueCents) : ''}
            onChange={(e) => onChange({ ...exposure, revenueCents: parseDollars(e.target.value) })}
            placeholder="$0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractor %</label>
          <input
            type="number"
            value={exposure.subcontractorPercent}
            onChange={(e) => onChange({ ...exposure, subcontractorPercent: parseInt(e.target.value) || 0 })}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  )
}
