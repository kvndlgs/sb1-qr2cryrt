/*
  # Create characters table for AI rap battle characters

  1. New Tables
    - `characters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `name` (text, not null)
      - `description` (text, not null)
      - `style` (text, not null)
      - `voice_settings` (jsonb, for ElevenLabs voice configuration)
      - `avatar_url` (text, nullable)
      - `is_default` (boolean, default false)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `characters` table
    - Add policies for users to manage their own characters
    - Add policy for users to read other users' characters (for battles)
*/

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  style text NOT NULL,
  voice_settings jsonb DEFAULT '{}' NOT NULL,
  avatar_url text,
  is_default boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own characters"
  ON characters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read other characters"
  ON characters
  FOR SELECT
  TO authenticated
  USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS characters_user_id_idx ON characters(user_id);
CREATE INDEX IF NOT EXISTS characters_is_default_idx ON characters(is_default);