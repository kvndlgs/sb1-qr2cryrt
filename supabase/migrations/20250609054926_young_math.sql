/*
  # Fix default characters insertion

  1. Schema Changes
    - Modify user_id column to allow NULL values for default characters
    - Temporarily disable RLS for insertion
  
  2. Data Insertion
    - Insert default characters with NULL user_id
    - Street Savage, Conscious King, Comedy Queen, Battle Legend
  
  3. Security
    - Re-enable RLS
    - Add policy for reading default characters
*/

-- First, modify the foreign key constraint to allow NULL user_id for default characters
ALTER TABLE characters ALTER COLUMN user_id DROP NOT NULL;

-- Temporarily disable RLS to insert default characters
ALTER TABLE characters DISABLE ROW LEVEL SECURITY;

-- Insert default characters only if they don't already exist
INSERT INTO characters (
  id,
  user_id,
  name,
  description,
  style,
  voice_settings,
  avatar_url,
  is_default,
  personality,
  signature
)
SELECT 
  gen_random_uuid(),
  NULL,
  'Street Savage',
  'Raw, aggressive style from the streets',
  '{"tempo": "fast", "complexity": "moderate", "attitude": "aggressive", "rhymeScheme": "AABB"}',
  '{"voice_id": "21m00Tcm4TlvDq8ikWAM", "settings": {"stability": 0.75, "similarity_boost": 0.8, "style": 0.4, "use_speaker_boost": true}}',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  'Tough, street-smart, confrontational with urban slang and gritty wordplay',
  ARRAY['Keep it real', 'Street certified', 'From the block']
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Street Savage' AND is_default = true
);

INSERT INTO characters (
  id,
  user_id,
  name,
  description,
  style,
  voice_settings,
  avatar_url,
  is_default,
  personality,
  signature
)
SELECT 
  gen_random_uuid(),
  NULL,
  'Conscious King',
  'Deep, philosophical rap with meaningful messages',
  '{"tempo": "medium", "complexity": "complex", "attitude": "conscious", "rhymeScheme": "ABCB"}',
  '{"voice_id": "AZnzlk1XvdvUeBnXmlld", "settings": {"stability": 0.85, "similarity_boost": 0.9, "style": 0.2, "use_speaker_boost": false}}',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  'Intellectual, socially aware, thought-provoking with deep metaphors',
  ARRAY['Knowledge is power', 'Elevate the mind', 'Speaking truth']
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Conscious King' AND is_default = true
);

INSERT INTO characters (
  id,
  user_id,
  name,
  description,
  style,
  voice_settings,
  avatar_url,
  is_default,
  personality,
  signature
)
SELECT 
  gen_random_uuid(),
  NULL,
  'Comedy Queen',
  'Hilarious wordplay and comedic timing',
  '{"tempo": "medium", "complexity": "moderate", "attitude": "humorous", "rhymeScheme": "ABAB"}',
  '{"voice_id": "ErXwobaYiN019PkySvjV", "settings": {"stability": 0.6, "similarity_boost": 0.7, "style": 0.8, "use_speaker_boost": true}}',
  'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  'Witty, playful, clever with puns and comedic references',
  ARRAY['Laugh out loud', 'Comedy gold', 'Jokes for days']
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Comedy Queen' AND is_default = true
);

INSERT INTO characters (
  id,
  user_id,
  name,
  description,
  style,
  voice_settings,
  avatar_url,
  is_default,
  personality,
  signature
)
SELECT 
  gen_random_uuid(),
  NULL,
  'Battle Legend',
  'Technical master with complex rhyme schemes',
  '{"tempo": "fast", "complexity": "complex", "attitude": "technical", "rhymeScheme": "complex"}',
  '{"voice_id": "VR6AewLTigWG4xSOukaG", "settings": {"stability": 0.9, "similarity_boost": 0.95, "style": 0.1, "use_speaker_boost": false}}',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  true,
  'Precise, technical, battle-tested with intricate wordplay',
  ARRAY['Lyrical precision', 'Battle tested', 'Technical excellence']
WHERE NOT EXISTS (
  SELECT 1 FROM characters WHERE name = 'Battle Legend' AND is_default = true
);

-- Re-enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading default characters (with conditional creation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'characters' 
    AND policyname = 'Anyone can read default characters'
  ) THEN
    CREATE POLICY "Anyone can read default characters"
      ON characters
      FOR SELECT
      TO authenticated
      USING (is_default = true);
  END IF;
END $$;