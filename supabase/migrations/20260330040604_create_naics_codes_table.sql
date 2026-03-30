/*
  # Create NAICS Codes Table

  1. New Tables
    - `naics_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - 6-digit NAICS code
      - `title` (text) - Official NAICS title
      - `description` (text) - Detailed description
      - `sector` (text) - High-level sector name
      - `sector_code` (text) - 2-digit sector code
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `naics_codes` table
    - Add policy for authenticated users to read all NAICS codes
*/

CREATE TABLE IF NOT EXISTS naics_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  sector text,
  sector_code text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE naics_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read NAICS codes"
  ON naics_codes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_naics_codes_code ON naics_codes(code);
CREATE INDEX IF NOT EXISTS idx_naics_codes_sector ON naics_codes(sector);
CREATE INDEX IF NOT EXISTS idx_naics_codes_title ON naics_codes USING gin(to_tsvector('english', title));