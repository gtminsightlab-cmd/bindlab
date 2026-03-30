import { Plus, Trash2 } from 'lucide-react'
import { AutoExposure, VehicleType, Commodity } from '../../types/database'

interface AutoExposureFormProps {
  exposure: AutoExposure
  onChange: (exposure: AutoExposure) => void
}

const VEHICLE_TYPES: VehicleType[] = ['Tractor', 'Straight Truck', 'Van', 'Sedan', 'Other']
const COMMODITIES: Commodity[] = ['Dry Goods', 'Refrigerated', 'Flatbed', 'Hazmat', 'General Freight', 'Other']

export default function AutoExposureForm({ exposure, onChange }: AutoExposureFormProps) {
  const handleAddVehicle = () => {
    onChange({
      ...exposure,
      vehicleBreakdown: [...exposure.vehicleBreakdown, { type: 'Sedan', count: 1 }]
    })
  }

  const handleRemoveVehicle = (index: number) => {
    const updated = exposure.vehicleBreakdown.filter((_, i) => i !== index)
    onChange({
      ...exposure,
      vehicleBreakdown: updated,
      vehicleCount: updated.reduce((sum, v) => sum + v.count, 0)
    })
  }

  const handleUpdateVehicle = (index: number, field: 'type' | 'count', value: string | number) => {
    const updated = exposure.vehicleBreakdown.map((v, i) => {
      if (i === index) {
        return { ...v, [field]: field === 'count' ? Number(value) : value }
      }
      return v
    })
    onChange({
      ...exposure,
      vehicleBreakdown: updated,
      vehicleCount: updated.reduce((sum, v) => sum + v.count, 0)
    })
  }

  const handleCommodityToggle = (commodity: Commodity) => {
    const updated = exposure.commodities.includes(commodity)
      ? exposure.commodities.filter((c) => c !== commodity)
      : [...exposure.commodities, commodity]
    onChange({ ...exposure, commodities: updated })
  }

  const handleRadiusChange = (field: 'radiusLocal' | 'radiusIntermediate' | 'radiusLongHaul', value: number) => {
    const newValue = Math.max(0, Math.min(100, value))
    const otherFields = {
      radiusLocal: ['radiusIntermediate', 'radiusLongHaul'],
      radiusIntermediate: ['radiusLocal', 'radiusLongHaul'],
      radiusLongHaul: ['radiusLocal', 'radiusIntermediate']
    }

    const currentOthersSum = otherFields[field].reduce(
      (sum, f) => sum + (exposure[f as keyof AutoExposure] as number),
      0
    )

    if (newValue + currentOthersSum <= 100) {
      onChange({ ...exposure, [field]: newValue })
    } else {
      const remaining = 100 - newValue
      const scale = currentOthersSum > 0 ? remaining / currentOthersSum : 0
      const updates: Partial<AutoExposure> = { [field]: newValue }
      otherFields[field].forEach((f) => {
        updates[f as keyof AutoExposure] = Math.round((exposure[f as keyof AutoExposure] as number) * scale) as never
      })
      onChange({ ...exposure, ...updates })
    }
  }

  const radiusTotal = exposure.radiusLocal + exposure.radiusIntermediate + exposure.radiusLongHaul

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Vehicle Breakdown</label>
          <button
            type="button"
            onClick={handleAddVehicle}
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
        {exposure.vehicleBreakdown.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No vehicles added</p>
        ) : (
          <div className="space-y-2">
            {exposure.vehicleBreakdown.map((vehicle, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={vehicle.type}
                  onChange={(e) => handleUpdateVehicle(index, 'type', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={vehicle.count}
                  onChange={(e) => handleUpdateVehicle(index, 'count', e.target.value)}
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVehicle(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="text-sm text-gray-600 mt-1">
              Total Vehicles: <span className="font-medium">{exposure.vehicleCount}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Radius Distribution (must total 100%)
          <span className={`ml-2 ${radiusTotal === 100 ? 'text-green-600' : 'text-red-500'}`}>
            Current: {radiusTotal}%
          </span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Local (0-50mi)</label>
            <input
              type="number"
              value={exposure.radiusLocal}
              onChange={(e) => handleRadiusChange('radiusLocal', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Intermediate (50-200mi)</label>
            <input
              type="number"
              value={exposure.radiusIntermediate}
              onChange={(e) => handleRadiusChange('radiusIntermediate', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Long Haul (200+mi)</label>
            <input
              type="number"
              value={exposure.radiusLongHaul}
              onChange={(e) => handleRadiusChange('radiusLongHaul', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver Count</label>
          <input
            type="number"
            value={exposure.driverCount || ''}
            onChange={(e) => onChange({ ...exposure, driverCount: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avg Driver Experience (yrs)</label>
          <input
            type="number"
            value={exposure.avgDriverExperience || ''}
            onChange={(e) => onChange({ ...exposure, avgDriverExperience: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Commodities</label>
        <div className="flex flex-wrap gap-2">
          {COMMODITIES.map((commodity) => (
            <label
              key={commodity}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                exposure.commodities.includes(commodity)
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={exposure.commodities.includes(commodity)}
                onChange={() => handleCommodityToggle(commodity)}
                className="sr-only"
              />
              <span className="text-sm">{commodity}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">For-Hire vs Private</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!exposure.isForHire}
                onChange={() => onChange({ ...exposure, isForHire: false })}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Private</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={exposure.isForHire}
                onChange={() => onChange({ ...exposure, isForHire: true })}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">For-Hire</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telematics</label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exposure.hasTelematics}
              onChange={(e) => onChange({ ...exposure, hasTelematics: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Has telematics installed</span>
          </label>
        </div>
      </div>
    </div>
  )
}
