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
    const truncatedResponse = this.truncateResponse(response);
    const features = await this.extractFeatures(truncatedResponse);
    // Calculate the average of all features and scale to 0-100
    const score = (features.reduce((a, b) => a + b, 0) / features.length) * 100;
    // Ensure the score is between 0 and 100
    return Math.min(Math.max(score, 0), 100);
  }

  public async calculateScores(responses: Record<string, string>): Promise<EmpathyScores> {
    const scores = {
      negativeCognitive: 0,
      positiveCognitive: 0,
      negativeAffective: 0,
      positiveAffective: 0
    };

    for (const [questionId, response] of Object.entries(responses)) {
      const category = this.getCategoryFromQuestionId(questionId);
      if (category) {
        scores[category] = await this.evaluateResponse(response, category);
      }
    }

    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / 4;

    return {
      ...scores,
      overall
    };
  }

  private async extractFeatures(response: string): Promise<number[]> {
    const features = [
      this.calculateEmotionalWords(response),
      this.calculatePerspectiveTaking(response),
      this.calculateEmotionalMirroring(response),
      this.calculateContextualUnderstanding(response)
    ];

    return features;
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
    
    // Validate responses object
    if (!responses || typeof responses !== 'object') {
      throw new Error('Invalid responses format');
    }

    const pes = new PerthEmpathyScale();
    const scores = await pes.calculateScores(responses);

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
    return new Response(
      JSON.stringify({ error: error.message }), 
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