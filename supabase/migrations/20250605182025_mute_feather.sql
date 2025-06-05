/*
  # Add public tests support
  
  1. Changes
    - Add is_public column to test_configurations
    - Add policies for public test visibility
    
  2. Security
    - Public tests are readable by all users
    - Only authenticated users can create public tests
*/

ALTER TABLE test_configurations
ADD COLUMN is_public boolean DEFAULT false;

-- Allow anyone to view public tests
CREATE POLICY "Anyone can view public tests" 
ON test_configurations
FOR SELECT
TO public
USING (is_public = true);

-- Only authenticated users can create public tests
CREATE POLICY "Authenticated users can create public tests"
ON test_configurations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  is_public = true
);