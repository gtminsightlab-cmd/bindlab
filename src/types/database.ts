export interface Profile {
  id: string
  org_id: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  org_id: string
  business_name: string
  dba: string
  primary_contact_name: string
  contact_email: string
  contact_phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip: string
  sic_code: string
  naics_code: string
  description_of_operations: string
  status: 'active' | 'inactive'
  producer_id: string | null
  created_by: string
  created_at: string
  updated_at: string
  industry_type?: string | null
  market_segment?: MarketSegment | null
  producer?: Profile
}

export interface ClientFormData {
  business_name: string
  dba: string
  primary_contact_name: string
  contact_email: string
  contact_phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  zip: string
  sic_code: string
  naics_code: string
  description_of_operations: string
}

export interface GlClassCode {
  id: string
  class_code: string
  description: string
  industry_group: string | null
  hazard_level: 'Low' | 'Moderate' | 'High' | 'Very High'
  common_lobs: string[]
  is_active: boolean
  created_at: string
}

export interface NaicsCode {
  id: string
  code: string
  title: string
  description: string | null
  sector: string | null
  sector_code: string | null
  is_active: boolean
  created_at: string
}

export interface CarrierLobAppetite {
  id: string
  carrier_id: string
  lob: LineOfBusiness
  min_employees: number
  max_employees: number
  min_revenue_cents: number | null
  max_revenue_cents: number | null
  min_payroll_cents: number | null
  max_payroll_cents: number | null
  max_xmod: number | null
  accepted_class_codes: string[]
  accepted_naics_codes: string[]
  accepted_states: string[]
  min_tiv_cents: number | null
  max_tiv_cents: number | null
  accepted_construction_types: string[]
  max_building_age: number | null
  min_vehicles: number
  max_vehicles: number
  accepted_commodities: string[]
  accepted_protection_classes: string[]
  lob_specific_params: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MarketSegment = 'Micro' | 'Small' | 'Middle' | 'Large'
export type MarketStatus = 'New Business' | 'Remarketing' | 'Non-Renewed' | 'Declined'
export type LineOfBusiness =
  | 'Workers Comp'
  | 'General Liability'
  | 'Business Auto'
  | 'BOP'
  | 'Property'
  | 'Umbrella'
  | 'Cyber'
  | 'Professional Liability'

export type ConstructionType =
  | 'Frame'
  | 'Joisted Masonry'
  | 'Non-Combustible'
  | 'Fire-Resistive'
  | 'Masonry Non-Combustible'

export type RoofType =
  | 'Asphalt Shingle'
  | 'TPO'
  | 'EPDM'
  | 'Metal'
  | 'Built-Up'
  | 'Tile'
  | 'Other'

export type OccupancyType =
  | 'Office'
  | 'Retail'
  | 'Restaurant'
  | 'Service'
  | 'Warehouse'
  | 'Other'

export type VehicleType =
  | 'Tractor'
  | 'Straight Truck'
  | 'Van'
  | 'Sedan'
  | 'Other'

export type Commodity =
  | 'Dry Goods'
  | 'Refrigerated'
  | 'Flatbed'
  | 'Hazmat'
  | 'General Freight'
  | 'Other'

export type ProfessionalLiabilityType = 'E&O' | 'D&O' | 'EPLI'

export interface WcExposure {
  enabled: boolean
  governingClassCode: string | null
  governingClassDescription?: string
  additionalClassCodes: string[]
  payrollCents: number
  xmod: number
}

export interface GlExposure {
  enabled: boolean
  primaryClassCode: string | null
  primaryClassDescription?: string
  additionalClassCodes: string[]
  revenueCents: number
  subcontractorPercent: number
}

export interface AutoExposure {
  enabled: boolean
  vehicleCount: number
  vehicleBreakdown: { type: VehicleType; count: number }[]
  radiusLocal: number
  radiusIntermediate: number
  radiusLongHaul: number
  driverCount: number
  avgDriverExperience: number
  commodities: Commodity[]
  isForHire: boolean
  hasTelematics: boolean
}

export interface BopExposure {
  enabled: boolean
  squareFootage: number
  occupancyType: OccupancyType | null
  revenueCents: number
  cookingOnPremises: boolean
  manufacturingOnPremises: boolean
}

export interface PropertyExposure {
  enabled: boolean
  buildingValueCents: number
  contentsValueCents: number
  constructionType: ConstructionType | null
  yearBuilt: number | null
  roofAge: number | null
  roofType: RoofType | null
  protectionClass: number | null
  numberOfUnits: number | null
  occupancyPercent: number
  stories: number
}

export interface UmbrellaExposure {
  enabled: boolean
  underlyingGlLimitCents: number
  underlyingAutoLimitCents: number
  requestedLimitCents: number
}

export interface CyberExposure {
  enabled: boolean
  recordCount: number
  hasPriorCoverage: boolean
  hasPriorIncidents: boolean
}

export interface ProfessionalExposure {
  enabled: boolean
  type: ProfessionalLiabilityType | null
  revenueCents: number
}

export interface LossHistory {
  lossCount3yr: number
  lossTotal3yrCents: number
  largestLossCents: number
  narrative: string
}

export interface ProspectExposure {
  id: string
  org_id: string
  client_id: string | null
  prospect_name: string
  state: string
  naics_code: string | null
  years_in_business: number | null
  employee_count: number | null
  annual_revenue_cents: number | null
  market_segment: MarketSegment | null
  wc_exposure: WcExposure
  gl_exposure: GlExposure
  auto_exposure: AutoExposure
  bop_exposure: BopExposure
  property_exposure: PropertyExposure
  umbrella_exposure: UmbrellaExposure
  cyber_exposure: CyberExposure
  professional_exposure: ProfessionalExposure
  business_description: string | null
  risk_narrative: string | null
  market_status: MarketStatus | null
  incumbent_carrier: string | null
  expiring_premium_cents: number | null
  reason_for_shopping: string | null
  loss_history: LossHistory
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface ProspectExposureFormData {
  prospect_name: string
  state: string
  naics_code: string | null
  years_in_business: number | null
  employee_count: number | null
  annual_revenue_cents: number | null
  market_segment: MarketSegment | null
  wc_exposure: WcExposure
  gl_exposure: GlExposure
  auto_exposure: AutoExposure
  bop_exposure: BopExposure
  property_exposure: PropertyExposure
  umbrella_exposure: UmbrellaExposure
  cyber_exposure: CyberExposure
  professional_exposure: ProfessionalExposure
  business_description: string | null
  risk_narrative: string | null
  market_status: MarketStatus | null
  incumbent_carrier: string | null
  expiring_premium_cents: number | null
  reason_for_shopping: string | null
  loss_history: LossHistory
}

export const DEFAULT_WC_EXPOSURE: WcExposure = {
  enabled: false,
  governingClassCode: null,
  additionalClassCodes: [],
  payrollCents: 0,
  xmod: 1.0
}

export const DEFAULT_GL_EXPOSURE: GlExposure = {
  enabled: false,
  primaryClassCode: null,
  additionalClassCodes: [],
  revenueCents: 0,
  subcontractorPercent: 0
}

export const DEFAULT_AUTO_EXPOSURE: AutoExposure = {
  enabled: false,
  vehicleCount: 0,
  vehicleBreakdown: [],
  radiusLocal: 100,
  radiusIntermediate: 0,
  radiusLongHaul: 0,
  driverCount: 0,
  avgDriverExperience: 0,
  commodities: [],
  isForHire: false,
  hasTelematics: false
}

export const DEFAULT_BOP_EXPOSURE: BopExposure = {
  enabled: false,
  squareFootage: 0,
  occupancyType: null,
  revenueCents: 0,
  cookingOnPremises: false,
  manufacturingOnPremises: false
}

export const DEFAULT_PROPERTY_EXPOSURE: PropertyExposure = {
  enabled: false,
  buildingValueCents: 0,
  contentsValueCents: 0,
  constructionType: null,
  yearBuilt: null,
  roofAge: null,
  roofType: null,
  protectionClass: null,
  numberOfUnits: null,
  occupancyPercent: 100,
  stories: 1
}

export const DEFAULT_UMBRELLA_EXPOSURE: UmbrellaExposure = {
  enabled: false,
  underlyingGlLimitCents: 0,
  underlyingAutoLimitCents: 0,
  requestedLimitCents: 0
}

export const DEFAULT_CYBER_EXPOSURE: CyberExposure = {
  enabled: false,
  recordCount: 0,
  hasPriorCoverage: false,
  hasPriorIncidents: false
}

export const DEFAULT_PROFESSIONAL_EXPOSURE: ProfessionalExposure = {
  enabled: false,
  type: null,
  revenueCents: 0
}

export const DEFAULT_LOSS_HISTORY: LossHistory = {
  lossCount3yr: 0,
  lossTotal3yrCents: 0,
  largestLossCents: 0,
  narrative: ''
}


export interface UnifiedMatchInput {
  prospect_name: string
  state: string
  naics_code: string | null
  years_in_business: number | null
  employee_count: number | null
  annual_revenue_cents: number | null
  market_segment: MarketSegment | null
  wc_exposure: WcExposure
  gl_exposure: GlExposure
  auto_exposure: AutoExposure
  bop_exposure: BopExposure
  property_exposure: PropertyExposure
  umbrella_exposure: UmbrellaExposure
  cyber_exposure: CyberExposure
  professional_exposure: ProfessionalExposure
}

export interface LobMatchResult {
  lob: LineOfBusiness
  carrier: Carrier
  score: number
  isAppointed: boolean
  matchDetails: {
    classCodeMatch: boolean
    sizeMatch: boolean
    revenueMatch: boolean
    additionalFactors: string[]
  }
}

export interface ProgramRecommendation {
  lobMatches: Record<LineOfBusiness, LobMatchResult | null>
  overallScore: number
  packageAlternative: {
    carrier: Carrier
    score: number
    coversAllLines: boolean
  } | null
}

export interface CarrierLobMatch {
  carrier: CarrierWithAppointment
  score: number
  matchDetails: {
    classCodeMatch: boolean
    sizeMatch: boolean
    revenuePayrollMatch: boolean
    additionalMatch: boolean
  }
}