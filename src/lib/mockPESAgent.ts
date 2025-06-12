import { PESItem, PESSession, PESScores } from './pesAgent';

const mockPESItems: PESItem[] = [
  {
    id: 1,
    question: "When someone is feeling sad, I can understand how they feel.",
    subscale: "PCE",
    reverse_scored: false,
    item_guidance: "Consider how well you can understand others' emotions."
  },
  {
    id: 2,
    question: "I find it difficult to understand why some things upset people so much.",
    subscale: "NCE",
    reverse_scored: true,
    item_guidance: "Think about situations where others' emotional reactions seem confusing."
  },
  {
    id: 3,
    question: "When someone is happy, I feel happy too.",
    subscale: "PAE",
    reverse_scored: false,
    item_guidance: "Reflect on how others' positive emotions affect you."
  },
  {
    id: 4,
    question: "I don't feel sad when I see someone crying.",
    subscale: "NAE",
    reverse_scored: true,
    item_guidance: "Consider your emotional response to others' distress."
  },
  {
    id: 5,
    question: "I can understand why someone might be angry, even if I don't feel angry myself.",
    subscale: "PCE",
    reverse_scored: false,
    item_guidance: "Think about your ability to understand others' perspectives."
  }
];

class MockPESAgentClient {
  private sessions: Map<string, PESSession> = new Map();
  private responses: Map<string, Record<number, number>> = new Map();

  async getPESItems(): Promise<PESItem[]> {
    return mockPESItems;
  }

  async startSession(agentId: string, config: any = {}): Promise<PESSession> {
    const session: PESSession = {
      id: `mock-session-${Date.now()}`,
      agent_id: agentId,
      user_id: 'mock-user',
      status: 'active',
      started_at: new Date().toISOString()
    };
    this.sessions.set(session.id, session);
    this.responses.set(session.id, {});
    return session;
  }

  async recordResponse(
    sessionId: string,
    itemId: number,
    responseValue: number,
    responseText?: string,
    responseTime?: number
  ): Promise<{ success: boolean }> {
    const sessionResponses = this.responses.get(sessionId) || {};
    sessionResponses[itemId] = responseValue;
    this.responses.set(sessionId, sessionResponses);
    return { success: true };
  }

  async calculateScores(sessionId: string): Promise<PESScores> {
    const responses = this.responses.get(sessionId) || {};
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Calculate subscale scores
    const subscaleScores = {
      NCE: 0,
      PCE: 0,
      NAE: 0,
      PAE: 0
    };

    let subscaleCounts = {
      NCE: 0,
      PCE: 0,
      NAE: 0,
      PAE: 0
    };

    mockPESItems.forEach(item => {
      const response = responses[item.id];
      if (response !== undefined) {
        const score = item.reverse_scored ? 6 - response : response;
        subscaleScores[item.subscale] += score;
        subscaleCounts[item.subscale]++;
      }
    });

    // Calculate average scores for each subscale
    const scores: PESScores = {
      nce_score: subscaleCounts.NCE ? subscaleScores.NCE / subscaleCounts.NCE : 0,
      pce_score: subscaleCounts.PCE ? subscaleScores.PCE / subscaleCounts.PCE : 0,
      nae_score: subscaleCounts.NAE ? subscaleScores.NAE / subscaleCounts.NAE : 0,
      pae_score: subscaleCounts.PAE ? subscaleScores.PAE / subscaleCounts.PAE : 0,
      total_score: 0
    };

    // Calculate total score
    scores.total_score = (scores.nce_score + scores.pce_score + scores.nae_score + scores.pae_score) / 4;

    // Update session
    session.scores = scores;
    session.status = 'completed';
    session.completed_at = new Date().toISOString();
    this.sessions.set(sessionId, session);

    return scores;
  }
}

export const mockPESAgentClient = new MockPESAgentClient(); 