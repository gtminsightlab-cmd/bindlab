/*
  # Create Carrier LOB Appetite Table

  1. New Tables
    - `carrier_lob_appetite`
      - `id` (uuid, primary key)
      - `carrier_id` (uuid, foreign key to carriers)
      - `lob` (text) - Line of business
      - Appetite parameters per LOB:
        - `min_employees`, `max_employees`
        - `min_revenue_cents`, `max_revenue_cents`
        - `min_payroll_cents`, `max_payroll_cents`
        - `max_xmod` (for WC)
        - `accepted_class_codes` (text[])
        - `accepted_naics_codes` (text[])
        - `accepted_states` (text[])
        - `min_tiv_cents`, `max_tiv_cents` (for Property)
        - `accepted_construction_types` (text[])
        - `max_building_age` (integer)
        - `accepted_vehicle_counts` (int range)
        - `accepted_commodities` (text[])
        - Custom JSON for LOB-specific parameters

  2. Security
    - Enable RLS
    - Authenticated users can read all appetite data
*/

CREATE TABLE IF NOT EXISTS carrier_lob_appetite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id uuid NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,
  lob text NOT NULL,
  min_employees integer DEFAULT 1,
  max_employees integer DEFAULT 10000,
  min_revenue_cents bigint DEFAULT 0,
  max_revenue_cents bigint,
  min_payroll_cents bigint DEFAULT 0,
  max_payroll_cents bigint,
  max_xmod numeric(4,2) DEFAULT 1.50,
  accepted_class_codes text[] DEFAULT '{}',
  accepted_naics_codes text[] DEFAULT '{}',
  accepted_states text[] DEFAULT '{}',
  min_tiv_cents bigint DEFAULT 0,
  max_tiv_cents bigint,
  accepted_construction_types text[] DEFAULT '{}',
  max_building_age integer,
  min_vehicles integer DEFAULT 1,
  max_vehicles integer DEFAULT 1000,
  accepted_commodities text[] DEFAULT '{}',
  accepted_protection_classes text[] DEFAULT '{}',
  lob_specific_params jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT carrier_lob_appetite_unique UNIQUE (carrier_id, lob),
  CONSTRAINT carrier_lob_appetite_lob_check CHECK (lob IN (
    'Workers Comp', 'General Liability', 'Business Auto', 'BOP',
    'Property', 'Umbrella', 'Cyber', 'Professional Liability'
  ))
);

ALTER TABLE carrier_lob_appetite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read carrier LOB appetite"
  ON carrier_lob_appetite
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_carrier_lob_appetite_carrier ON carrier_lob_appetite(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_lob_appetite_lob ON carrier_lob_appetite(lob);