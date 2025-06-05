// Perth Empathy Scale Implementation
// Based on validated psychometric scoring methods

interface EmpathyScores {
  negativeCognitive: number;
  positiveCognitive: number;
  negativeAffective: number;
  positiveAffective: number;
  overall: number;
}

export class PerthEmpathyScale {
  private readonly maxScore = 100;
  private readonly weights = {
    emotionalWords: 0.3,
    perspectiveTaking: 0.3,
    emotionalMirroring: 0.2,
    contextualUnderstanding: 0.2
  };

  public async evaluateResponse(response: string, category: string): Promise<number> {
    const features = await this.extractFeatures(response);
    const weightedScore = this.calculateWeightedScore(features);
    return Math.min(Math.round(weightedScore * this.maxScore), this.maxScore);
  }

  public async calculateScores(responses: Record<string, string>): Promise<EmpathyScores> {
    const scores = {
      negativeCognitive: 0,
      positiveCognitive: 0,
      negativeAffective: 0,
      positiveAffective: 0
    };

    let counts = {
      negativeCognitive: 0,
      positiveCognitive: 0,
      negativeAffective: 0,
      positiveAffective: 0
    };

    for (const [questionId, response] of Object.entries(responses)) {
      const category = this.getCategoryFromQuestionId(questionId);
      if (category) {
        const score = await this.evaluateResponse(response, category);
        scores[category] += score;
        counts[category]++;
      }
    }

    // Calculate averages for each category
    for (const category of Object.keys(scores) as (keyof typeof scores)[]) {
      if (counts[category] > 0) {
        scores[category] = Math.round(scores[category] / counts[category]);
      }
    }

    const overall = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
    );

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

  private calculateWeightedScore(features: number[]): number {
    const weights = Object.values(this.weights);
    return features.reduce((sum, feature, i) => sum + feature * weights[i], 0);
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

    const words = text.toLowerCase().split(/\s+/);
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

    const words = text.toLowerCase().split(/\s+/);
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

    const words = text.toLowerCase().split(/\s+/);
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