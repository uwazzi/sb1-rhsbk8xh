// This file is deprecated - all LLM functionality moved to local WebLLM
// Keeping minimal structure for backward compatibility

export async function testGeminiApiKey(apiKey: string): Promise<boolean> {
  console.warn('Gemini API is deprecated. Please use Local LLM instead.');
  return false;
}

export async function getGeminiResponse(prompt: string, systemPrompt?: string): Promise<string> {
  console.warn('Gemini API is deprecated. Please use Local LLM instead.');
  throw new Error('Gemini API has been removed. Please use Local LLM for empathy assessment.');
}