import { PropertyExposure, ConstructionType, RoofType } from '../../types/database'

interface PropertyExposureFormProps {
  exposure: PropertyExposure
  onChange: (exposure: PropertyExposure) => void
}

const CONSTRUCTION_TYPES: ConstructionType[] = [
  'Frame',
  'Joisted Masonry',
  'Non-Combustible',
  'Fire-Resistive',
  'Masonry Non-Combustible'
]

const ROOF_TYPES: RoofType[] = [
  'Asphalt Shingle',
  'TPO',
  'EPDM',
  'Metal',
  'Built-Up',
  'Tile',
  'Other'
]

const PROTECTION_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export default function PropertyExposureForm({ exposure, onChange }: PropertyExposureFormProps) {
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Building Value</label>
          <input
            type="text"
            value={exposure.buildingValueCents > 0 ? formatDollars(exposure.buildingValueCents) : ''}
            onChange={(e) => onChange({ ...exposure, buildingValueCents: parseDollars(e.target.value) })}
            placeholder="$0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contents Value</label>
          <input
            type="text"
            value={exposure.contentsValueCents > 0 ? formatDollars(exposure.contentsValueCents) : ''}
            onChange={(e) => onChange({ ...exposure, contentsValueCents: parseDollars(e.target.value) })}
            placeholder="$0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Construction Type</label>
          <select
            value={exposure.constructionType || ''}
            onChange={(e) => onChange({ ...exposure, constructionType: (e.target.value || null) as ConstructionType | null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select type...</option>
            {CONSTRUCTION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
          <input
            type="number"
            value={exposure.yearBuilt || ''}
            onChange={(e) => onChange({ ...exposure, yearBuilt: parseInt(e.target.value) || null })}
            placeholder="e.g., 1995"
            min="1800"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roof Age (years)</label>
          <input
            type="number"
            value={exposure.roofAge || ''}
            onChange={(e) => onChange({ ...exposure, roofAge: parseInt(e.target.value) || null })}
            placeholder="e.g., 10"
            min="0"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roof Type</label>
          <select
            value={exposure.roofType || ''}
            onChange={(e) => onChange({ ...exposure, roofType: (e.target.value || null) as RoofType | null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select type...</option>
            {ROOF_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Protection Class</label>
          <select
            value={exposure.protectionClass || ''}
            onChange={(e) => onChange({ ...exposure, protectionClass: parseInt(e.target.value) || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select class...</option>
            {PROTECTION_CLASSES.map((cls) => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Stories</label>
          <input
            type="number"
            value={exposure.stories}
            onChange={(e) => onChange({ ...exposure, stories: parseInt(e.target.value) || 1 })}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units (for habitational)</label>
          <input
            type="number"
            value={exposure.numberOfUnits || ''}
            onChange={(e) => onChange({ ...exposure, numberOfUnits: parseInt(e.target.value) || null })}
            placeholder="Leave blank if N/A"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy %</label>
          <input
            type="number"
            value={exposure.occupancyPercent}
            onChange={(e) => onChange({ ...exposure, occupancyPercent: parseInt(e.target.value) || 0 })}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  )
}
