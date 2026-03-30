/*
  # Create GL Class Codes Table

  1. New Tables
    - `gl_class_codes`
      - `id` (uuid, primary key)
      - `class_code` (text, unique) - ISO GL classification code
      - `description` (text) - Description of the classification
      - `industry_group` (text) - Industry category
      - `hazard_level` (text) - Risk level: Low, Moderate, High, Very High
      - `common_lobs` (text[]) - Lines of business commonly paired with this GL code
      - `is_active` (boolean) - Whether code is currently in use
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `gl_class_codes` table
    - Add policy for authenticated users to read all GL codes
*/

CREATE TABLE IF NOT EXISTS gl_class_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code text UNIQUE NOT NULL,
  description text NOT NULL,
  industry_group text,
  hazard_level text DEFAULT 'Moderate',
  common_lobs text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT gl_class_codes_hazard_level_check CHECK (hazard_level IN ('Low', 'Moderate', 'High', 'Very High'))
);

ALTER TABLE gl_class_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read GL class codes"
  ON gl_class_codes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_gl_class_codes_code ON gl_class_codes(class_code);
CREATE INDEX IF NOT EXISTS idx_gl_class_codes_industry ON gl_class_codes(industry_group);
CREATE INDEX IF NOT EXISTS idx_gl_class_codes_description ON gl_class_codes USING gin(to_tsvector('english', description));