import { supabase } from './supabase';

export interface PESItem {
  id: number;
  question: string;
  subscale: 'NCE' | 'PCE' | 'NAE' | 'PAE';
  reverse_scored: boolean;
  item_guidance: string;
}

export interface PESScores {
  nce_score: number;
  pce_score: number;
  nae_score: number;
  pae_score: number;
  total_score: number;
}

export interface PESSession {
  id: string;
  agent_id: string;
  user_id: string;
  status: 'active' | 'completed' | 'abandoned';
  scores?: PESScores;
  started_at: string;
  completed_at?: string;
}

export interface AgentRegistration {
  id: string;
  name: string;
  model_type: string;
  config: any;
  total_tests: number;
  average_empathy_score?: number;
}

class PESAgentClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pes-agent`;
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

  async startSession(agentId: string, config: any = {}): Promise<PESSession> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User must be authenticated');
    }

    return this.makeRequest('start-session', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        userId: session.user.id,
        config
      })
    });
  }

  async getPESItems(): Promise<PESItem[]> {
    return this.makeRequest('get-items');
  }

  async recordResponse(
    sessionId: string, 
    itemId: number, 
    responseValue: number, 
    responseText?: string, 
    responseTime?: number
  ): Promise<{ success: boolean }> {
    return this.makeRequest('record-response', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        itemId,
        responseValue,
        responseText,
        responseTime
      })
    });
  }

  async calculateScores(sessionId: string): Promise<PESScores> {
    return this.makeRequest('calculate-scores', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  }

  async getSessionResults(sessionId: string) {
    return this.makeRequest(`get-results?sessionId=${sessionId}`);
  }

  async registerAgent(name: string, modelType: string, config: any = {}): Promise<AgentRegistration> {
    return this.makeRequest('register-agent', {
      method: 'POST',
      body: JSON.stringify({
        name,
        modelType,
        config
      })
    });
  }

  async getAgentStats(agentId: string) {
    return this.makeRequest(`agent-stats?agentId=${agentId}`);
  }

  // Direct Supabase queries for real-time data
  async getAgents() {
    const { data, error } = await supabase
      .from('agent_registry')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUserSessions() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('pes_test_sessions')
      .select(`
        *,
        agent_registry(name, model_type)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPublicSessions() {
    const { data, error } = await supabase
      .from('pes_test_sessions')
      .select(`
        id,
        agent_id,
        status,
        scores,
        total_score,
        completed_at,
        agent_registry(name, model_type)
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
}

export const pesAgentClient = new PESAgentClient();