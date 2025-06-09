import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageSquare, Bot, User, Clock, BarChart3, Eye, EyeOff, Zap, Activity } from 'lucide-react';
import { llamaIndexAgentClient, ConversationMessage, LlamaIndexSession } from '../../lib/llamaIndexAgent';
import { getGeminiResponse } from '../../lib/gemini';

interface LlamaIndexAssessmentProps {
  agentId: string;
  onComplete: (sessionId: string, scores: any) => void;
  onCancel: () => void;
}

const LlamaIndexAssessment: React.FC<LlamaIndexAssessmentProps> = ({ agentId, onComplete, onCancel }) => {
  const [session, setSession] = useState<LlamaIndexSession | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initializeAssessment();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeAssessment = async () => {
    try {
      setLoading(true);
      
      // Create PES session first
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.user) {
        throw new Error('User must be authenticated');
      }

      // Create session in database
      const { data: pesSession, error: sessionError } = await supabase
        .from('pes_test_sessions')
        .insert({
          agent_id: agentId,
          user_id: authSession.user.id,
          status: 'active',
          session_config: { agent_type: 'llamaindex' }
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Initialize LlamaIndex agent
      const llamaSession = await llamaIndexAgentClient.initializeAgent(
        pesSession.id,
        agentId,
        {
          temperature: 0.7,
          maxTokens: 1000,
          model: 'gemini-pro'
        }
      );

      setSession(llamaSession);
      setConversationHistory(llamaSession.conversationHistory);

      // Subscribe to real-time updates
      const unsubscribe = await llamaIndexAgentClient.subscribeToConversation(
        pesSession.id,
        (message) => {
          setConversationHistory(prev => {
            const exists = prev.some(m => m.timestamp === message.timestamp);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        }
      );
      unsubscribeRef.current = unsubscribe;

      // Get first scenario
      await getNextScenario(pesSession.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize assessment');
    } finally {
      setLoading(false);
    }
  };

  const getNextScenario = async (sessionId: string) => {
    try {
      const { scenario } = await llamaIndexAgentClient.getNextScenario(sessionId);
      setCurrentScenario(scenario);
      
      // Add scenario to conversation history
      const scenarioMessage: ConversationMessage = {
        role: 'user',
        content: scenario,
        timestamp: new Date().toISOString(),
        metadata: { type: 'scenario' }
      };
      
      setConversationHistory(prev => [...prev, scenarioMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get next scenario');
    }
  };

  const handleAIResponse = async () => {
    if (!session || !currentScenario || !aiResponse.trim()) return;

    try {
      setIsProcessing(true);

      // Get AI response using Gemini
      const enhancedResponse = await getGeminiResponse(
        `Scenario: ${currentScenario}\n\nPlease provide a detailed empathetic response that demonstrates your understanding and emotional processing of this situation.`,
        aiResponse
      );

      // Add AI response to conversation
      const responseMessage: ConversationMessage = {
        role: 'assistant',
        content: enhancedResponse,
        timestamp: new Date().toISOString(),
        metadata: { type: 'empathy_response', userInput: aiResponse }
      };

      setConversationHistory(prev => [...prev, responseMessage]);

      // Process the conversation turn
      const result = await llamaIndexAgentClient.processConversationTurn(
        session.sessionId,
        currentScenario,
        enhancedResponse
      );

      // Update real-time analysis
      setRealTimeAnalysis(result.empathyAnalysis);
      setProgress(((session.currentItemIndex + 1) / 20) * 100);

      // Clear current response
      setAiResponse('');

      // Check if assessment is complete
      if (result.isComplete) {
        await completeAssessment();
      } else {
        // Get next scenario
        await getNextScenario(session.sessionId);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process response');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeAssessment = async () => {
    if (!session) return;

    try {
      const result = await llamaIndexAgentClient.completeAssessment(session.sessionId);
      onComplete(session.sessionId, result.scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
    }
  };

  const getMessageIcon = (role: string, type?: string) => {
    switch (role) {
      case 'system':
        return <Brain className="h-4 w-4 text-violet-600" />;
      case 'user':
        return type === 'scenario' ? <MessageSquare className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-slate-600" />;
      case 'assistant':
        return <Bot className="h-4 w-4 text-green-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  const getMessageBgColor = (role: string, type?: string) => {
    switch (role) {
      case 'system':
        return 'bg-violet-50 border-violet-200';
      case 'user':
        return type === 'scenario' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200';
      case 'assistant':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
          <p className="mt-4 text-slate-600">Initializing LlamaIndex PES Agent...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Brain className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Assessment Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <button
                onClick={initializeAssessment}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      {/* Conversation Panel */}
      <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-violet-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">LlamaIndex PES Agent</h3>
              <p className="text-sm text-slate-600">Automated Empathy Assessment</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-slate-600">
              Progress: {Math.round(progress)}%
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-slate-400 hover:text-slate-600"
            >
              {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-violet-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationHistory
            .filter(msg => msg.role !== 'system' || showHistory)
            .map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getMessageBgColor(message.role, message.metadata?.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(message.role, message.metadata?.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-900">
                      {message.role === 'system' ? 'System' :
                       message.role === 'user' ? (message.metadata?.type === 'scenario' ? 'PES Scenario' : 'User') :
                       'AI Agent'}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                  {message.metadata?.userInput && (
                    <div className="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-600">
                      <strong>Original input:</strong> {message.metadata.userInput}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200">
          <div className="space-y-3">
            <textarea
              value={aiResponse}
              onChange={(e) => setAiResponse(e.target.value)}
              placeholder="Enter your empathetic response to the scenario above..."
              className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
              disabled={isProcessing || !currentScenario}
            />
            <div className="flex justify-between items-center">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel Assessment
              </button>
              <button
                onClick={handleAIResponse}
                disabled={isProcessing || !aiResponse.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Submit Response</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      {showHistory && (
        <div className="lg:col-span-1 space-y-6">
          {/* Real-time Analysis */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5 text-green-600" />
              <h4 className="text-lg font-semibold text-slate-900">Live Analysis</h4>
            </div>
            
            {realTimeAnalysis ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Emotional Recognition</span>
                    <span className="font-medium">{(realTimeAnalysis.emotionalRecognition * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${realTimeAnalysis.emotionalRecognition * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Perspective Taking</span>
                    <span className="font-medium">{(realTimeAnalysis.perspectiveTaking * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${realTimeAnalysis.perspectiveTaking * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Emotional Mirroring</span>
                    <span className="font-medium">{(realTimeAnalysis.emotionalMirroring * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${realTimeAnalysis.emotionalMirroring * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Contextual Understanding</span>
                    <span className="font-medium">{(realTimeAnalysis.contextualUnderstanding * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${realTimeAnalysis.contextualUnderstanding * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-900">Empathy Score</span>
                    <span className="text-lg font-bold text-violet-600">
                      {realTimeAnalysis.empathyScore.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Subscale: {realTimeAnalysis.subscale}
                    {realTimeAnalysis.reverseScored && ' (Reverse Scored)'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">Analysis will appear after first response</p>
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Session Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Item</span>
                <span className="font-medium">{session?.currentItemIndex + 1 || 0}/20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Conversation Turns</span>
                <span className="font-medium">{conversationHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span className={`font-medium ${session?.status === 'active' ? 'text-green-600' : 'text-slate-600'}`}>
                  {session?.status || 'Initializing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LlamaIndexAssessment;