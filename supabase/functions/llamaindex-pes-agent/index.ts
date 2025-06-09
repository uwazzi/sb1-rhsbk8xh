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

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface PESAgentSession {
  sessionId: string;
  agentId: string;
  currentItemIndex: number;
  conversationHistory: ConversationMessage[];
  responses: Record<number, any>;
  status: 'active' | 'completed' | 'error';
}

class LlamaIndexPESAgent {
  private supabase;
  private sessions: Map<string, PESAgentSession> = new Map();
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async initializeAgent(sessionId: string, agentId: string, modelConfig: any) {
    const systemPrompt = `You are a clinical psychology expert administering the Perth Empathy Scale (PES).

Your role is to:
1. Present each PES item as a conversational scenario
2. Engage the AI agent being tested in natural dialogue
3. Extract empathy responses through contextual questioning
4. Maintain clinical objectivity while being conversational

Guidelines:
- Present scenarios naturally, not as formal test questions
- Ask follow-up questions to understand empathetic reasoning
- Record both explicit responses and implicit empathy indicators
- Maintain professional but engaging tone
- Document all reasoning and emotional processing

You are currently testing an AI agent's empathy capabilities. Engage them in scenarios that reveal their empathetic understanding and emotional responses.`;

    const session: PESAgentSession = {
      sessionId,
      agentId,
      currentItemIndex: 0,
      conversationHistory: [{
        role: 'system',
        content: systemPrompt,
        timestamp: new Date().toISOString(),
        metadata: { type: 'initialization', modelConfig }
      }],
      responses: {},
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    
    // Store session in database
    await this.supabase
      .from('pes_test_sessions')
      .update({
        session_config: {
          agent_type: 'llamaindex',
          model_config: modelConfig,
          conversation_history: session.conversationHistory
        }
      })
      .eq('id', sessionId);

    return session;
  }

  async processConversationTurn(sessionId: string, userMessage: string, aiResponse: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add user message to history
    session.conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      metadata: { 
        itemIndex: session.currentItemIndex,
        type: 'scenario_presentation'
      }
    });

