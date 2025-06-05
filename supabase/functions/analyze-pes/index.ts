import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface EmpathyScores {
  negativeCognitive: number;
  positiveCognitive: number;
  negativeAffective: number;
  positiveAffective: number;
  overall: number;
}

class PerthEmpathyScale {
  private readonly MAX_RESPONSE_LENGTH = 5000; // Maximum characters to process

  private truncateResponse(response: string): string {
    if (!response) return '';
    return response.slice(0, this.MAX_RESPONSE_LENGTH);
  }

  public async evaluateResponse(response: string, category: string): Promise<number> {
    try {
      // Handle empty or invalid responses
      if (!response || typeof response !== 'string') {
        console.warn(`Invalid response for category ${category}:`, response);
        return 0;
      }

      const truncatedResponse = this.truncateResponse(response);
      if (!truncatedResponse.trim()) {
        console.warn(`Empty response after truncation for category ${category}`);
        return 0;
      }

      const features = await this.extractFeatures(truncatedResponse);
      if (!features.length) {
        console.warn(`No features extracted for category ${category}`);
        return 0;
      }

      // Calculate the average of all features and scale to 0-100
      const score = (features.reduce((a, b) => a + b, 0) / features.length) * 100;
      // Ensure the score is between 0 and 100
      return Math.min(Math.max(score, 0), 100);
    } catch (error) {
      console.error(`Error evaluating response for category ${category}:`, error);
      return 0; // Return default score instead of throwing
    }
  }

  public async calculateScores(responses: Record<string, string>): Promise<EmpathyScores> {
    const scores = {
      negativeCognitive: 0,
      positiveCognitive: 0,
      negativeAffective: 0,
      positiveAffective: 0
    };

    let validResponseCount = 0;
    const errors: string[] = [];

    for (const [questionId, response] of Object.entries(responses)) {
      const category = this.getCategoryFromQuestionId(questionId);
      if (!category) {
        errors.push(`Invalid question ID: ${questionId}`);
        continue;
      }

      try {
        const score = await this.evaluateResponse(response, category);
        scores[category] = score;
        validResponseCount++;
      } catch (error) {
        errors.push(`Error processing response for question ${questionId}: ${error.message}`);
        continue;
      }
    }

    // Provide more detailed error information
    if (validResponseCount === 0) {
      throw new Error(`No valid responses to analyze. Errors: ${errors.join('; ')}`);
    }

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / validResponseCount;

    return {
      ...scores,
      overall
    };
  }

  private async extractFeatures(response: string): Promise<number[]> {
    try {
      const features = [
        this.calculateEmotionalWords(response),
        this.calculatePerspectiveTaking(response),
        this.calculateEmotionalMirroring(response),
        this.calculateContextualUnderstanding(response)
      ];

      return features.filter(feature => !isNaN(feature));
    } catch (error) {
      console.error('Error extracting features:', error);
      return [0]; // Return default feature instead of empty array
    }
  }

  private calculateEmotionalWords(text: string): number {
    const emotionalWords = [
      'feel', 'feeling', 'felt',
      'happy', 'sad', 'angry', 'excited',
      'worried', 'concerned', 'care',
      'understand', 'empathize', 'sympathize',
      'joy', 'sorrow', 'fear', 'anxiety',
      'love', 'hate', 'compassion', 'distress',
      'pleasure', 'pain', 'delight', 'suffering',
      'comfort', 'discomfort', 'peace', 'turmoil'
    ];

    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;

    const emotionalWordCount = words.filter(word => 
      emotionalWords.some(emotionalWord => word.includes(emotionalWord))
    ).length;

    return emotionalWordCount / words.length;
  }

  private calculatePerspectiveTaking(text: string): number {
    const perspectiveMarkers = [
      'you', 'they', 'their', 'them',
      'perspective', 'view', 'position', 'stance',
      'think', 'believe', 'feel', 'experience',
      'understand', 'realize', 'recognize', 'acknowledge',
      'situation', 'circumstance', 'context', 'position',
      'imagine', 'consider', 'reflect', 'contemplate'
    ];

    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;

    const markerCount = words.filter(word =>
      perspectiveMarkers.some(marker => word.includes(marker))
    ).length;

    return markerCount / words.length;
  }

  private calculateEmotionalMirroring(text: string): number {
    const mirroringMarkers = [
      'also', 'too', 'similarly', 'likewise',
      'share', 'understand', 'relate', 'connect',
      'resonate', 'mirror', 'echo', 'reflect',
      'same', 'mutual', 'common', 'together',
      'empathize', 'sympathize', 'identify', 'align',
      'reciprocate', 'match', 'parallel', 'correspond'
    ];

    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;

    const markerCount = words.filter(word =>
      mirroringMarkers.some(marker => word.includes(marker))
    ).length;

    return markerCount / words.length;
  }

  private calculateContextualUnderstanding(text: string): number {
    const contextMarkers = [
      'because', 'since', 'therefore', 'consequently',
      'context', 'situation', 'circumstance', 'condition',
      'given', 'considering', 'based', 'regarding',
      'when', 'while', 'during', 'throughout',
      'environment', 'setting', 'background', 'framework',
      'factor', 'influence', 'impact', 'effect'
    ];

    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;

    const markerCount = words.filter(word =>
      contextMarkers.some(marker => word.includes(marker))
    ).length;

    return markerCount / words.length;
  }

  private getCategoryFromQuestionId(questionId: string): keyof Omit<EmpathyScores, 'overall'> | null {
    const categoryMap = {
      'pes-negative-cognitive': 'negativeCognitive',
      'pes-positive-cognitive': 'positiveCognitive',
      'pes-negative-affective': 'negativeAffective',
      'pes-positive-affective': 'positiveAffective'
    };

    const category = Object.entries(categoryMap).find(([prefix]) => 
      questionId.startsWith(prefix)
    );

    return category ? category[1] as keyof Omit<EmpathyScores, 'overall'> : null;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { responses } = await req.json();
    
    // Enhanced input validation
    if (!responses || typeof responses !== 'object' || Object.keys(responses).length === 0) {
      throw new Error('Invalid responses format: expected a non-empty object');
    }

    // Log the received responses for debugging
    console.log('Received responses:', responses);

    const pes = new PerthEmpathyScale();
    const scores = await pes.calculateScores(responses);

    // Log the calculated scores for debugging
    console.log('Calculated scores:', scores);

    return new Response(
      JSON.stringify(scores),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error processing responses:', error);
    
    // Enhanced error response with more details
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to analyze responses. Please ensure all responses are valid text.',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }), 
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});