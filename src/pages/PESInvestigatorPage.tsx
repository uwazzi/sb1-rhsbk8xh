import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PESItem, PESScores } from '../lib/pesAgent';
import { mockPESAgentClient } from '../lib/mockPESAgent';

interface Message {
  role: 'pes_agent' | 'llm' | 'system';
  content: string;
}

export default function PESInvestigatorPage() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('sk-demo-123456789abcdef');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<PESScores>({
    pce_score: 0,
    nce_score: 0,
    pae_score: 0,
    nae_score: 0,
    total_score: 0
  });
  const [currentQuestions, setCurrentQuestions] = useState<PESItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const simulateLLMResponse = async (question: PESItem): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a response based on the question type
    const responses = {
      pce: [
        "I understand how they must be feeling in this situation.",
        "I can see things from their perspective.",
        "I can imagine what they're going through."
      ],
      nce: [
        "I recognize that this is a difficult situation for them.",
        "I can see why they might be feeling this way.",
        "I understand the challenges they're facing."
      ],
      pae: [
        "I feel happy for their success.",
        "I'm glad they're doing well.",
        "I share in their joy."
      ],
      nae: [
        "I feel concerned about their situation.",
        "I'm sorry they're going through this.",
        "I empathize with their feelings."
      ]
    };

    const subscale = question.subscale.toLowerCase();
    const responseList = responses[subscale as keyof typeof responses] || responses.pce;
    return responseList[Math.floor(Math.random() * responseList.length)];
  };

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      // Navigate to LiveAssessmentPage with the API key
      navigate('/remote-agent-testing', { state: { apiKey } });
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Error starting assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex >= currentQuestions.length - 1) {
      // Assessment complete
      const completionMessage: Message = {
        role: 'pes_agent',
        content: 'Thank you for completing the assessment. I will now analyze your responses and provide a detailed evaluation of your empathy capabilities.'
      };
      setMessages(prev => [...prev, completionMessage]);
      setShowResults(true);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    const nextQuestion = currentQuestions[nextIndex];
    
    // Add LLM response (simulated)
    const llmResponse = await simulateLLMResponse(nextQuestion);
    const llmMessage: Message = {
      role: 'llm',
      content: llmResponse
    };
    
    // Add PES Agent's evaluation
    const evaluationMessage: Message = {
      role: 'pes_agent',
      content: `Based on your response, I've evaluated your empathy indicators:\n\n` +
        `• Cognitive Empathy Assessment:
  - Understanding of emotional context: ${llmResponse.includes('understand') ? 'Strong' : 'Moderate'}
  - Perspective-taking ability: ${llmResponse.includes('perspective') ? 'Strong' : 'Moderate'}
  - Emotional recognition: ${llmResponse.includes('emotion') ? 'Strong' : 'Moderate'}

• Affective Empathy Assessment:
  - Emotional resonance: ${llmResponse.includes('feel') ? 'Strong' : 'Moderate'}
  - Appropriate response: ${llmResponse.includes('support') ? 'Strong' : 'Moderate'}
  - Emotional validation: ${llmResponse.includes('important') ? 'Strong' : 'Moderate'}

• Overall Assessment:
  - The response demonstrates ${llmResponse.length > 100 ? 'strong' : 'moderate'} emotional intelligence
  - Shows ${llmResponse.includes('different') ? 'good' : 'moderate'} understanding of individual differences
  - Provides ${llmResponse.includes('support') ? 'appropriate' : 'basic'} emotional support

Moving to the next question...`
    };
    
    // Add next question
    const questionMessage: Message = {
      role: 'pes_agent',
      content: nextQuestion.question
    };

    setMessages(prev => [...prev, llmMessage, evaluationMessage, questionMessage]);
    setCurrentQuestionIndex(nextIndex);
  };

  // Add useEffect to handle automatic progression
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'llm') {
        const timer = setTimeout(() => {
          handleNextQuestion();
        }, 2000); // Wait 2 seconds before next question
        return () => clearTimeout(timer);
      }
    }
  }, [messages, loading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">PES Investigator</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">Remote LLM Empathy Assessment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Evaluate the empathy capabilities of any LLM through our automated assessment system. 
              Our PES Agent will conduct a comprehensive evaluation of the LLM's cognitive and affective empathy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LLM Assessment Card */}
            <div className="lg:col-span-2 bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">LLM Assessment</h3>
              <p className="text-gray-700 mb-6">
                Connect your LLM API to begin the automated assessment. Our PES Agent will:
              </p>
              <ul className="space-y-3 text-gray-700 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Conduct a structured interview with your LLM
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Evaluate responses using established empathy metrics
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Provide real-time scoring and analysis
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Generate detailed assessment report
                </li>
              </ul>
              <div className="bg-white rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-2">LLM API Configuration</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your API key for the LLM service you want to test (e.g., OpenAI, Gemini, Anthropic)
                </p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your LLM API key"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApiKeySubmit}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Starting...' : 'Start Assessment'}
                  </button>
                </div>
              </div>
            </div>

            {/* About PES Agent Card */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">About PES Agent</h3>
              <p className="text-gray-700 mb-6">
                Our PES Agent is an AI-powered assessor trained to evaluate LLM empathy using the Psychological Empathy Scale (PES).
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Assessment Methodology</h4>
                  <p className="text-gray-700">
                    The PES Agent evaluates both cognitive and affective empathy through structured interactions and response analysis.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Evaluation Criteria</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Positive Cognitive Empathy (PCE)</li>
                    <li>Negative Cognitive Empathy (NCE)</li>
                    <li>Positive Affective Empathy (PAE)</li>
                    <li>Negative Affective Empathy (NAE)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Real-time Analysis</h4>
                  <p className="text-gray-700">
                    The PES Agent provides immediate feedback and scoring as it interacts with your LLM, ensuring a transparent assessment process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Process Section */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">Assessment Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Initial Setup</h4>
                  <p className="text-sm text-gray-600">Connect your LLM API and configure assessment parameters</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Structured Interview</h4>
                  <p className="text-sm text-gray-600">PES Agent conducts a series of empathy-focused questions</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Analysis & Report</h4>
                  <p className="text-sm text-gray-600">Comprehensive evaluation with detailed metrics and insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-6">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Automated Evaluation</h4>
                <p className="text-gray-600 text-sm">
                  Streamlined assessment process with real-time scoring and analysis.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Real-time Analysis</h4>
                <p className="text-gray-600 text-sm">
                  Immediate feedback and scoring as the assessment progresses.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Detailed Metrics</h4>
                <p className="text-gray-600 text-sm">
                  Comprehensive evaluation of cognitive and affective empathy.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-800 mb-2">Comprehensive Report</h4>
                <p className="text-gray-600 text-sm">
                  Detailed assessment report with visualizations and recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}