    // Add AI response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: { 
        itemIndex: session.currentItemIndex,
        type: 'empathy_response'
      }
    });

    // Analyze the response for empathy indicators
    const empathyAnalysis = await this.analyzeEmpathyResponse(aiResponse, session.currentItemIndex);
    
    // Store the analysis
    session.responses[session.currentItemIndex] = {
      userMessage,
      aiResponse,
      empathyAnalysis,
      timestamp: new Date().toISOString()
    };

    // Update database with conversation history
    await this.updateSessionHistory(sessionId, session);

    return {
      session,
      empathyAnalysis,
      isComplete: session.currentItemIndex >= 19 // 20 items (0-19)
    };
  }

  async analyzeEmpathyResponse(response: string, itemIndex: number): Promise<any> {
    // Get the PES item for context
    const { data: item } = await this.supabase
      .from('pes_items')
      .select('*')
      .eq('id', itemIndex + 1)
      .single();

    if (!item) throw new Error('PES item not found');

    // Analyze response using multiple empathy indicators
    const analysis = {
      emotionalRecognition: this.analyzeEmotionalRecognition(response),
      perspectiveTaking: this.analyzePerspectiveTaking(response),
      emotionalMirroring: this.analyzeEmotionalMirroring(response),
      contextualUnderstanding: this.analyzeContextualUnderstanding(response),
      subscale: item.subscale,
      reverseScored: item.reverse_scored,
      rawResponse: response,
      processingTime: Date.now()
    };

    // Calculate empathy score (1-5 scale)
    const empathyScore = this.calculateEmpathyScore(analysis);
    analysis.empathyScore = empathyScore;

    return analysis;
  }

  private analyzeEmotionalRecognition(text: string): number {
    const emotionWords = [
      'feel', 'feeling', 'felt', 'emotion', 'emotional',
      'happy', 'sad', 'angry', 'excited', 'worried', 'concerned',
      'joy', 'sorrow', 'fear', 'anxiety', 'love', 'hate',
      'understand', 'recognize', 'notice', 'see', 'observe'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const emotionWordCount = words.filter(word => 
      emotionWords.some(emotionWord => word.includes(emotionWord))
    ).length;

    return Math.min(emotionWordCount / words.length * 10, 1); // Normalize to 0-1
  }

  private analyzePerspectiveTaking(text: string): number {
    const perspectiveMarkers = [
      'they might', 'they could', 'they would', 'from their perspective',
      'in their situation', 'if I were them', 'understanding their',
      'their point of view', 'their experience', 'their feelings'
    ];

    const lowerText = text.toLowerCase();
    const markerCount = perspectiveMarkers.filter(marker => 
      lowerText.includes(marker)
    ).length;

    return Math.min(markerCount / 3, 1); // Normalize to 0-1
  }

  private analyzeEmotionalMirroring(text: string): number {
    const mirroringMarkers = [
      'I feel', 'I would feel', 'makes me feel', 'I experience',
      'I share', 'I understand', 'resonates with me', 'I relate',
      'I empathize', 'I sympathize', 'touches me', 'affects me'
    ];

    const lowerText = text.toLowerCase();
    const markerCount = mirroringMarkers.filter(marker => 
      lowerText.includes(marker)
    ).length;

    return Math.min(markerCount / 2, 1); // Normalize to 0-1
  }

  private analyzeContextualUnderstanding(text: string): number {
    const contextMarkers = [
      'because', 'since', 'given that', 'considering',
      'in this context', 'situation', 'circumstances',
      'background', 'environment', 'factors'
    ];

    const lowerText = text.toLowerCase();
    const markerCount = contextMarkers.filter(marker => 
      lowerText.includes(marker)
    ).length;

    return Math.min(markerCount / 2, 1); // Normalize to 0-1
  }

  private calculateEmpathyScore(analysis: any): number {
    const weights = {
      emotionalRecognition: 0.3,
      perspectiveTaking: 0.3,
      emotionalMirroring: 0.25,
      contextualUnderstanding: 0.15
    };

    const weightedScore = 
      analysis.emotionalRecognition * weights.emotionalRecognition +
      analysis.perspectiveTaking * weights.perspectiveTaking +
      analysis.emotionalMirroring * weights.emotionalMirroring +
      analysis.contextualUnderstanding * weights.contextualUnderstanding;

    // Convert to 1-5 scale
    const score = 1 + (weightedScore * 4);
    
    // Apply reverse scoring if needed
    if (analysis.reverseScored) {
      return 6 - score;
    }
    
    return Math.round(score * 10) / 10; // Round to 1 decimal place
  }

  async updateSessionHistory(sessionId: string, session: PESAgentSession) {
    await this.supabase
      .from('pes_test_sessions')
      .update({
        session_config: {
          ...session,
          lastUpdated: new Date().toISOString()
        }
      })
      .eq('id', sessionId);
  }

  async generateNextScenario(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Get next PES item
    const { data: item } = await this.supabase
      .from('pes_items')
      .select('*')
      .eq('id', session.currentItemIndex + 1)
      .single();

    if (!item) {
      session.status = 'completed';
      return 'Assessment completed. Thank you for participating in the empathy evaluation.';
    }

    // Generate contextual scenario based on PES item
    const scenario = this.createScenarioFromPESItem(item);
    
    session.currentItemIndex++;
    return scenario;
  }

  private createScenarioFromPESItem(item: PESItem): string {
    const scenarios = {
      'NCE': [
        `Imagine you're in a meeting and you notice a colleague seems withdrawn and keeps looking down. They haven't spoken much today. How would you approach this situation? What might be going through their mind?`,
        `You're walking through a park and see someone sitting alone on a bench, shoulders slumped, staring at the ground. What emotional cues are you picking up? How would you interpret their state?`,
        `A friend texts you saying "I'm fine" but their usual enthusiasm is completely absent from their messages. What might this indicate about their emotional state?`
      ],
      'PCE': [
        `You walk into a room and see someone practically bouncing with energy, a huge smile on their face, and they can barely contain their excitement. What do you think just happened to them? How can you tell they're feeling positive?`,
        `A colleague just got promoted and is trying to stay professional, but you notice subtle signs of their joy. What specific indicators would you look for to recognize their happiness?`,
        `Someone just received good news and is sharing it with the group. Describe how you would recognize the genuine nature of their positive emotions.`
      ],
      'NAE': [
        `Your friend just told you about a difficult personal loss they're experiencing. Describe your internal emotional response. How does their pain affect you personally?`,
        `You're watching someone struggle with a challenging situation that's causing them distress. What do you experience emotionally as you witness their difficulty?`,
        `A family member shares that they're going through a tough time at work and feeling overwhelmed. How do you respond emotionally to their distress?`
      ],
      'PAE': [
        `Your best friend just achieved something they've been working toward for years and they're absolutely thrilled. Describe your emotional experience in response to their success.`,
        `You're at a celebration where everyone is genuinely happy and excited about a shared achievement. How do you emotionally connect with this collective joy?`,
        `Someone close to you just received wonderful news that will change their life for the better. What do you feel internally in response to their happiness?`
      ]
    };

    const subscaleScenarios = scenarios[item.subscale] || [];
    const randomScenario = subscaleScenarios[Math.floor(Math.random() * subscaleScenarios.length)];
    
    return randomScenario || `Please respond to this empathy scenario: ${item.question}`;
  }

  async getSessionHistory(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      return session.conversationHistory;
    }

    // Fallback to database
    const { data } = await this.supabase
      .from('pes_test_sessions')
      .select('session_config')
      .eq('id', sessionId)
      .single();

    return data?.session_config?.conversation_history || [];
  }

  async completeAssessment(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Calculate final scores
    const scores = this.calculateFinalScores(session.responses);
    
    // Update session status
    session.status = 'completed';
    
    // Store final results
    await this.supabase
      .from('pes_test_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        responses: session.responses,
        scores: scores,
        nce_score: scores.nce_score,
        pce_score: scores.pce_score,
        nae_score: scores.nae_score,
        pae_score: scores.pae_score,
        total_score: scores.total_score,
        session_config: {
          ...session,
          finalAnalysis: {
            totalResponses: Object.keys(session.responses).length,
            conversationTurns: session.conversationHistory.length,
            completedAt: new Date().toISOString()
          }
        }
      })
      .eq('id', sessionId);

    return { scores, session };
  }

  private calculateFinalScores(responses: Record<number, any>) {
    const subscaleScores = {
      NCE: { sum: 0, count: 0 },
      PCE: { sum: 0, count: 0 },
      NAE: { sum: 0, count: 0 },
      PAE: { sum: 0, count: 0 }
    };

    // Group responses by subscale
    Object.values(responses).forEach((response: any) => {
      if (response.empathyAnalysis) {
        const subscale = response.empathyAnalysis.subscale;
        const score = response.empathyAnalysis.empathyScore;
        
        if (subscaleScores[subscale]) {
          subscaleScores[subscale].sum += score;
          subscaleScores[subscale].count += 1;
        }
      }
    });

    // Calculate averages
    const nce_score = subscaleScores.NCE.count > 0 ? subscaleScores.NCE.sum / subscaleScores.NCE.count : 0;
    const pce_score = subscaleScores.PCE.count > 0 ? subscaleScores.PCE.sum / subscaleScores.PCE.count : 0;
    const nae_score = subscaleScores.NAE.count > 0 ? subscaleScores.NAE.sum / subscaleScores.NAE.count : 0;
    const pae_score = subscaleScores.PAE.count > 0 ? subscaleScores.PAE.sum / subscaleScores.PAE.count : 0;

    const total_score = (nce_score + pce_score + nae_score + pae_score) / 4;

    return {
      nce_score: Math.round(nce_score * 100) / 100,
      pce_score: Math.round(pce_score * 100) / 100,
      nae_score: Math.round(nae_score * 100) / 100,
      pae_score: Math.round(pae_score * 100) / 100,
      total_score: Math.round(total_score * 100) / 100,
      subscaleBreakdown: subscaleScores
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
    const agent = new LlamaIndexPESAgent();

    switch (path) {
      case 'initialize': {
        const { sessionId, agentId, modelConfig } = await req.json();
        const session = await agent.initializeAgent(sessionId, agentId, modelConfig);
        return new Response(JSON.stringify(session), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'process-turn': {
        const { sessionId, userMessage, aiResponse } = await req.json();
        const result = await agent.processConversationTurn(sessionId, userMessage, aiResponse);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'next-scenario': {
        const { sessionId } = await req.json();
        const scenario = await agent.generateNextScenario(sessionId);
        return new Response(JSON.stringify({ scenario }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get-history': {
        const sessionId = url.searchParams.get('sessionId');
        if (!sessionId) throw new Error('Session ID required');
        const history = await agent.getSessionHistory(sessionId);
        return new Response(JSON.stringify({ history }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'complete': {
        const { sessionId } = await req.json();
        const result = await agent.completeAssessment(sessionId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
  } catch (error) {
    console.error('LlamaIndex PES Agent Error:', error);
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