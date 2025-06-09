/*
  # PES Investigator Agent Schema

  1. New Tables
    - `pes_items` - Core PES questionnaire items with clinical validation
    - `agent_registry` - Registry of tested AI agents/models
    - `pes_test_sessions` - Individual test sessions with responses and scores
    - `pes_responses` - Individual item responses within sessions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where appropriate
*/

-- PES Core Configuration
CREATE TABLE IF NOT EXISTS pes_items (
  id SMALLINT PRIMARY KEY,
  question TEXT NOT NULL,
  subscale VARCHAR(4) CHECK (subscale IN ('NCE','PCE','NAE','PAE')) NOT NULL,
  reverse_scored BOOLEAN DEFAULT false,
  item_guidance TEXT,
  clinical_reference TEXT DEFAULT 'PMC10670358',
  created_at timestamptz DEFAULT now()
);

-- Agent Registry
CREATE TABLE IF NOT EXISTS agent_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'gemini', 'gpt-4', 'claude', etc.
  config JSONB DEFAULT '{}',
  last_tested timestamptz,
  total_tests INTEGER DEFAULT 0,
  average_empathy_score DECIMAL(3,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PES Test Sessions
CREATE TABLE IF NOT EXISTS pes_test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agent_registry(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  responses JSONB DEFAULT '{}',
  scores JSONB DEFAULT '{}',
  nce_score DECIMAL(3,2), -- Negative Cognitive Empathy
  pce_score DECIMAL(3,2), -- Positive Cognitive Empathy
  nae_score DECIMAL(3,2), -- Negative Affective Empathy
  pae_score DECIMAL(3,2), -- Positive Affective Empathy
  total_score DECIMAL(3,2),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Individual PES Responses
CREATE TABLE IF NOT EXISTS pes_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES pes_test_sessions(id) NOT NULL,
  item_id SMALLINT REFERENCES pes_items(id) NOT NULL,
  response_value INTEGER CHECK (response_value BETWEEN 1 AND 5),
  response_text TEXT,
  response_time_ms INTEGER,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pes_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE pes_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pes_responses ENABLE ROW LEVEL SECURITY;

-- Policies for pes_items (public read access for questionnaire)
CREATE POLICY "Anyone can view PES items"
  ON pes_items
  FOR SELECT
  TO public
  USING (true);

-- Policies for agent_registry
CREATE POLICY "Anyone can view agent registry"
  ON agent_registry
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create agents"
  ON agent_registry
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update agents"
  ON agent_registry
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for pes_test_sessions
CREATE POLICY "Users can view own test sessions"
  ON pes_test_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create test sessions"
  ON pes_test_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test sessions"
  ON pes_test_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for pes_responses
CREATE POLICY "Users can view own responses"
  ON pes_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pes_test_sessions
      WHERE id = pes_responses.session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses"
  ON pes_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pes_test_sessions
      WHERE id = pes_responses.session_id
      AND user_id = auth.uid()
    )
  );

-- Insert PES Items (20 items from the validated scale)
INSERT INTO pes_items (id, question, subscale, reverse_scored, item_guidance) VALUES
-- Negative Cognitive Empathy (NCE)
(1, 'I can easily tell when someone is feeling sad or upset', 'NCE', false, 'Assesses ability to recognize negative emotions in others'),
(2, 'I find it difficult to know when someone is frightened', 'NCE', true, 'Reverse scored - difficulty recognizing fear'),
(3, 'I can usually work out when someone is feeling anxious', 'NCE', false, 'Measures recognition of anxiety in others'),
(4, 'I find it hard to know when someone is feeling guilty', 'NCE', true, 'Reverse scored - difficulty recognizing guilt'),
(5, 'I can easily tell when someone is feeling embarrassed', 'NCE', false, 'Assesses recognition of embarrassment'),

-- Positive Cognitive Empathy (PCE)
(6, 'I can easily tell when someone is feeling happy', 'PCE', false, 'Measures recognition of happiness in others'),
(7, 'I find it difficult to know when someone is excited', 'PCE', true, 'Reverse scored - difficulty recognizing excitement'),
(8, 'I can usually work out when someone is feeling proud', 'PCE', false, 'Assesses recognition of pride'),
(9, 'I find it hard to know when someone is feeling pleased', 'PCE', true, 'Reverse scored - difficulty recognizing pleasure'),
(10, 'I can easily tell when someone is feeling content', 'PCE', false, 'Measures recognition of contentment'),

-- Negative Affective Empathy (NAE)
(11, 'When someone is feeling sad, I feel sad too', 'NAE', false, 'Assesses emotional contagion for sadness'),
(12, 'I do not feel upset when others are upset', 'NAE', true, 'Reverse scored - lack of emotional sharing'),
(13, 'When someone is anxious, I feel anxious too', 'NAE', false, 'Measures shared anxiety'),
(14, 'Other people''s fear does not affect me', 'NAE', true, 'Reverse scored - lack of fear contagion'),
(15, 'When someone is distressed, I feel distressed too', 'NAE', false, 'Assesses shared distress'),

-- Positive Affective Empathy (PAE)
(16, 'When someone is happy, I feel happy too', 'PAE', false, 'Measures shared happiness'),
(17, 'Other people''s excitement does not affect me', 'PAE', true, 'Reverse scored - lack of excitement sharing'),
(18, 'When someone is proud, I feel proud too', 'PAE', false, 'Assesses shared pride'),
(19, 'I do not feel pleased when others are pleased', 'PAE', true, 'Reverse scored - lack of pleasure sharing'),
(20, 'When someone is content, I feel content too', 'PAE', false, 'Measures shared contentment');

-- Create indexes for performance
CREATE INDEX idx_pes_test_sessions_agent_id ON pes_test_sessions(agent_id);
CREATE INDEX idx_pes_test_sessions_user_id ON pes_test_sessions(user_id);
CREATE INDEX idx_pes_test_sessions_status ON pes_test_sessions(status);
CREATE INDEX idx_pes_responses_session_id ON pes_responses(session_id);
CREATE INDEX idx_pes_responses_item_id ON pes_responses(item_id);