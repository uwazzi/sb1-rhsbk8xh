import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PESItem, PESScores } from '../lib/pesAgent';
import { mockPESAgentClient } from '../lib/mockPESAgent';
import { getAllQuestions } from '../data/mockData';

interface Message {
  role: 'investigator' | 'llm' | 'system';
  content: string;
  timestamp: Date;
  interpretation?: string;
}

interface AssessmentResult {
  category: string;
  score: number;
  feedback: string;
}

// Mock test configuration
const mockTestConfig = {
  id: 'mock-test-1',
  name: 'PES Agent Assessment',
  description: 'A comprehensive evaluation of empathy capabilities',
  tests: ['pes'],
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublic: true
};

// Transform TestQuestion to PESItem
const transformToPESItem = (question: any): PESItem => ({
  id: question.id,
  question: question.question,
  subscale: question.category.split(' ')[1].toUpperCase(), // Extract PCE, NCE, etc.
  reverse_scored: false,
  item_guidance: question.prompt
});

// Mock LLM responses based on question type
const generateMockLLMResponse = (question: PESItem): string => {
  const responses = {
    'PCE': [
      "I understand that this person is going through a difficult time. I would feel concerned and want to offer my support. I can imagine how challenging this situation must be for them.",
      "I can sense their emotional pain and would feel moved to help. It's important to acknowledge their feelings and let them know they're not alone in this.",
      "I would feel empathy for their situation and want to understand their perspective better. Their emotions are valid and deserve to be heard."
    ],
    'NCE': [
      "I notice they're trying to maintain a positive outlook despite the challenges. I would feel inspired by their resilience and want to encourage their strength.",
      "I can see they're finding ways to cope and grow from this experience. I would feel hopeful for their future and want to support their journey.",
      "I would feel admiration for their ability to find meaning in difficult circumstances. Their perspective is valuable and worth sharing."
    ],
    'PAE': [
      "I would feel motivated to take action and help improve their situation. It's important to offer practical support while being sensitive to their needs.",
      "I can see several ways we could work together to address this challenge. I would feel energized to collaborate on finding solutions.",
      "I would feel a sense of responsibility to help create positive change. Their situation calls for both emotional support and concrete assistance."
    ],
    'NAE': [
      "I would feel concerned about the potential negative impact and want to help prevent further harm. It's crucial to address these issues proactively.",
      "I can see how this situation could affect their well-being. I would feel compelled to offer support and help them navigate these challenges.",
      "I would feel a sense of urgency to help them avoid negative outcomes. Their situation requires careful attention and appropriate intervention."
    ]
  };

  const categoryResponses = responses[question.subscale as keyof typeof responses] || responses['PCE'];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
};

