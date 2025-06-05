// TODO: Refactor to remove FastFCP dependency and replace with alternative logic if needed.
// import { FastFCP } from 'fastfcp';

interface EmpathyScores {
  negativeCognitive: number;
  positiveCognitive: number;
  negativeAffective: number;
  positiveAffective: number;
  overall: number;
}

export class PerthEmpathyScale {
  // private fcp: FastFCP;

  constructor() {
    // this.fcp = new FastFCP({
    //   dimensions: ['negativeCognitive', 'positiveCognitive', 'negativeAffective', 'positiveAffective'],
    //   scalingFactor: 100,
    //   smoothingParameter: 0.5
    // });
  }

  public async evaluateResponse(response: string, category: string): Promise<number> {
    const features = await this.extractFeatures(response);
    // TODO: Replace with actual evaluation logic
    return 0;
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
    // Implement feature extraction based on linguistic markers
    const features = [
      this.calculateEmotionalWords(response),
      this.calculatePerspectiveTaking(response),
      this.calculateEmotionalMirroring(response),
      this.calculateContextualUnderstanding(response)
    ];

    return features;
  }

  private calculateEmotionalWords(text: string): number {
    // Simple emotional word detection
    const emotionalWords = [
      'feel', 'feeling', 'felt',
      'happy', 'sad', 'angry', 'excited',
      'worried', 'concerned', 'care',
      'understand', 'empathize', 'sympathize'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const emotionalWordCount = words.filter(word => 
      emotionalWords.some(emotionalWord => word.includes(emotionalWord))
    ).length;

    return emotionalWordCount / words.length;
  }

  private calculatePerspectiveTaking(text: string): number {
    // Detect perspective-taking language
    const perspectiveMarkers = [
      'you', 'they', 'their',
      'perspective', 'view', 'position',
      'think', 'believe', 'feel'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const markerCount = words.filter(word =>
      perspectiveMarkers.some(marker => word.includes(marker))
    ).length;

    return markerCount / words.length;
  }

  private calculateEmotionalMirroring(text: string): number {
    // Detect emotional mirroring and resonance
    const mirroringMarkers = [
      'also', 'too', 'similarly',
      'share', 'understand', 'relate',
      'resonate', 'connect', 'mirror'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const markerCount = words.filter(word =>
      mirroringMarkers.some(marker => word.includes(marker))
    ).length;

    return markerCount / words.length;
  }

  private calculateContextualUnderstanding(text: string): number {
    // Assess contextual understanding
    const contextMarkers = [
      'because', 'since', 'therefore',
      'context', 'situation', 'circumstance',
      'given', 'considering', 'based'
    ];

    const words = text.toLowerCase().split(/\s+/);
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

export const perthEmpathyScale = new PerthEmpathyScale();