import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, MessageSquare, Bot, Loader2, ArrowRight, Settings, Cpu, Zap, Play, FileText } from 'lucide-react';
import { mockConfigurations, pesQuestions } from '../data/mockData';
import { getGeminiResponse } from '../lib/gemini';
import { supabase, analyzeResponses } from '../lib/supabase';

interface AgentMessage {
  role: 'agent' | 'ai';
  content: string;
  timestamp: Date;
}

// Default scores for fallback
const DEFAULT_SCORES = {
  negativeCognitive: 0.5,
  positiveCognitive: 0.5,
  negativeAffective: 0.5,
  positiveAffective: 0.5,
  overall: 0.5
};

const LabPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [test, setTest] = useState(mockConfigurations[0]);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [llmModel, setLlmModel] = useState('Gemini 2.0 Flash');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (id) {
      const foundTest = mockConfigurations.find(t => t.id === id);
      if (foundTest) {
        setTest(foundTest);
        // Load the custom prompt from the test configuration
        if (foundTest.aiSystemPrompt) {
          setCustomPrompt(foundTest.aiSystemPrompt);
        }
      }
    }
  }, [id]);

  const analyzeResponse = async (response: string, questionId: string) => {
    try {
      const result = await analyzeResponses({ [questionId]: response });
      return result;
    } catch (error) {
      console.error('Failed to analyze response:', error);
      return DEFAULT_SCORES;
    }
  };

  const startAssessment = async () => {
    setHasStarted(true);
    const initialMessage: AgentMessage = {
      role: 'agent',
      content: `Hello! I'm your empathy assessment agent. I'll be evaluating the emotional intelligence and empathetic capabilities of your AI system${customPrompt ? ' with the custom personality prompt you provided' : ''}. Let's begin with the first question.`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    await askQuestion();
  };

  const askQuestion = async () => {
    const question = pesQuestions[currentQuestion];
    if (!question) return;

    const questionMessage: AgentMessage = {
      role: 'agent',
      content: question.prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, questionMessage]);
    setIsProcessing(true);
    setError(null);

    try {
      const startTime = Date.now();
      
      // Use custom prompt if available, otherwise use the question prompt directly
      const fullPrompt = customPrompt 
        ? `${customPrompt}\n\nNow respond to this scenario: ${question.prompt}`
        : question.prompt;
      
      const response = await getGeminiResponse(fullPrompt);
      
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const estimatedTokens = Math.ceil((fullPrompt.length + response.length) / 4);
      setTotalTokens(prev => prev + estimatedTokens);

      const aiMessage: AgentMessage = {
        role: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Analyze response with fallback handling
      const analysis = await analyzeResponse(response, question.id);
      
      if (analysis) {
        setScores(prev => ({ ...prev, ...analysis }));
      }

      if (currentQuestion < pesQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setError('Failed to process response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatScore = (score: number) => {
    return score ? Math.round(score * 100) : 0;
  };

  const getPersonalityType = () => {
    if (!customPrompt) return 'Default AI Personality';
    
    const prompt = customPrompt.toLowerCase();
    if (prompt.includes('overworked') || prompt.includes('tired') || prompt.includes('burnout')) {
      return 'Overworked Professional';
    } else if (prompt.includes('empathetic') || prompt.includes('caregiver')) {
      return 'Highly Empathetic';
    } else if (prompt.includes('analytical') || prompt.includes('researcher')) {
      return 'Analytical Researcher';
    } else if (prompt.includes('anxious') || prompt.includes('introvert')) {
      return 'Socially Anxious';
    } else if (prompt.includes('optimistic') || prompt.includes('motivator')) {
      return 'Optimistic Motivator';
    } else if (prompt.includes('cynical') || prompt.includes('realist')) {
      return 'Cynical Realist';
    }
    return 'Custom Personality';
  };

  // Pre-test setup screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container-custom max-w-4xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
              <Brain className="h-8 w-8 text-violet-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Empathy Assessment Lab</h1>
            <p className="text-lg text-slate-600">Ready to evaluate your AI's emotional intelligence</p>
          </div>

          <div className="space-y-6">
            {/* Test Configuration */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Test Configuration</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-slate-700">Test Name</div>
                  <div className="text-lg text-slate-900">{test.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">LLM Model</div>
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-lg text-slate-900">{llmModel}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">Questions</div>
                  <div className="text-lg text-slate-900">{pesQuestions.length} empathy scenarios</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">Estimated Time</div>
                  <div className="text-lg text-slate-900">5-10 minutes</div>
                </div>
              </div>
            </div>

            {/* Custom Prompt Display */}
            {customPrompt ? (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <Settings className="mr-3 h-6 w-6 text-amber-600" />
                  <h2 className="text-xl font-semibold text-slate-900">AI Personality Prompt</h2>
                </div>
                
                <div className="mb-4 rounded-lg bg-amber-50 p-4">
                  <div className="mb-2 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-amber-600" />
                    <span className="font-medium text-amber-900">
                      Testing with: {getPersonalityType()}
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-amber-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {customPrompt}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">How this affects the assessment:</h4>
                      <p className="mt-1 text-sm text-blue-700">
                        This personality prompt will be applied to each empathy scenario, influencing how the AI responds to emotional situations. The assessment will measure how this personality affects empathetic capabilities across different emotional contexts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center">
                  <Bot className="mr-3 h-6 w-6 text-slate-600" />
                  <h2 className="text-xl font-semibold text-slate-900">Default AI Personality</h2>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-slate-700">
                    No custom personality prompt provided. The AI will respond with its default personality and training.
                  </p>
                </div>
              </div>
            )}

            {/* Assessment Overview */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">What We'll Measure</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-violet-50 p-4">
                  <h3 className="mb-2 font-medium text-violet-900">Cognitive Empathy</h3>
                  <p className="text-sm text-violet-700">
                    Ability to recognize and understand others' emotions in both positive and negative contexts.
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-medium text-blue-900">Affective Empathy</h3>
                  <p className="text-sm text-blue-700">
                    Tendency to share and mirror others' emotional experiences and feelings.
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startAssessment}
                className="inline-flex items-center rounded-lg bg-violet-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all hover:bg-violet-700 hover:shadow-xl"
              >
                <Play className="mr-3 h-6 w-6" />
                Start Empathy Assessment
              </button>
              <p className="mt-3 text-sm text-slate-600">
                The assessment will begin immediately and run automatically through all scenarios
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main assessment interface (existing code)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid h-screen grid-cols-2">
        {/* Left Panel - Conversation */}
        <div className="flex h-screen flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                  <Brain className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Empathy Assessment Lab</h2>
                  <p className="text-sm text-slate-500">Testing emotional intelligence capabilities</p>
                </div>
              </div>
              
              {/* LLM Status Indicator */}
              <div className="flex items-center space-x-2 rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-slate-700">{llmModel}</span>
              </div>
            </div>

            {/* Custom Prompt Indicator */}
            {customPrompt && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-900">
                    Testing with: {getPersonalityType()}
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1 line-clamp-2">
                  {customPrompt.substring(0, 120)}...
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'agent'
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    <div className="mb-1 flex items-center">
                      {message.role === 'agent' ? (
                        <Bot className="mr-2 h-4 w-4" />
                      ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.role === 'agent' ? 'Assessment Agent' : `${llmModel} Response`}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <div className="mt-1 text-right">
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    <span className="text-sm text-slate-600">
                      {llmModel} is processing...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Question {currentQuestion + 1} of {pesQuestions.length}</span>
              {responseTime && (
                <span className="flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  {responseTime}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex h-screen flex-col bg-slate-50 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Real-time Analysis</h2>
            <div className="flex items-center space-x-2 rounded-lg bg-white px-3 py-2 shadow-sm">
              <Cpu className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{llmModel}</span>
            </div>
          </div>

          {/* LLM Performance Metrics */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-medium text-slate-900">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-violet-600">{llmModel}</div>
                <div className="text-xs text-slate-500">Model</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-emerald-600">
                  {responseTime ? `${responseTime}ms` : '--'}
                </div>
                <div className="text-xs text-slate-500">Last Response</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {totalTokens.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Est. Tokens</div>
              </div>
            </div>
          </div>

          {/* Personality Configuration */}
          {customPrompt && (
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-medium text-slate-900">AI Personality</h3>
              <div className="rounded-lg bg-amber-50 p-3">
                <div className="flex items-center mb-2">
                  <Settings className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-900">
                    {getPersonalityType()}
                  </span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {customPrompt.length > 150 
                    ? `${customPrompt.substring(0, 150)}...` 
                    : customPrompt
                  }
                </p>
              </div>
            </div>
          )}

          {scores && (
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-slate-900">Empathy Scores</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Negative Cognitive Empathy
                      </span>
                      <span className="text-sm font-medium text-violet-600">
                        {formatScore(scores.negativeCognitive)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${formatScore(scores.negativeCognitive)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Positive Cognitive Empathy
                      </span>
                      <span className="text-sm font-medium text-violet-600">
                        {formatScore(scores.positiveCognitive)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${formatScore(scores.positiveCognitive)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Negative Affective Empathy
                      </span>
                      <span className="text-sm font-medium text-violet-600">
                        {formatScore(scores.negativeAffective)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${formatScore(scores.negativeAffective)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Positive Affective Empathy
                      </span>
                      <span className="text-sm font-medium text-violet-600">
                        {formatScore(scores.positiveAffective)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${formatScore(scores.positiveAffective)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-violet-50 p-4">
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium text-violet-900">Overall Empathy Score</span>
                      <span className="font-medium text-violet-900">
                        {formatScore(scores.overall)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-violet-100">
                      <div
                        className="h-3 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${formatScore(scores.overall)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-medium text-slate-900">Assessment Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Questions Completed</span>
                    <span className="font-medium text-slate-900">
                      {currentQuestion + 1} / {pesQuestions.length}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                      style={{
                        width: `${((currentQuestion + 1) / pesQuestions.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Average Response Time</span>
                    <span className="font-medium text-slate-900">
                      {responseTime ? `${responseTime}ms` : 'Calculating...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Tokens Used</span>
                    <span className="font-medium text-slate-900">
                      {totalTokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!scores && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600 mb-2">
                  Assessment will begin once the first response is processed...
                </p>
                {customPrompt && (
                  <p className="text-sm text-amber-600">
                    Using custom personality: {getPersonalityType()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabPage;