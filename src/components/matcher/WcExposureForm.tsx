import { useState, useEffect, useRef } from 'react'
import { Search, X, Info } from 'lucide-react'
import { WcExposure, WcClassCode } from '../../types/database'
import { useClassCodeSearch, useWcStateBureaus } from '../../hooks/useWcClassCodes'

interface WcExposureFormProps {
  exposure: WcExposure
  onChange: (exposure: WcExposure) => void
  selectedState: string
}

export default function WcExposureForm({ exposure, onChange, selectedState }: WcExposureFormProps) {
  const { getBureauForState } = useWcStateBureaus()
  const { searchResults, allCodes, search } = useClassCodeSearch(selectedState)

  const [governingSearch, setGoverningSearch] = useState('')
  const [additionalSearch, setAdditionalSearch] = useState('')
  const [showGoverningDropdown, setShowGoverningDropdown] = useState(false)
  const [showAdditionalDropdown, setShowAdditionalDropdown] = useState(false)
  const [selectedGoverning, setSelectedGoverning] = useState<WcClassCode | null>(null)
  const [selectedAdditional, setSelectedAdditional] = useState<WcClassCode[]>([])

  const governingRef = useRef<HTMLDivElement>(null)
  const additionalRef = useRef<HTMLDivElement>(null)

  const bureau = selectedState ? getBureauForState(selectedState) : null

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (governingRef.current && !governingRef.current.contains(e.target as Node)) {
        setShowGoverningDropdown(false)
      }
      if (additionalRef.current && !additionalRef.current.contains(e.target as Node)) {
        setShowAdditionalDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (governingSearch) {
      search(governingSearch)
    }
  }, [governingSearch, search])

  useEffect(() => {
    if (additionalSearch) {
      search(additionalSearch)
    }
  }, [additionalSearch, search])

  useEffect(() => {
    setSelectedGoverning(null)
    setSelectedAdditional([])
    setGoverningSearch('')
    setAdditionalSearch('')
    onChange({
      ...exposure,
      governingClassCode: null,
      governingClassDescription: undefined,
      additionalClassCodes: []
    })
  }, [selectedState])

  const handleSelectGoverning = (code: WcClassCode) => {
    setSelectedGoverning(code)
    setGoverningSearch('')
    setShowGoverningDropdown(false)
    onChange({
      ...exposure,
      governingClassCode: code.class_code,
      governingClassDescription: code.description
    })
  }

  const handleAddAdditional = (code: WcClassCode) => {
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

  const handleRemoveAdditional = (code: WcClassCode) => {
    const updated = selectedAdditional.filter((c) => c.class_code !== code.class_code)
    setSelectedAdditional(updated)
    onChange({
      ...exposure,
      additionalClassCodes: updated.map((c) => c.class_code)
    })
  }

  const handleRemoveGoverning = () => {
    setSelectedGoverning(null)
    onChange({
      ...exposure,
      governingClassCode: null,
      governingClassDescription: undefined
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

  const governingOptions = governingSearch
    ? searchResults.filter((c) => !selectedAdditional.find((ac) => ac.class_code === c.class_code))
    : allCodes.slice(0, 50)

  const additionalOptions = additionalSearch
    ? searchResults.filter(
        (c) =>
          c.class_code !== selectedGoverning?.class_code &&
          !selectedAdditional.find((ac) => ac.class_code === c.class_code)
      )
    : allCodes
        .filter(
          (c) =>
            c.class_code !== selectedGoverning?.class_code &&
            !selectedAdditional.find((ac) => ac.class_code === c.class_code)
        )
        .slice(0, 50)

  return (
    <div className="space-y-4">
      {bureau && (
        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
          <Info className="w-4 h-4" />
          <span>{bureau.uses_ncci ? 'NCCI State' : `${bureau.bureau_abbreviation} - ${bureau.bureau_name}`}</span>
        </div>
      )}

      <div ref={governingRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Governing Class Code <span className="text-red-500">*</span>
        </label>
        {selectedGoverning ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
            <span className="font-mono text-sm font-medium text-teal-700">{selectedGoverning.class_code}</span>
            <span className="text-sm text-gray-600 truncate flex-1">{selectedGoverning.description}</span>
            <button
              type="button"
              onClick={handleRemoveGoverning}
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
              value={governingSearch}
              onChange={(e) => setGoverningSearch(e.target.value)}
              onFocus={() => setShowGoverningDropdown(true)}
              placeholder={selectedState ? 'Search by code or description...' : 'Select state first'}
              disabled={!selectedState}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
            {showGoverningDropdown && selectedState && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {governingOptions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No codes found</div>
                ) : (
                  governingOptions.map((code) => (
                    <button
                      key={code.id}
                      type="button"
                      onClick={() => handleSelectGoverning(code)}
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
        )}
      </div>

      <div ref={additionalRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Class Codes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={additionalSearch}
            onChange={(e) => setAdditionalSearch(e.target.value)}
            onFocus={() => setShowAdditionalDropdown(true)}
            placeholder={selectedState ? 'Add more codes...' : 'Select state first'}
            disabled={!selectedState}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
          />
          {showAdditionalDropdown && selectedState && (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Payroll</label>
          <input
            type="text"
            value={exposure.payrollCents > 0 ? formatDollars(exposure.payrollCents) : ''}
            onChange={(e) => onChange({ ...exposure, payrollCents: parseDollars(e.target.value) })}
            placeholder="$0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Modifier (X-Mod)</label>
          <input
            type="number"
            value={exposure.xmod}
            onChange={(e) => onChange({ ...exposure, xmod: parseFloat(e.target.value) || 1.0 })}
            step="0.01"
            min="0"
            max="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  )
}
