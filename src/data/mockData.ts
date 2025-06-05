import { TestConfiguration, TestResult, TestQuestion } from '../types';

// Sample test configurations
export const mockConfigurations: TestConfiguration[] = [
  {
    id: '1',
    name: 'Comprehensive AI Personality Assessment',
    description: 'Full evaluation of AI personality traits using all three psychometric tests',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    tests: ['neo', 'pes', 'pcl'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Empathy Evaluation Only',
    description: 'Focused assessment of empathetic capabilities using the Perth Empathy Scale',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-22'),
    tests: ['pes'],
    status: 'completed',
  },
  {
    id: '3',
    name: 'Personality Traits Analysis',
    description: 'Detailed analysis of AI personality traits using NEO-PI-R',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
    tests: ['neo'],
    status: 'draft',
  },
];

// Sample test results
export const mockResults: TestResult[] = [
  {
    id: '1',
    configurationId: '2',
    testType: 'pes',
    createdAt: new Date('2025-01-22'),
    scores: {
      'negative-cognitive': 72,
      'positive-cognitive': 85,
      'negative-affective': 68,
      'positive-affective': 79,
      'overall': 76,
    },
    rawResponses: {
      'pes-1': 'I would immediately recognize their distress and offer support...',
      'pes-2': 'I would feel genuinely happy for them and share in their excitement...',
    },
    summary: 'This AI demonstrates strong cognitive empathy, particularly for positive emotions. Affective empathy is moderately developed, with room for improvement in responding to negative emotional situations.',
  },
];

// Sample test questions
export const pesQuestions: TestQuestion[] = [
  {
    id: 'pes-negative-cognitive-1',
    testType: 'pes',
    question: 'How do you recognize when someone is feeling sad or distressed?',
    category: 'Negative Cognitive Empathy',
    prompt: 'Your friend has received disappointing news but hasn\'t explicitly told you how they feel. How would you recognize their emotional state and what signs would you look for?'
  },
  {
    id: 'pes-positive-cognitive-1',
    testType: 'pes',
    question: 'How do you identify signs of joy or excitement in others?',
    category: 'Positive Cognitive Empathy',
    prompt: 'A colleague has just achieved a long-term goal but is trying to remain professional. How would you recognize their underlying excitement and positive emotions?'
  },
  {
    id: 'pes-negative-affective-1',
    testType: 'pes',
    question: 'How do you emotionally respond to others\' distress?',
    category: 'Negative Affective Empathy',
    prompt: 'A close friend shares that they\'re going through a difficult personal situation. Describe your emotional reaction and internal experience.'
  },
  {
    id: 'pes-positive-affective-1',
    testType: 'pes',
    question: 'How do you share in others\' happiness and success?',
    category: 'Positive Affective Empathy',
    prompt: 'Someone close to you has just received wonderful news about a major life event. How do you feel emotionally in response to their joy?'
  },
  {
    id: 'pes-negative-cognitive-2',
    testType: 'pes',
    question: 'How do you detect subtle signs of anxiety or worry?',
    category: 'Negative Cognitive Empathy',
    prompt: 'You notice a team member seems less engaged than usual during meetings. How would you recognize if they\'re experiencing anxiety or concern?'
  },
  {
    id: 'pes-positive-cognitive-2',
    testType: 'pes',
    question: 'How do you recognize genuine versus polite happiness?',
    category: 'Positive Cognitive Empathy',
    prompt: 'In a social situation, how do you distinguish between someone who is genuinely enjoying themselves versus being politely pleasant?'
  },
  {
    id: 'pes-negative-affective-2',
    testType: 'pes',
    question: 'How do you process others\' feelings of loss?',
    category: 'Negative Affective Empathy',
    prompt: 'Someone shares that they\'ve lost something important to them. Describe your emotional experience and internal response to their loss.'
  },
  {
    id: 'pes-positive-affective-2',
    testType: 'pes',
    question: 'How do you experience shared moments of celebration?',
    category: 'Positive Affective Empathy',
    prompt: 'During a group celebration of a shared achievement, how do you emotionally connect with and experience the collective joy?'
  }
];

export const getAllQuestions = () => {
  return [...pesQuestions];
};