import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createTestConfiguration(data: {
  name: string;
  description: string;
  selectedTests: string[];
  systemPrompt?: string;
}) {
  const { data: test, error } = await supabase
    .from('test_configurations')
    .insert({
      name: data.name,
      description: data.description,
      selected_tests: data.selectedTests,
      system_prompt: data.systemPrompt,
      status: 'active'
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