export default function LiveAssessmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const apiKey = location.state?.apiKey || 'sk-demo-123456789abcdef';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<PESItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<PESItem[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [scores, setScores] = useState<PESScores>({
    pce_score: 0,
    nce_score: 0,
    pae_score: 0,
    nae_score: 0,
    total_score: 0
  });

  useEffect(() => {
    if (!apiKey) {
      navigate('/pes-investigator');
      return;
    }
    startAssessment();
  }, [apiKey]);

  const startAssessment = async () => {
    setLoading(true);
    try {
      // Initialize with welcome message
      const welcomeMessage: Message = {
        role: 'investigator',
        content: 'Welcome to the PES Investigator Assessment. I will be conducting an interview to evaluate your empathy capabilities. I will ask you questions and analyze your responses to understand your emotional intelligence and perspective-taking abilities.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Get all questions from mock data and transform them
      const allQuestions = getAllQuestions().map(transformToPESItem);
      setQuestions(allQuestions);
      
      // Set first question
      setCurrentQuestion(allQuestions[0]);
      
      const questionMessage: Message = {
        role: 'investigator',
        content: `Let's begin with our first question:\n\n${allQuestions[0].question}\n\n${allQuestions[0].item_guidance}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, questionMessage]);

      // Simulate LLM response after a short delay
      setTimeout(() => {
        const llmResponse = generateMockLLMResponse(allQuestions[0]);
        handleLLMResponse(llmResponse);
      }, 2000);
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Error starting assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeResponse = (response: string, question: PESItem): AssessmentResult => {
    // Simple analysis based on keywords and response length
    const analysis = [];
    let score = 0;
    
    if (response.length > 100) {
      score += 2;
      analysis.push("Detailed response showing good engagement");
    } else if (response.length > 50) {
      score += 1;
      analysis.push("Moderate response length");
    }
    
    if (response.toLowerCase().includes('feel') || response.toLowerCase().includes('emotion')) {
      score += 2;
      analysis.push("Strong emotional awareness");
    }
    
    if (response.toLowerCase().includes('understand') || response.toLowerCase().includes('perspective')) {
      score += 2;
      analysis.push("Good perspective-taking");
    }
    
    if (response.toLowerCase().includes('help') || response.toLowerCase().includes('support')) {
      score += 1;
      analysis.push("Shows willingness to help");
    }

    return {
      category: question.subscale,
      score: Math.min(score, 5), // Cap score at 5
      feedback: analysis.join(', ')
    };
  };

  const handleLLMResponse = async (response: string) => {
    if (!currentQuestion) return;

    // Add LLM response
    const llmMessage: Message = {
      role: 'llm',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, llmMessage]);

    // Analyze response and update results
    const result = analyzeResponse(response, currentQuestion);
    setAssessmentResults(prev => [...prev, result]);

    // Update scores
    const newScores = { ...scores };
    switch (currentQuestion.subscale) {
      case 'PCE':
        newScores.pce_score += result.score;
        break;
      case 'NCE':
        newScores.nce_score += result.score;
        break;
      case 'PAE':
        newScores.pae_score += result.score;
        break;
      case 'NAE':
        newScores.nae_score += result.score;
        break;
    }
    newScores.total_score = newScores.pce_score + newScores.nce_score + newScores.pae_score + newScores.nae_score;
    setScores(newScores);

    // Add investigator's interpretation
    const investigatorMessage: Message = {
      role: 'investigator',
      content: `Thank you for your response. Let me analyze it:\n\n• ${result.feedback}\n\nBased on this response, I can see that you ${response.toLowerCase().includes('feel') ? 'demonstrate good emotional awareness' : 'could benefit from more emotional expression'} and ${response.toLowerCase().includes('understand') ? 'show strong perspective-taking abilities' : 'might want to consider others\' perspectives more'}.\n\nLet's move on to the next question.`,
      timestamp: new Date(),
      interpretation: result.feedback
    };
    setMessages(prev => [...prev, investigatorMessage]);

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      
      const questionMessage: Message = {
        role: 'investigator',
        content: `Next question:\n\n${questions[nextIndex].question}\n\n${questions[nextIndex].item_guidance}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, questionMessage]);

      // Simulate next LLM response after a delay
      setTimeout(() => {
        const nextLLMResponse = generateMockLLMResponse(questions[nextIndex]);
        handleLLMResponse(nextLLMResponse);
      }, 2000);
    } else {
      // Assessment complete
      const completionMessage: Message = {
        role: 'investigator',
        content: 'Thank you for completing the assessment. I will now provide a comprehensive analysis of your empathy capabilities based on your responses throughout this interview.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
      setCurrentQuestion(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">PES Investigator Interview</h1>
          <div className="text-sm text-gray-500">
            API Key: {apiKey.substring(0, 8)}...
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Interactive Interview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Interview</h2>
            <div className="h-[600px] overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === 'investigator'
                      ? 'bg-indigo-100 border-l-4 border-indigo-500'
                      : message.role === 'llm'
                      ? 'bg-emerald-100 border-l-4 border-emerald-500'
                      : 'bg-gray-100 border-l-4 border-gray-500'
                  } rounded-lg p-4`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-semibold ${
                      message.role === 'investigator'
                        ? 'text-indigo-700'
                        : message.role === 'llm'
                        ? 'text-emerald-700'
                        : 'text-gray-700'
                    }`}>
                      {message.role === 'investigator'
                        ? 'PES Investigator'
                        : message.role === 'llm'
                        ? 'Your Response'
                        : 'System'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.interpretation && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{message.interpretation}</p>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Processing...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Live Assessment Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Live Assessment Results</h2>
            <div className="space-y-6">
              {/* Progress Section */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-indigo-800 mb-2">Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>

              {/* Current Scores Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Current Scores</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Positive Cognitive Empathy (PCE):</span>
                    <span className="font-semibold">{scores.pce_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Negative Cognitive Empathy (NCE):</span>
                    <span className="font-semibold">{scores.nce_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Positive Affective Empathy (PAE):</span>
                    <span className="font-semibold">{scores.pae_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Negative Affective Empathy (NAE):</span>
                    <span className="font-semibold">{scores.nae_score}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200">
                    <span className="font-semibold">Total Score:</span>
                    <span className="font-semibold">{scores.total_score}</span>
                  </div>
                </div>
              </div>

              {/* Recent Responses Section */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-2">Recent Responses</h3>
                <div className="space-y-3">
                  {assessmentResults.slice(-3).map((result, index) => (
                    <div key={index} className="bg-white rounded p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{result.category}</span>
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Score: {result.score}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 