/*
  # Fix profiles table INSERT policy

  1. Security Updates
    - Add missing INSERT policy for profiles table
    - Ensure users can create their own profile during signup
    - Fix RLS policies to prevent database errors during user creation

  2. Changes
    - Add INSERT policy allowing users to create their own profile
    - Ensure all necessary RLS policies are in place for proper authentication flow
*/

-- Add INSERT policy for profiles table to allow users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure we have all necessary policies (these may already exist but won't error if they do)
DO $$
BEGIN
  -- Check if SELECT policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Check if UPDATE policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;