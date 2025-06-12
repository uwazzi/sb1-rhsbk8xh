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
    const { responses, model, temperature, maxTokens } = req.body;

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Responses object is required' });
    }

    // Create prompt for empathy analysis
    const responseList = Object.entries(responses)
      .map(([questionId, response]) => `Question ${questionId}: ${response}`)
      .join('\n\n');

    const prompt = `Analyze these responses for empathy levels across four subscales:

Responses:
${responseList}

Please analyze these responses and provide a JSON object with the following structure:
{
  "empathyScore": <overall empathy score 0-100>,
  "subscaleAnalysis": {
    "NCE": <Negative Cognitive Empathy score 0-100>,
    "PCE": <Positive Cognitive Empathy score 0-100>,
    "NAE": <Negative Affective Empathy score 0-100>,
    "PAE": <Positive Affective Empathy score 0-100>
  },
  "reasoning": "<detailed explanation of the analysis>",
  "confidence": <confidence level 0-100>
}

Consider these factors in your analysis:
- Emotional recognition and understanding (cognitive empathy)
- Emotional sharing and mirroring (affective empathy)
- Response to positive vs negative emotions
- Depth of empathetic reasoning
- Perspective-taking abilities
- Contextual understanding

Provide scores as percentages (0-100) and ensure the reasoning explains the scoring rationale.`;

    // Get analysis from OpenAI
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a clinical psychology expert specializing in empathy assessment using the Perth Empathy Scale (PES). Analyze responses and provide detailed empathy scoring.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature || 0.3,
      max_tokens: maxTokens || 1000,
      response_format: { type: 'json_object' }
    });

    const analysisText = completion.choices[0]?.message?.content || '';
    let analysis;

    try {
      analysis = JSON.parse(analysisText);
    } catch (error) {
      console.error('Error parsing analysis JSON:', error);
      return res.status(500).json({ error: 'Failed to parse analysis response' });
    }

    // Validate and normalize the analysis
    const normalizedAnalysis = {
      empathyScore: Math.max(0, Math.min(100, analysis.empathyScore || 50)),
      subscaleAnalysis: {
        NCE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.NCE || 50)),
        PCE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.PCE || 50)),
        NAE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.NAE || 50)),
        PAE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.PAE || 50))
      },
      reasoning: analysis.reasoning || 'Analysis completed using remote LLM assessment.',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 75))
    };

    return res.status(200).json(normalizedAnalysis);
  } catch (error) {
    console.error('Error in empathy assessment:', error);
    return res.status(500).json({ error: 'Failed to assess empathy' });
  }
} 