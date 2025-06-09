/*
  # Create battles table for rap battle management

  1. New Tables
    - `battles`
      - `id` (uuid, primary key)
      - `user1_id` (uuid, references profiles.id)
      - `user2_id` (uuid, references profiles.id)
      - `character1_id` (uuid, references characters.id)
      - `character2_id` (uuid, references characters.id)
      - `topic` (text, not null)
      - `verses` (jsonb, array of battle verses)
      - `winner_id` (uuid, references profiles.id, nullable)
      - `status` (text, check constraint for valid statuses)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `battles` table
    - Add policies for battle participants to manage battles
    - Add policy for users to read completed battles
*/

-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  character1_id uuid REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  character2_id uuid REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  verses jsonb DEFAULT '[]' NOT NULL,
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'active', 'completed')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Battle participants can manage battles"
  ON battles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can read completed battles"
  ON battles
  FOR SELECT
  TO authenticated
  USING (status = 'completed');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS battles_user1_id_idx ON battles(user1_id);
CREATE INDEX IF NOT EXISTS battles_user2_id_idx ON battles(user2_id);
CREATE INDEX IF NOT EXISTS battles_status_idx ON battles(status);
CREATE INDEX IF NOT EXISTS battles_created_at_idx ON battles(created_at);

-- Function to update battle statistics
CREATE OR REPLACE FUNCTION update_battle_stats()
RETURNS trigger AS $$
BEGIN
  -- Only update stats when battle is completed and has a winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND OLD.status != 'completed' THEN
    -- Update winner's stats
    UPDATE profiles 
    SET wins = wins + 1, total_battles = total_battles + 1
    WHERE id = NEW.winner_id;
    
    -- Update loser's stats
    UPDATE profiles 
    SET losses = losses + 1, total_battles = total_battles + 1
    WHERE id = CASE 
      WHEN NEW.winner_id = NEW.user1_id THEN NEW.user2_id 
      ELSE NEW.user1_id 
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update battle statistics
DROP TRIGGER IF EXISTS on_battle_completed ON battles;
CREATE TRIGGER on_battle_completed
  AFTER UPDATE ON battles
  FOR EACH ROW EXECUTE FUNCTION update_battle_stats();