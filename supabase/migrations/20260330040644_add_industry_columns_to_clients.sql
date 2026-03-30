/*
  # Add Industry Columns to Clients Table

  1. Changes
    - Add `industry_type` column for industry classification
    - Add `market_segment` column for size segmentation

  2. Notes
    - naics_code column already exists
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'industry_type'
  ) THEN
    ALTER TABLE clients ADD COLUMN industry_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'market_segment'
  ) THEN
    ALTER TABLE clients ADD COLUMN market_segment text;
    ALTER TABLE clients ADD CONSTRAINT clients_market_segment_check CHECK (
      market_segment IS NULL OR market_segment IN ('Micro', 'Small', 'Middle', 'Large')
    );
  END IF;
END $$;