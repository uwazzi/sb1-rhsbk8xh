/*
  # Schema update for AI testing platform
  
  1. Tables
    - test_configurations: Stores test setup and metadata
    - test_responses: Stores individual test responses
    - test_results: Stores test results and analysis
  
  2. Security
    - Enables RLS on all tables
    - Sets up policies for public access and authenticated users
    - Handles policy conflicts with safe creation
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

-- Safely create policies for test_configurations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_configurations' 
    AND policyname = 'Anyone can view public tests'
  ) THEN
    CREATE POLICY "Anyone can view public tests" 
    ON test_configurations
    FOR SELECT
    TO public
    USING (is_public = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_configurations' 
    AND policyname = 'Users can view own test configurations'
  ) THEN
    CREATE POLICY "Users can view own test configurations"
    ON test_configurations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_configurations' 
    AND policyname = 'Users can create test configurations'
  ) THEN
    CREATE POLICY "Users can create test configurations"
    ON test_configurations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_configurations' 
    AND policyname = 'Users can update own test configurations'
  ) THEN
    CREATE POLICY "Users can update own test configurations"
    ON test_configurations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Safely create policies for test_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_responses' 
    AND policyname = 'Users can view own test responses'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_responses' 
    AND policyname = 'Users can create test responses'
  ) THEN
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
  END IF;
END $$;

-- Safely create policies for test_results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_results' 
    AND policyname = 'Users can view own test results'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_results' 
    AND policyname = 'Users can create test results'
  ) THEN
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
  END IF;
END $$;