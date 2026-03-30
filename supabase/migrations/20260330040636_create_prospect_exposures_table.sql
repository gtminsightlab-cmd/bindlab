/*
  # Create Prospect Exposures Table

  1. New Tables
    - `prospect_exposures`
      - `id` (uuid, primary key)
      - `org_id` (uuid) - Organization that owns this data
      - `client_id` (uuid, nullable) - Optional link to existing client
      - `prospect_name` (text) - Business name
      - `state` (text) - Primary state
      - `naics_code` (text)
      - `years_in_business` (integer)
      - `employee_count` (integer)
      - `annual_revenue_cents` (bigint)
      - `market_segment` (text)
      
      LOB-specific JSONB columns for flexibility:
      - `wc_exposure` (jsonb) - WC-specific data
      - `gl_exposure` (jsonb) - GL-specific data
      - `auto_exposure` (jsonb) - Auto-specific data
      - `bop_exposure` (jsonb) - BOP-specific data
      - `property_exposure` (jsonb) - Property-specific data
      - `umbrella_exposure` (jsonb) - Umbrella-specific data
      - `cyber_exposure` (jsonb) - Cyber-specific data
      - `professional_exposure` (jsonb) - Professional liability data
      
      Additional context:
      - `business_description` (text)
      - `risk_narrative` (text)
      - `market_status` (text)
      - `incumbent_carrier` (text)
      - `expiring_premium_cents` (bigint)
      - `reason_for_shopping` (text)
      - `loss_history` (jsonb)

  2. Security
    - Enable RLS
    - Users can only see/edit their org's exposures
*/

CREATE TABLE IF NOT EXISTS prospect_exposures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  prospect_name text NOT NULL,
  state text NOT NULL,
  naics_code text,
  years_in_business integer,
  employee_count integer,
  annual_revenue_cents bigint,
  market_segment text,
  
  wc_exposure jsonb DEFAULT '{}',
  gl_exposure jsonb DEFAULT '{}',
  auto_exposure jsonb DEFAULT '{}',
  bop_exposure jsonb DEFAULT '{}',
  property_exposure jsonb DEFAULT '{}',
  umbrella_exposure jsonb DEFAULT '{}',
  cyber_exposure jsonb DEFAULT '{}',
  professional_exposure jsonb DEFAULT '{}',
  
  business_description text,
  risk_narrative text,
  market_status text,
  incumbent_carrier text,
  expiring_premium_cents bigint,
  reason_for_shopping text,
  loss_history jsonb DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  
  CONSTRAINT prospect_exposures_market_segment_check CHECK (
    market_segment IS NULL OR market_segment IN ('Micro', 'Small', 'Middle', 'Large')
  ),
  CONSTRAINT prospect_exposures_market_status_check CHECK (
    market_status IS NULL OR market_status IN ('New Business', 'Remarketing', 'Non-Renewed', 'Declined')
  )
);

ALTER TABLE prospect_exposures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org prospect exposures"
  ON prospect_exposures
  FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own org prospect exposures"
  ON prospect_exposures
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own org prospect exposures"
  ON prospect_exposures
  FOR UPDATE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org prospect exposures"
  ON prospect_exposures
  FOR DELETE
  TO authenticated
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_prospect_exposures_org ON prospect_exposures(org_id);
CREATE INDEX IF NOT EXISTS idx_prospect_exposures_client ON prospect_exposures(client_id);
CREATE INDEX IF NOT EXISTS idx_prospect_exposures_state ON prospect_exposures(state);