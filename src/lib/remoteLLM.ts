import { EmpathyAnalysisResult, TestResult } from './types';

export interface RemoteLLMConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class RemoteLLM {
  private config: RemoteLLMConfig;
  private baseUrl: string;

  constructor(config: RemoteLLMConfig) {
    this.config = config;
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async assessEmpathy(responses: Record<string, string>): Promise<EmpathyAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/assess/empathy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          responses,
          model: this.config.model,
          temperature: this.config.temperature || 0.3,
          maxTokens: this.config.maxTokens || 1000,
          topP: this.config.topP || 1.0
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const analysis = await response.json();
      return this.validateAndNormalizeAnalysis(analysis);
    } catch (error) {
      console.error('Error in empathy assessment:', error);
      return this.fallbackAnalysis(responses);
    }
  }

  async testAgentBehavior(scenario: string, personalityPrompt?: string): Promise<TestResult> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/api/test/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          scenario,
          personalityPrompt,
          model: this.config.model,
          temperature: this.config.temperature || 0.7,
          maxTokens: this.config.maxTokens || 500
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        response: result.response,
        metrics: {
          ...result.metrics,
          responseTime
        }
      };
    } catch (error) {
      console.error('Error testing agent behavior:', error);
      return {
        response: 'Failed to generate response',
        metrics: {
          empathy: 0,
          coherence: 0,
          relevance: 0,
          responseTime: 0
        }
      };
    }
  }

  private validateAndNormalizeAnalysis(analysis: any): EmpathyAnalysisResult {
    return {
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
  }

  private fallbackAnalysis(responses: Record<string, string>): EmpathyAnalysisResult {
    return {
      empathyScore: 50,
      subscaleAnalysis: {
        NCE: 50,
        PCE: 50,
        NAE: 50,
        PAE: 50
      },
      reasoning: 'Fallback analysis due to API error. Please check your connection and try again.',
      confidence: 60
    };
  }
} 