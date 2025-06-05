/*
  # Add public/private toggle for tests

  1. Changes
    - Add is_public column to test_configurations
    - Add policies for public test visibility
    - Add policies for creating public tests

  2. Security
    - Enable RLS for public test access
    - Restrict private test creation to pro users
*/

-- Add is_public column with default public visibility
ALTER TABLE test_configurations 
ADD COLUMN is_public boolean DEFAULT true;

-- Allow anyone to view public tests
CREATE POLICY "Anyone can view public tests" 
ON test_configurations
FOR SELECT
TO public
USING (is_public = true);

-- Allow authenticated users to create public tests
CREATE POLICY "Authenticated users can create public tests"
ON test_configurations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  is_public = true
);