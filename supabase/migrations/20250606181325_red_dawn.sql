/*
  # Database Schema for AI Sanity Check

  1. New Tables
    - `test_configurations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, required)
      - `description` (text, optional)
      - `selected_tests` (text array, required)
      - `system_prompt` (text, optional)
      - `status` (text, default 'draft')
      - `is_public` (boolean, default true)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `test_responses`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to test_configurations)
      - `question_id` (text, required)
      - `response` (text, required)
      - `created_at` (timestamptz, default now())
    
    - `test_results`
      - `id` (uuid, primary key)
      - `test_id` (uuid, foreign key to test_configurations)
      - `scores` (jsonb, required)
      - `summary` (text, optional)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policy for public access to public test configurations
*/

-- Test configurations table
CREATE TABLE IF NOT EXISTS test_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  selected_tests text[] NOT NULL,
  system_prompt text,
  status text NOT NULL DEFAULT 'draft',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test responses table
CREATE TABLE IF NOT EXISTS test_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES test_configurations(id) NOT NULL,
  question_id text NOT NULL,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES test_configurations(id) NOT NULL,
  scores jsonb NOT NULL,
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE test_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view public tests" ON test_configurations;
  DROP POLICY IF EXISTS "Users can view own test configurations" ON test_configurations;
  DROP POLICY IF EXISTS "Users can create test configurations" ON test_configurations;
  DROP POLICY IF EXISTS "Users can update own test configurations" ON test_configurations;
  DROP POLICY IF EXISTS "Authenticated users can create public tests" ON test_configurations;
  DROP POLICY IF EXISTS "Users can view own test responses" ON test_responses;
  DROP POLICY IF EXISTS "Users can create test responses" ON test_responses;
  DROP POLICY IF EXISTS "Users can view own test results" ON test_results;
  DROP POLICY IF EXISTS "Users can create test results" ON test_results;
END $$;

-- Policies for test_configurations
CREATE POLICY "Anyone can view public tests" 
ON test_configurations
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "Users can view own test configurations"
  ON test_configurations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create test configurations"
  ON test_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create public tests"
  ON test_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_public = true);

CREATE POLICY "Users can update own test configurations"
  ON test_configurations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for test_responses
CREATE POLICY "Users can view own test responses"
  ON test_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_configurations
      WHERE id = test_responses.test_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create test responses"
  ON test_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_configurations
      WHERE id = test_responses.test_id
      AND user_id = auth.uid()
    )
  );

-- Policies for test_results
CREATE POLICY "Users can view own test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_configurations
      WHERE id = test_results.test_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create test results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM test_configurations
      WHERE id = test_results.test_id
      AND user_id = auth.uid()
    )
  );