/*
  # Add personality and signature fields to characters table

  1. Changes
    - Add `personality` column (text) to store character personality description
    - Add `signature` column (text[]) to store character signature phrases as an array
  
  2. Security
    - No changes to existing RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'personality'
  ) THEN
    ALTER TABLE characters ADD COLUMN personality text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'signature'
  ) THEN
    ALTER TABLE characters ADD COLUMN signature text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;