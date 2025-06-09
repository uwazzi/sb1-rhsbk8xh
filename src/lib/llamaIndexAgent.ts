import { supabase } from './supabase';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface EmpathyAnalysis {
  emotionalRecognition: number;
  perspectiveTaking: number;
  emotionalMirroring: number;
  contextualUnderstanding: number;
  subscale: string;
  reverseScored: boolean;
  empathyScore: number;
  rawResponse: string;
  processingTime: number;
}

export interface LlamaIndexSession {
  sessionId: string;
  agentId: string;
  currentItemIndex: number;
  conversationHistory: ConversationMessage[];
  responses: Record<number, any>;
  status: 'active' | 'completed' | 'error';
}

class LlamaIndexAgentClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llamaindex-pes-agent`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async initializeAgent(sessionId: string, agentId: string, modelConfig: any = {}): Promise<LlamaIndexSession> {
    return this.makeRequest('initialize', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        agentId,
        modelConfig: {
          temperature: 0.7,
          maxTokens: 1000,
          model: 'gpt-4',
          ...modelConfig
        }
      })
    });
  }

  async processConversationTurn(sessionId: string, userMessage: string, aiResponse: string) {
    return this.makeRequest('process-turn', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        userMessage,
        aiResponse
      })
    });
  }

  async getNextScenario(sessionId: string): Promise<{ scenario: string }> {
    return this.makeRequest('next-scenario', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  async getConversationHistory(sessionId: string): Promise<{ history: ConversationMessage[] }> {
    return this.makeRequest(`get-history?sessionId=${sessionId}`);
  }

  async completeAssessment(sessionId: string) {
    return this.makeRequest('complete', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  // Real-time conversation streaming (for live updates)
  async subscribeToConversation(sessionId: string, callback: (message: ConversationMessage) => void) {
    const channel = supabase
      .channel(`conversation-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pes_test_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          const sessionConfig = payload.new.session_config;
          if (sessionConfig?.conversation_history) {
            const latestMessage = sessionConfig.conversation_history[sessionConfig.conversation_history.length - 1];
            if (latestMessage) {
              callback(latestMessage);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const llamaIndexAgentClient = new LlamaIndexAgentClient();