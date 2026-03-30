import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, ChevronRight, Award, Layers } from 'lucide-react'
import { CarrierWithAppointment, LineOfBusiness, CarrierLobMatch } from '../../types/database'

interface LobResults {
  lob: LineOfBusiness
  matches: CarrierLobMatch[]
}

interface ProgramRecommendation {
  lobRecommendations: Record<string, { carrier: CarrierWithAppointment; score: number } | null>
  overallScore: number
  packageAlternative: { carrier: CarrierWithAppointment; avgScore: number; coversAll: boolean } | null
}

interface MatchResultsProps {
  lobResults: LobResults[]
  programRecommendation: ProgramRecommendation | null
}

type ViewMode = 'program' | 'byLine'

export default function MatchResults({ lobResults, programRecommendation }: MatchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('program')
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, CarrierWithAppointment>>({})
  const navigate = useNavigate()

  const handleSelectCarrier = (lob: string, carrier: CarrierWithAppointment) => {
    setSelectedCarriers((prev) => ({ ...prev, [lob]: carrier }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  if (!programRecommendation || lobResults.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Match Results</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('program')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'program'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Best Program
          </button>
          <button
            onClick={() => setViewMode('byLine')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'byLine'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            By Line of Business
          </button>
        </div>
      </div>

      {viewMode === 'program' ? (
        <ProgramView
          recommendation={programRecommendation}
          getScoreColor={getScoreColor}
          onCarrierClick={(id) => navigate(`/dashboard/carriers/${id}`)}
        />
      ) : (
        <ByLineView
          lobResults={lobResults}
          selectedCarriers={selectedCarriers}
          onSelectCarrier={handleSelectCarrier}
          getScoreColor={getScoreColor}
          onCarrierClick={(id) => navigate(`/dashboard/carriers/${id}`)}
        />
      )}
    </div>
  )
}

interface ProgramViewProps {
  recommendation: ProgramRecommendation
  getScoreColor: (score: number) => string
  onCarrierClick: (id: string) => void
}

function ProgramView({ recommendation, getScoreColor, onCarrierClick }: ProgramViewProps) {
  const lobs = Object.entries(recommendation.lobRecommendations).filter(([, match]) => match !== null)

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Recommended Program</h3>
              <p className="text-teal-100 text-sm mt-1">Best carrier for each line of business</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{recommendation.overallScore}%</div>
              <div className="text-teal-100 text-sm">Overall Score</div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {lobs.map(([lob, match]) => (
            <div
              key={lob}
              onClick={() => match && onCarrierClick(match.carrier.id)}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-500">{lob}</div>
                <div>
                  <div className="font-medium text-gray-900">{match?.carrier.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {match?.carrier.am_best_rating && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                        {match.carrier.am_best_rating}
                      </span>
                    )}
                    {match?.carrier.appointment ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Appointed
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not Appointed</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(match?.score || 0)}`}>
                  {match?.score}%
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {recommendation.packageAlternative && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">Package Alternative</h4>
              <p className="text-blue-700 text-sm mt-1">
                <span className="font-medium">{recommendation.packageAlternative.carrier.name}</span>
                {' '}can write all {lobs.length} lines
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getScoreColor(recommendation.packageAlternative.avgScore)}`}>
                  {Math.round(recommendation.packageAlternative.avgScore)}% avg
                </div>
                {recommendation.packageAlternative.carrier.appointment ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Appointed
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Not Appointed</span>
                )}
                <button
                  onClick={() => onCarrierClick(recommendation.packageAlternative!.carrier.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Carrier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ByLineViewProps {
  lobResults: LobResults[]
  selectedCarriers: Record<string, CarrierWithAppointment>
  onSelectCarrier: (lob: string, carrier: CarrierWithAppointment) => void
  getScoreColor: (score: number) => string
  onCarrierClick: (id: string) => void
}

function ByLineView({ lobResults, selectedCarriers, onSelectCarrier, getScoreColor, onCarrierClick }: ByLineViewProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="inline-flex gap-4 min-w-full pb-4">
          {lobResults.map((result) => (
            <div
              key={result.lob}
              className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-800 px-4 py-3">
                <h4 className="font-medium text-white">{result.lob}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{result.matches.length} carriers</p>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {result.matches.map((match, index) => {
                  const isSelected = selectedCarriers[result.lob]?.id === match.carrier.id
                  return (
                    <div
                      key={match.carrier.id}
                      onClick={() => onSelectCarrier(result.lob, match.carrier)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-4">#{index + 1}</span>
                            <span className="font-medium text-gray-900 truncate">{match.carrier.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-6">
                            {match.carrier.am_best_rating && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                                {match.carrier.am_best_rating}
                              </span>
                            )}
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              Tier {match.carrier.tier}
                            </span>
                            {match.carrier.appointment && (
                              <Check className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getScoreColor(match.score)}`}>
                          {match.score}%
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 ml-6 text-xs text-gray-500">
                        <span className="flex items-center gap-0.5">
                          {match.matchDetails.classCodeMatch ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-300" />
                          )}
                          Code
                        </span>
                        <span className="flex items-center gap-0.5">
                          {match.matchDetails.sizeMatch ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-300" />
                          )}
                          Size
                        </span>
                        <span className="flex items-center gap-0.5">
                          {match.matchDetails.revenuePayrollMatch ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-300" />
                          )}
                          $
                        </span>
                      </div>
                    </div>
                  )
                })}
                {result.matches.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No matching carriers
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(selectedCarriers).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Your Custom Program</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(selectedCarriers).map(([lob, carrier]) => (
              <div
                key={lob}
                onClick={() => onCarrierClick(carrier.id)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:border-teal-300"
              >
                <span className="text-xs font-medium text-gray-500">{lob}:</span>
                <span className="font-medium text-gray-900">{carrier.name}</span>
                {carrier.appointment && <Check className="w-4 h-4 text-green-500" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
