import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not configured. Some features may not work properly.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

// Create a mock client if environment variables are missing
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signInWithOtp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    resetPasswordForEmail: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    updateUser: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  },
  from: () => ({
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
    select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }) }) })
  }),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  }
});

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

interface CreateTestConfigurationData {
  name: string;
  description?: string;
  selectedTests: string[];
  systemPrompt?: string;
  isPublic?: boolean;
}

export async function createTestConfiguration(data: CreateTestConfigurationData) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Please set up your environment variables.');
  }

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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured, responses will not be saved');
    return;
  }

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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured, results will not be saved');
    return;
  }

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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured, using fallback analysis');
    return {
      negativeCognitive: 0.5,
      positiveCognitive: 0.5,
      negativeAffective: 0.5,
      positiveAffective: 0.5,
      overall: 0.5
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('analyze-pes', {
      body: { responses },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return {
        negativeCognitive: 0.5,
        positiveCognitive: 0.5,
        negativeAffective: 0.5,
        positiveAffective: 0.5,
        overall: 0.5
      };
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