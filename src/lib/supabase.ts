import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CreateTestConfigurationData {
  name: string;
  description?: string;
  selectedTests: string[];
  systemPrompt?: string;
  isPublic?: boolean;
}

export async function createTestConfiguration(data: CreateTestConfigurationData) {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session?.session?.user) {
    throw new Error('User must be authenticated to create a test configuration');
  }

  const { data: test, error } = await supabase
    .from('test_configurations')
    .insert({
      name: data.name,
      description: data.description,
      selected_tests: data.selectedTests,
      system_prompt: data.systemPrompt,
      status: 'active',
      is_public: data.isPublic ?? true,
      user_id: session.session.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return test;
}

export async function saveTestResponses(testId: string, responses: Record<string, string>) {
  const responsesArray = Object.entries(responses).map(([questionId, response]) => ({
    test_id: testId,
    question_id: questionId,
    response
  }));

  const { error } = await supabase
    .from('test_responses')
    .insert(responsesArray);

  if (error) throw error;
}

export async function saveTestResults(testId: string, scores: any, summary: string) {
  const { error } = await supabase
    .from('test_results')
    .insert({
      test_id: testId,
      scores,
      summary
    });

  if (error) throw error;
}

export async function analyzeResponses(responses: Record<string, string>) {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-pes', {
      body: { responses },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from edge function');
    }

    return data;
  } catch (error) {
    console.error('Failed to analyze responses:', error);
    // Return default scores as fallback
    return {
      negativeCognitive: 0.5,
      positiveCognitive: 0.5,
      negativeAffective: 0.5,
      positiveAffective: 0.5,
      overall: 0.5
    };
  }
}