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
