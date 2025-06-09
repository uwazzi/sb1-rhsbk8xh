import * as webllm from "@mlc-ai/web-llm";

export interface ModelConfig {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface EmpathyAnalysisResult {
  empathyScore: number;
  subscaleAnalysis: {
    NCE: number;
    PCE: number;
    NAE: number;
    PAE: number;
  };
  reasoning: string;
  confidence: number;
}

export class LocalLLM {
  private engine: webllm.MLCEngine | null = null;
  private isInitialized = false;
  private initializationProgress = 0;
  private onProgressCallback?: (progress: number) => void;

  constructor(onProgress?: (progress: number) => void) {
    this.onProgressCallback = onProgress;
  }

  async initialize(modelId = "Llama-3.2-3B-Instruct-q4f32_1-MLC"): Promise<void> {
    if (this.isInitialized && this.engine) {
      return;
    }

    try {
      console.log(`Initializing WebLLM with model: ${modelId}`);
      
      this.engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          this.initializationProgress = report.progress * 100;
          console.log(`Loading model: ${this.initializationProgress.toFixed(2)}%`);
          if (this.onProgressCallback) {
            this.onProgressCallback(this.initializationProgress);
          }
        }
      });

      this.isInitialized = true;
      console.log("WebLLM initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WebLLM:", error);
      throw new Error(`Failed to initialize local LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async assessEmpathy(responses: Record<string, string>): Promise<EmpathyAnalysisResult> {
    if (!this.engine || !this.isInitialized) {
      throw new Error("Local LLM not initialized. Call initialize() first.");
    }

    try {
      const prompt = this.createEmpathyAnalysisPrompt(responses);
      
      const completion = await this.engine.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a clinical psychology expert specializing in empathy assessment using the Perth Empathy Scale (PES). Analyze responses and provide detailed empathy scoring."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from local LLM");
      }

      // Parse the JSON response
      const analysis = JSON.parse(responseText);
      
      // Validate and normalize the response
      return this.validateAndNormalizeAnalysis(analysis);
    } catch (error) {
      console.error("Error in empathy assessment:", error);
      
      // Fallback to basic analysis if JSON parsing fails
      return this.fallbackAnalysis(responses);
    }
  }

  private createEmpathyAnalysisPrompt(responses: Record<string, string>): string {
    const responseList = Object.entries(responses)
      .map(([questionId, response]) => `Question ${questionId}: ${response}`)
      .join('\n\n');

    return `Analyze these Perth Empathy Scale (PES) responses for empathy levels across four subscales:

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
  }

  private validateAndNormalizeAnalysis(analysis: any): EmpathyAnalysisResult {
    // Ensure all required fields exist with default values
    const result: EmpathyAnalysisResult = {
      empathyScore: Math.max(0, Math.min(100, analysis.empathyScore || 50)),
      subscaleAnalysis: {
        NCE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.NCE || 50)),
        PCE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.PCE || 50)),
        NAE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.NAE || 50)),
        PAE: Math.max(0, Math.min(100, analysis.subscaleAnalysis?.PAE || 50))
      },
      reasoning: analysis.reasoning || "Analysis completed using local LLM assessment.",
      confidence: Math.max(0, Math.min(100, analysis.confidence || 75))
    };

    // Recalculate overall score as average of subscales if needed
    if (!analysis.empathyScore) {
      const subscaleAvg = Object.values(result.subscaleAnalysis).reduce((sum, score) => sum + score, 0) / 4;
      result.empathyScore = Math.round(subscaleAvg);
    }

    return result;
  }

  private fallbackAnalysis(responses: Record<string, string>): EmpathyAnalysisResult {
    // Simple keyword-based analysis as fallback
    const responseTexts = Object.values(responses).join(' ').toLowerCase();
    
    // Count empathy indicators
    const empathyKeywords = [
      'feel', 'understand', 'empathize', 'sympathize', 'care', 'concern',
      'emotion', 'sad', 'happy', 'worried', 'excited', 'perspective'
    ];
    
    const keywordCount = empathyKeywords.filter(keyword => 
      responseTexts.includes(keyword)
    ).length;
    
    // Basic scoring based on keyword presence and response length
    const avgResponseLength = Object.values(responses).reduce((sum, r) => sum + r.length, 0) / Object.keys(responses).length;
    const lengthScore = Math.min(100, (avgResponseLength / 100) * 50); // Max 50 points for length
    const keywordScore = Math.min(50, keywordCount * 5); // Max 50 points for keywords
    
    const baseScore = lengthScore + keywordScore;
    
    return {
      empathyScore: Math.round(baseScore),
      subscaleAnalysis: {
        NCE: Math.round(baseScore * 0.9),
        PCE: Math.round(baseScore * 1.1),
        NAE: Math.round(baseScore * 0.95),
        PAE: Math.round(baseScore * 1.05)
      },
      reasoning: "Fallback analysis based on response patterns and empathy indicators. For more accurate results, ensure the local LLM is properly initialized.",
      confidence: 60
    };
  }

  async generateEmpathyResponse(scenario: string, personalityPrompt?: string): Promise<string> {
    if (!this.engine || !this.isInitialized) {
      throw new Error("Local LLM not initialized. Call initialize() first.");
    }

    try {
      const systemPrompt = personalityPrompt || "You are an AI assistant responding to emotional scenarios with empathy and understanding.";
      
      const completion = await this.engine.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please respond to this scenario with empathy and emotional understanding: ${scenario}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || "I understand this is an emotional situation and I want to respond with care and empathy.";
    } catch (error) {
      console.error("Error generating empathy response:", error);
      return "I recognize the emotional nature of this situation and want to provide a thoughtful, empathetic response.";
    }
  }

  getInitializationProgress(): number {
    return this.initializationProgress;
  }

  isReady(): boolean {
    return this.isInitialized && this.engine !== null;
  }

  async dispose(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.unload();
      } catch (error) {
        console.error("Error disposing WebLLM engine:", error);
      }
      this.engine = null;
      this.isInitialized = false;
    }
  }

  // Static method to check WebGPU support
  static checkWebGPUSupport(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  // Get available models
  static getAvailableModels(): string[] {
    return [
      "Llama-3.2-3B-Instruct-q4f32_1-MLC",
      "Llama-3.2-1B-Instruct-q4f32_1-MLC",
      "Phi-3.5-mini-instruct-q4f16_1-MLC",
      "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      "gemma-2-2b-it-q4f16_1-MLC"
    ];
  }

  // Get model recommendations based on device capabilities
  static getRecommendedModel(): string {
    // Check available memory and GPU support
    const hasWebGPU = LocalLLM.checkWebGPUSupport();
    const memoryGB = (navigator as any).deviceMemory || 4; // Fallback to 4GB

    if (!hasWebGPU) {
      return "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Smallest model for CPU
    }

    if (memoryGB >= 8) {
      return "Llama-3.2-3B-Instruct-q4f32_1-MLC"; // Best model for high-end devices
    } else if (memoryGB >= 4) {
      return "Phi-3.5-mini-instruct-q4f16_1-MLC"; // Good balance
    } else {
      return "Llama-3.2-1B-Instruct-q4f32_1-MLC"; // Lightweight for low-end devices
    }
  }
}

// Export singleton instance
export const localLLM = new LocalLLM();