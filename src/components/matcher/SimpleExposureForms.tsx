import {
  BopExposure,
  UmbrellaExposure,
  CyberExposure,
  ProfessionalExposure,
  OccupancyType,
  ProfessionalLiabilityType
} from '../../types/database'

const OCCUPANCY_TYPES: OccupancyType[] = ['Office', 'Retail', 'Restaurant', 'Service', 'Warehouse', 'Other']
const PROF_LIABILITY_TYPES: ProfessionalLiabilityType[] = ['E&O', 'D&O', 'EPLI']

interface BopExposureFormProps {
  exposure: BopExposure
  onChange: (exposure: BopExposure) => void
}

export function BopExposureForm({ exposure, onChange }: BopExposureFormProps) {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
          <input
            type="number"
            value={exposure.squareFootage || ''}
            onChange={(e) => onChange({ ...exposure, squareFootage: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 2500"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Type</label>
          <select
            value={exposure.occupancyType || ''}
            onChange={(e) => onChange({ ...exposure, occupancyType: (e.target.value || null) as OccupancyType | null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select type...</option>
            {OCCUPANCY_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
        <input
          type="text"
          value={exposure.revenueCents > 0 ? formatDollars(exposure.revenueCents) : ''}
          onChange={(e) => onChange({ ...exposure, revenueCents: parseDollars(e.target.value) })}
          placeholder="$0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exposure.cookingOnPremises}
            onChange={(e) => onChange({ ...exposure, cookingOnPremises: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Cooking on Premises</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exposure.manufacturingOnPremises}
            onChange={(e) => onChange({ ...exposure, manufacturingOnPremises: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Manufacturing on Premises</span>
        </label>
      </div>
    </div>
  )
}

interface UmbrellaExposureFormProps {
  exposure: UmbrellaExposure
  onChange: (exposure: UmbrellaExposure) => void
}

export function UmbrellaExposureForm({ exposure, onChange }: UmbrellaExposureFormProps) {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Underlying GL Limit</label>
          <input
            type="text"
            value={exposure.underlyingGlLimitCents > 0 ? formatDollars(exposure.underlyingGlLimitCents) : ''}
            onChange={(e) => onChange({ ...exposure, underlyingGlLimitCents: parseDollars(e.target.value) })}
            placeholder="$1,000,000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Underlying Auto Limit</label>
          <input
            type="text"
            value={exposure.underlyingAutoLimitCents > 0 ? formatDollars(exposure.underlyingAutoLimitCents) : ''}
            onChange={(e) => onChange({ ...exposure, underlyingAutoLimitCents: parseDollars(e.target.value) })}
            placeholder="$1,000,000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Requested Umbrella Limit</label>
        <input
          type="text"
          value={exposure.requestedLimitCents > 0 ? formatDollars(exposure.requestedLimitCents) : ''}
          onChange={(e) => onChange({ ...exposure, requestedLimitCents: parseDollars(e.target.value) })}
          placeholder="$5,000,000"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  )
}

interface CyberExposureFormProps {
  exposure: CyberExposure
  onChange: (exposure: CyberExposure) => void
}

export function CyberExposureForm({ exposure, onChange }: CyberExposureFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Records/Customers</label>
        <input
          type="number"
          value={exposure.recordCount || ''}
          onChange={(e) => onChange({ ...exposure, recordCount: parseInt(e.target.value) || 0 })}
          placeholder="e.g., 10000"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exposure.hasPriorCoverage}
            onChange={(e) => onChange({ ...exposure, hasPriorCoverage: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Has Prior Coverage</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exposure.hasPriorIncidents}
            onChange={(e) => onChange({ ...exposure, hasPriorIncidents: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Prior Incidents</span>
        </label>
      </div>
    </div>
  )
}

interface ProfessionalExposureFormProps {
  exposure: ProfessionalExposure
  onChange: (exposure: ProfessionalExposure) => void
}

export function ProfessionalExposureForm({ exposure, onChange }: ProfessionalExposureFormProps) {
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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          value={exposure.type || ''}
          onChange={(e) => onChange({ ...exposure, type: (e.target.value || null) as ProfessionalLiabilityType | null })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select type...</option>
          {PROF_LIABILITY_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
        <input
          type="text"
          value={exposure.revenueCents > 0 ? formatDollars(exposure.revenueCents) : ''}
          onChange={(e) => onChange({ ...exposure, revenueCents: parseDollars(e.target.value) })}
          placeholder="$0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  )
}
