export interface PESItem {
  id: number;
  question: string;
  subscale: string;
  reverse_scored: boolean;
  item_guidance: string;
}

export interface PESSession {
  id: string;
  agent_id: string;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface PESScores {
  nce_score: number;
  pce_score: number;
  nae_score: number;
  pae_score: number;
  total_score: number;
} 