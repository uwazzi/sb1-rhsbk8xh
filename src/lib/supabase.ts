import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we're in production and missing config
const isProduction = import.meta.env.PROD;
const hasSupabaseConfig = supabaseUrl && supabaseAnonKey;

if (!hasSupabaseConfig) {
  if (isProduction) {
    console.error('🚨 PRODUCTION ERROR: Supabase environment variables are missing!');
    console.error('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment settings.');
  } else {
    console.warn('Supabase environment variables are not configured. Some features may not work properly.');
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  }
}

// Create a mock client if environment variables are missing
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - Please contact support' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - Please contact support' } }),
    signOut: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
    signInWithOtp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - Please contact support' } }),
    resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - Please contact support' } }),
    updateUser: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - Please contact support' } })
  },
  from: () => ({
    insert: () => ({ 
      select: () => ({ 
        single: () => Promise.resolve({ 
          data: null, 
          error: { message: 'Database not configured - Running in demo mode' } 
        }) 
      }) 
    }),
    select: () => ({ 
      eq: () => ({ 
        order: () => Promise.resolve({ 
          data: [], 
          error: { message: 'Database not configured - Running in demo mode' } 
        }) 
      }) 
    }),
    update: () => ({ 
      eq: () => Promise.resolve({ 
        data: null, 
        error: { message: 'Database not configured - Running in demo mode' } 
      }) 
    })
  }),
  functions: {
    invoke: () => Promise.resolve({ 
      data: null, 
      error: { message: 'Supabase functions not configured - Running in demo mode' } 
    })
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {}
  }),
  removeChannel: () => {}
});

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasSupabaseConfig;

interface CreateTestConfigurationData {
  name: string;
  description?: string;
  selectedTests: string[];
  systemPrompt?: string;
  isPublic?: boolean;
}

export async function createTestConfiguration(data: CreateTestConfigurationData) {
  if (!hasSupabaseConfig) {
    throw new Error('Database not configured. This feature requires a backend connection.');
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
  
  // Transform the response to match our interface
  return {
    id: test.id,
    userId: test.user_id,
    name: test.name,
    description: test.description,
    tests: test.selected_tests,
    aiSystemPrompt: test.system_prompt, // Map system_prompt to aiSystemPrompt
    status: test.status,
    createdAt: new Date(test.created_at),
    updatedAt: new Date(test.updated_at),
    isPublic: test.is_public
  };
}

export async function saveTestResponses(testId: string, responses: Record<string, string>) {
  if (!hasSupabaseConfig) {
    console.warn('Database not configured, responses will not be saved');
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
  if (!hasSupabaseConfig) {
    console.warn('Database not configured, results will not be saved');
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
  if (!hasSupabaseConfig) {
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

// Guest profile functions
export async function createGuestProfile(profile: {
  email: string;
  fullName: string;
  company: string;
  position: string;
  interestLevel: string;
  howHeardAbout: string;
  additionalNotes?: string;
}) {
  if (!hasSupabaseConfig) {
    console.warn('Database not configured, guest profile will not be saved');
    return;
  }

  const { data, error } = await supabase
    .from('guest_profiles')
    .insert({
      email: profile.email,
      full_name: profile.fullName,
      company: profile.company,
      position: profile.position,
      interest_level: profile.interestLevel,
      how_heard_about: profile.howHeardAbout,
      additional_notes: profile.additionalNotes || ''
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGuestProfile(email: string) {
  if (!hasSupabaseConfig) {
    return null;
  }

  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching guest profile:', error);
    return null;
  }

  return data;
}