import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  return window.localStorage.getItem('VITE_GEMINI_API_KEY') || '';
};

export async function testGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Explain how AI works in a few words"
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Invalid API key');
    }

    return true;
  } catch (error) {
    console.error('Error testing Gemini API key:', error);
    return false;
  }
}

export async function getGeminiResponse(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Prepare the prompt with system context if provided
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw new Error('Failed to get response from Gemini');
  }
}