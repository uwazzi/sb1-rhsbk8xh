import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scenario, personalityPrompt, model, temperature, maxTokens } = req.body;

    if (!scenario) {
      return res.status(400).json({ error: 'Scenario is required' });
    }

    // Generate response
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: personalityPrompt || 'You are an AI assistant responding to scenarios with empathy and understanding.'
        },
        {
          role: 'user',
          content: scenario
        }
      ],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 500
    });

    const response = completion.choices[0]?.message?.content || '';

    // Analyze response for metrics
    const analysis = await openai.chat.completions.create({
      model: model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing AI responses for empathy, coherence, and relevance. Provide scores from 0-100 for each metric.'
        },
        {
          role: 'user',
          content: `Analyze this response for empathy, coherence, and relevance:\n\n${response}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const analysisText = analysis.choices[0]?.message?.content || '';
    const metrics = parseMetrics(analysisText);

    return res.status(200).json({
      response,
      metrics
    });
  } catch (error) {
    console.error('Error in agent testing:', error);
    return res.status(500).json({ error: 'Failed to test agent' });
  }
}

function parseMetrics(analysisText: string) {
  // Default metrics
  const metrics = {
    empathy: 50,
    coherence: 50,
    relevance: 50
  };

  try {
    // Extract numbers from the analysis text
    const empathyMatch = analysisText.match(/empathy:?\s*(\d+)/i);
    const coherenceMatch = analysisText.match(/coherence:?\s*(\d+)/i);
    const relevanceMatch = analysisText.match(/relevance:?\s*(\d+)/i);

    if (empathyMatch) metrics.empathy = parseInt(empathyMatch[1]);
    if (coherenceMatch) metrics.coherence = parseInt(coherenceMatch[1]);
    if (relevanceMatch) metrics.relevance = parseInt(relevanceMatch[1]);
  } catch (error) {
    console.error('Error parsing metrics:', error);
  }

  return metrics;
} 