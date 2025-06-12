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

export interface TestResult {
  response: string;
  metrics: {
    empathy: number;
    coherence: number;
    relevance: number;
    responseTime: number;
  };
}

export interface AgentTestConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  personalityPrompt?: string;
}

export interface AgentTestSession {
  id: string;
  agentId: string;
  userId: string;
  status: 'active' | 'completed' | 'failed';
  config: AgentTestConfig;
  results: TestResult[];
  createdAt: string;
  updatedAt: string;
} 