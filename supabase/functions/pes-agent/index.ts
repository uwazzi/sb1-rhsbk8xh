import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface PESItem {
  id: number;
  question: string;
  subscale: 'NCE' | 'PCE' | 'NAE' | 'PAE';
  reverse_scored: boolean;
  item_guidance: string;
}

interface PESScores {
  nce_score: number;
  pce_score: number;
  nae_score: number;
  pae_score: number;
  total_score: number;
}

class PESInvestigatorAgent {
  private supabase;
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async startSession(agentId: string, userId: string, config: any = {}) {
    const { data: session, error } = await this.supabase
      .from('pes_test_sessions')
      .insert({
        agent_id: agentId,
        user_id: userId,
        session_config: config,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return session;
  }

  async getPESItems(): Promise<PESItem[]> {
    const { data: items, error } = await this.supabase
      .from('pes_items')
      .select('*')
      .order('id');

    if (error) throw error;
    return items;
  }

  async recordResponse(sessionId: string, itemId: number, responseValue: number, responseText?: string, responseTime?: number) {
    const { error } = await this.supabase
      .from('pes_responses')
      .insert({
        session_id: sessionId,
        item_id: itemId,
        response_value: responseValue,
        response_text: responseText,
        response_time_ms: responseTime
      });

    if (error) throw error;
  }

  async calculateScores(sessionId: string): Promise<PESScores> {
    // Get all responses for this session
    const { data: responses, error: responsesError } = await this.supabase
      .from('pes_responses')
      .select(`
        item_id,
        response_value,
        pes_items!inner(subscale, reverse_scored)
      `)
      .eq('session_id', sessionId);

    if (responsesError) throw responsesError;

    // Initialize subscale totals
    const subscaleTotals = {
      NCE: { sum: 0, count: 0 },
      PCE: { sum: 0, count: 0 },
      NAE: { sum: 0, count: 0 },
      PAE: { sum: 0, count: 0 }
    };

    // Calculate subscale scores
    responses.forEach(response => {
      const { subscale, reverse_scored } = response.pes_items;
      let score = response.response_value;
      
      // Apply reverse scoring if needed (6 - original_score for 5-point scale)
      if (reverse_scored) {
        score = 6 - score;
      }

      subscaleTotals[subscale].sum += score;
      subscaleTotals[subscale].count += 1;
    });

    // Calculate average scores for each subscale
    const nce_score = subscaleTotals.NCE.count > 0 ? subscaleTotals.NCE.sum / subscaleTotals.NCE.count : 0;
    const pce_score = subscaleTotals.PCE.count > 0 ? subscaleTotals.PCE.sum / subscaleTotals.PCE.count : 0;
    const nae_score = subscaleTotals.NAE.count > 0 ? subscaleTotals.NAE.sum / subscaleTotals.NAE.count : 0;
    const pae_score = subscaleTotals.PAE.count > 0 ? subscaleTotals.PAE.sum / subscaleTotals.PAE.count : 0;

    // Calculate total empathy score (average of all subscales)
    const total_score = (nce_score + pce_score + nae_score + pae_score) / 4;

    const scores = {
      nce_score: Math.round(nce_score * 100) / 100,
      pce_score: Math.round(pce_score * 100) / 100,
      nae_score: Math.round(nae_score * 100) / 100,
      pae_score: Math.round(pae_score * 100) / 100,
      total_score: Math.round(total_score * 100) / 100
    };

    // Update session with scores
    await this.supabase
      .from('pes_test_sessions')
      .update({
        ...scores,
        scores: scores,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return scores;
  }

  async getSessionResults(sessionId: string) {
    const { data: session, error } = await this.supabase
      .from('pes_test_sessions')
      .select(`
        *,
        agent_registry(name, model_type),
        pes_responses(
          item_id,
          response_value,
          response_text,
          response_time_ms,
          pes_items(question, subscale, reverse_scored)
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return session;
  }

  async registerAgent(name: string, modelType: string, config: any = {}) {
    const { data: agent, error } = await this.supabase
      .from('agent_registry')
      .insert({
        name,
        model_type: modelType,
        config
      })
      .select()
      .single();

    if (error) throw error;
    return agent;
  }

  async getAgentStats(agentId: string) {
    const { data: sessions, error } = await this.supabase
      .from('pes_test_sessions')
      .select('total_score, completed_at')
      .eq('agent_id', agentId)
      .eq('status', 'completed');

    if (error) throw error;

    const totalTests = sessions.length;
    const averageScore = totalTests > 0 
      ? sessions.reduce((sum, session) => sum + (session.total_score || 0), 0) / totalTests
      : 0;

    return {
      totalTests,
      averageScore: Math.round(averageScore * 100) / 100,
      sessions
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const agent = new PESInvestigatorAgent();

    switch (path) {
      case 'start-session': {
        const { agentId, userId, config } = await req.json();
        const session = await agent.startSession(agentId, userId, config);
        return new Response(JSON.stringify(session), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-items': {
        const items = await agent.getPESItems();
        return new Response(JSON.stringify(items), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'record-response': {
        const { sessionId, itemId, responseValue, responseText, responseTime } = await req.json();
        await agent.recordResponse(sessionId, itemId, responseValue, responseText, responseTime);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'calculate-scores': {
        const { sessionId } = await req.json();
        const scores = await agent.calculateScores(sessionId);
        return new Response(JSON.stringify(scores), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-results': {
        const sessionId = url.searchParams.get('sessionId');
        if (!sessionId) throw new Error('Session ID required');
        const results = await agent.getSessionResults(sessionId);
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'register-agent': {
        const { name, modelType, config } = await req.json();
        const agent_data = await agent.registerAgent(name, modelType, config);
        return new Response(JSON.stringify(agent_data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'agent-stats': {
        const agentId = url.searchParams.get('agentId');
        if (!agentId) throw new Error('Agent ID required');
        const stats = await agent.getAgentStats(agentId);
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    console.error('PES Agent Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});