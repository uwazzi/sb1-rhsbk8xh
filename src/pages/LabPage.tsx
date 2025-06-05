import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, MessageSquare, Bot, Loader2, ArrowRight } from 'lucide-react';
import { mockConfigurations, pesQuestions } from '../data/mockData';
import { getGeminiResponse } from '../lib/gemini';
import { supabase } from '../lib/supabase';

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

  useEffect(() => {
    if (id) {
      const foundTest = mockConfigurations.find(t => t.id === id);
      if (foundTest) setTest(foundTest);
    }
    startAssessment();
  }, [id]);

  const startAssessment = async () => {
    const initialMessage: AgentMessage = {
      role: 'agent',
      content: 'Hello! I\'m your empathy assessment agent. I\'ll be evaluating your emotional intelligence and empathetic capabilities through a series of scenarios. Let\'s begin with the first question.',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    await askQuestion();
  };

  const analyzeResponse = async (response: string, questionId: string) => {
    try {
      const { data: analysis, error: functionError } = await supabase.functions.invoke('analyze-pes', {
        body: { responses: { [questionId]: response } }
      });

      if (functionError) {
        console.warn('Edge function error:', functionError);
        // Fallback to default scoring if the edge function fails
        return DEFAULT_SCORES;
      }

      return analysis;
    } catch (error) {
      console.error('Failed to analyze response:', error);
      // Fallback to default scoring on any error
      return DEFAULT_SCORES;
    }
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
      const response = await getGeminiResponse(question.prompt);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid h-screen grid-cols-2">
        {/* Left Panel - Conversation */}
        <div className="flex h-screen flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <Brain className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Empathy Assessment Lab</h2>
                <p className="text-sm text-slate-500">Testing emotional intelligence capabilities</p>
              </div>
            </div>
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
                        {message.role === 'agent' ? 'Assessment Agent' : 'AI Response'}
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
                  <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="text-center text-sm text-slate-500">
              Question {currentQuestion + 1} of {pesQuestions.length}
            </div>
          </div>
        </div>

        {/* Right Panel - Analysis */}
        <div className="flex h-screen flex-col bg-slate-50 p-6">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Real-time Analysis</h2>

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
              </div>
            </div>
          )}

          {!scores && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600">
                  Assessment will begin once the first response is processed...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabPage;