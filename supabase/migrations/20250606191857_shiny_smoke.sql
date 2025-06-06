/*
  # Create guest profiles table

  1. New Tables
    - `guest_profiles`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `company` (text)
      - `position` (text)
      - `interest_level` (text)
      - `how_heard_about` (text)
      - `additional_notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on `guest_profiles` table
    - Add policy for public insert access
    - Add policy for users to view their own profile
*/

CREATE TABLE IF NOT EXISTS guest_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company text,
  position text,
  interest_level text CHECK (interest_level IN ('high', 'medium', 'low', 'just_browsing')),
  how_heard_about text,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create a guest profile
CREATE POLICY "Anyone can create guest profiles"
  ON guest_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own profile by email
CREATE POLICY "Users can view own guest profile"
  ON guest_profiles
  FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow updates to own profile
CREATE POLICY "Users can update own guest profile"
  ON guest_profiles
  FOR UPDATE
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');