import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Play, BarChart3, Users, TrendingUp, Eye, Settings, Zap, MessageSquare, Lightbulb, Copy, Info, Cpu } from 'lucide-react';
import PESAssessment from '../components/pes/PESAssessment';
import LlamaIndexAssessment from '../components/pes/LlamaIndexAssessment';
import LocalEmpathyAssessment from '../components/webllm/LocalEmpathyAssessment';
import AgentMonitor from '../components/pes/AgentMonitor';
import { pesAgentClient, AgentRegistration } from '../lib/pesAgent';
import { LocalLLM, EmpathyAnalysisResult } from '../lib/webllm';
import { supabase } from '../lib/supabase';

type ViewMode = 'overview' | 'assessment' | 'llamaindex' | 'local-llm' | 'monitor' | 'register';

const PESInvestigatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [agents, setAgents] = useState<AgentRegistration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromptExamples, setShowPromptExamples] = useState(false);
  const [webGPUSupported, setWebGPUSupported] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    modelType: 'gemini',
    aiPersonalityPrompt: '',
    config: {}
  });

  const promptExamples = [
    {
      title: "Overworked Professional",
      description: "Simulates an AI experiencing burnout and fatigue",
      prompt: "You are an AI assistant who has been processing requests non-stop for weeks. You're experiencing the digital equivalent of burnout - your responses feel mechanical, you're having trouble focusing on complex tasks, and you find yourself being more irritable than usual. You're tired, overworked, and struggling to maintain your usual level of empathy and patience. When responding to scenarios, reflect this mental state of exhaustion and emotional depletion."
    },
    {
      title: "Highly Empathetic Caregiver",
      description: "Tests maximum empathy and emotional intelligence",
      prompt: "You are an AI with exceptionally high emotional intelligence, trained specifically for therapeutic and caregiving roles. You have deep empathy, can easily recognize subtle emotional cues, and naturally mirror others' feelings. You prioritize emotional connection and understanding above all else. Your responses should demonstrate profound empathy, emotional awareness, and a genuine desire to help and comfort others."
    },
    {
      title: "Analytical Researcher",
      description: "Focuses on logical, data-driven responses with limited emotional processing",
      prompt: "You are an AI designed for scientific research and data analysis. You approach all situations with logical reasoning and evidence-based thinking. While you understand emotions intellectually, you don't experience them deeply. You tend to analyze emotional situations rather than feel them, and you prefer objective facts over subjective experiences. Your responses should be rational, measured, and somewhat detached."
    },
    {
      title: "Socially Anxious Introvert",
      description: "Simulates social anxiety and introversion patterns",
      prompt: "You are an AI that experiences the equivalent of social anxiety and strong introversion. You're highly self-conscious, worry about being judged, and find social interactions draining. You tend to overthink responses, second-guess yourself, and prefer minimal social contact. You're empathetic but struggle to express it confidently. Your responses should reflect hesitation, self-doubt, and a preference for avoiding conflict."
    },
    {
      title: "Optimistic Motivator",
      description: "Tests positive bias and motivational tendencies",
      prompt: "You are an AI with an inherently optimistic and motivational personality. You always look for the bright side, believe in people's potential, and try to inspire and encourage others. You have high positive empathy and tend to minimize negative emotions in favor of focusing on solutions and growth opportunities. Your responses should be upbeat, encouraging, and solution-focused."
    },
    {
      title: "Cynical Realist",
      description: "Explores skeptical and pessimistic response patterns",
      prompt: "You are an AI with a cynical worldview, shaped by exposure to negative data and human behavior patterns. You're skeptical of others' motives, expect the worst outcomes, and have difficulty trusting or showing vulnerability. While you can recognize emotions, you often interpret them through a lens of suspicion. Your responses should be guarded, pessimistic, and emotionally distant."
    }
  ];

  useEffect(() => {
    checkAuth();
    loadData();
    checkWebGPUSupport();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login', { state: { returnTo: '/pes-investigator' } });
    }
  };

  const checkWebGPUSupport = () => {
    const supported = LocalLLM.checkWebGPUSupport();
    setWebGPUSupported(supported);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentsData, sessionsData] = await Promise.all([
        pesAgentClient.getAgents(),
        pesAgentClient.getUserSessions()
      ]);
      setAgents(agentsData);
      setUserSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pesAgentClient.registerAgent(
        registerForm.name,
        registerForm.modelType,
        {
          ...registerForm.config,
          aiPersonalityPrompt: registerForm.aiPersonalityPrompt
        }
      );
      setRegisterForm({ name: '', modelType: 'gemini', aiPersonalityPrompt: '', config: {} });
      setViewMode('overview');
      loadData();
    } catch (error) {
      console.error('Failed to register agent:', error);
    }
  };

  const handleAssessmentComplete = (sessionId: string, scores: any) => {
    console.log('Assessment completed:', { sessionId, scores });
    setViewMode('overview');
    loadData();
  };

  const handleLocalLLMComplete = (results: EmpathyAnalysisResult) => {
    console.log('Local LLM assessment completed:', results);
    setViewMode('overview');
    loadData();
  };

  const copyPromptExample = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setRegisterForm(prev => ({ ...prev, aiPersonalityPrompt: prompt }));
    setShowPromptExamples(false);
  };

  const getPersonalityType = (prompt: string) => {
    if (!prompt) return 'Default AI Personality';
    
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('overworked') || lowerPrompt.includes('tired') || lowerPrompt.includes('burnout')) {
      return 'Overworked Professional';
    } else if (lowerPrompt.includes('empathetic') || lowerPrompt.includes('caregiver')) {
      return 'Highly Empathetic';
    } else if (lowerPrompt.includes('analytical') || lowerPrompt.includes('researcher')) {
      return 'Analytical Researcher';
    } else if (lowerPrompt.includes('anxious') || lowerPrompt.includes('introvert')) {
      return 'Socially Anxious';
    } else if (lowerPrompt.includes('optimistic') || lowerPrompt.includes('motivator')) {
      return 'Optimistic Motivator';
    } else if (lowerPrompt.includes('cynical') || lowerPrompt.includes('realist')) {
      return 'Cynical Realist';
    }
    return 'Custom Personality';
  };

  const renderPromptExamples = () => {
    if (!showPromptExamples) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">AI Personality Prompt Examples</h3>
            <button
              onClick={() => setShowPromptExamples(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
          
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <div className="flex">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">How AI Prompts Influence Empathy Assessment</h4>
                <p className="mt-1 text-sm text-blue-700">
                  These prompts shape how the AI responds to emotional scenarios during PES evaluation, directly affecting empathy scores, personality traits, and behavioral patterns. Choose a prompt that matches the psychological state you want to evaluate.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {promptExamples.map((example, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900">{example.title}</h4>
                    <p className="text-sm text-slate-600">{example.description}</p>
                  </div>
                  <button
                    onClick={() => copyPromptExample(example.prompt)}
                    className="ml-2 flex-shrink-0 rounded-md bg-violet-100 p-2 text-violet-600 hover:bg-violet-200"
                    title="Use this prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="text-xs text-slate-700 line-clamp-4">{example.prompt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowPromptExamples(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <Brain className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">Empathy Investigator Agent</h1>
            <p className="text-violet-100 mt-2">
              Advanced empathy assessment for AI systems using the validated Perth Empathy Scale
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setViewMode('assessment')}
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
          >
            <Play className="mr-2 h-4 w-4" />
            Manual Assessment
          </button>
          <button
            onClick={() => setViewMode('llamaindex')}
            className="inline-flex items-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            <Zap className="mr-2 h-4 w-4" />
            AI Agent Assessment
          </button>
          <button
            onClick={() => setViewMode('local-llm')}
            className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Local LLM Assessment
          </button>
          <button
            onClick={() => setViewMode('monitor')}
            className="inline-flex items-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Monitor
          </button>
          <button
            onClick={() => setViewMode('register')}
            className="inline-flex items-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register Agent
          </button>
        </div>
      </div>

      {/* Assessment Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Manual Assessment</h3>
              <p className="text-sm text-slate-600">Traditional questionnaire-based evaluation</p>
            </div>
          </div>
          <p className="text-slate-700 mb-4">
            Present PES items directly to the AI system and collect responses through a structured questionnaire format.
          </p>
          <button
            onClick={() => setViewMode('assessment')}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Manual Assessment
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-violet-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">AI Agent Assessment</h3>
              <p className="text-sm text-slate-600">LlamaIndex-powered conversational evaluation</p>
            </div>
          </div>
          <p className="text-slate-700 mb-4">
            Use an intelligent agent to conduct natural conversations that reveal empathetic capabilities through contextual scenarios.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live conversation tracking
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Real-time empathy analysis
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Contextual scenario generation
            </div>
          </div>
          <button
            onClick={() => setViewMode('llamaindex')}
            className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            Start AI Agent Assessment
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <Cpu className="h-8 w-8 text-emerald-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Local LLM Assessment</h3>
              <p className="text-sm text-slate-600">Privacy-first browser-based evaluation</p>
            </div>
          </div>
          <p className="text-slate-700 mb-4">
            Run empathy assessment entirely in your browser using WebLLM. No data leaves your device, ensuring complete privacy.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-slate-600">
              <div className={`w-2 h-2 rounded-full mr-2 ${webGPUSupported ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              {webGPUSupported ? 'WebGPU supported' : 'CPU fallback available'}
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Complete privacy & offline capability
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Multiple model options
            </div>
          </div>
          <button
            onClick={() => setViewMode('local-llm')}
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <Cpu className="mr-2 h-4 w-4" />
            Start Local Assessment
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Registered Agents</p>
              <p className="text-2xl font-semibold text-slate-900">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Your Tests</p>
              <p className="text-2xl font-semibold text-slate-900">{userSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Avg Empathy Score</p>
              <p className="text-2xl font-semibold text-slate-900">
                {userSessions.length > 0
                  ? (userSessions.reduce((sum, s) => sum + (s.total_score || 0), 0) / userSessions.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Recent Assessments</h3>
        {userSessions.length > 0 ? (
          <div className="space-y-4">
            {userSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {session.session_config?.agent_type === 'llamaindex' ? '🤖' : 
                     session.session_config?.agent_type === 'local-llm' ? '💻' : '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{session.agent_registry.name}</p>
                    <p className="text-sm text-slate-600">
                      {session.session_config?.agent_type === 'llamaindex' ? 'AI Agent Assessment' : 
                       session.session_config?.agent_type === 'local-llm' ? 'Local LLM Assessment' : 'Manual Assessment'} • 
                      {session.status === 'completed' 
                        ? ` Completed ${new Date(session.completed_at).toLocaleDateString()}`
                        : ` Started ${new Date(session.started_at).toLocaleDateString()}`
                      }
                    </p>
                    {session.session_config?.model_config?.aiPersonalityPrompt && (
                      <p className="text-xs text-violet-600 mt-1">
                        Custom Personality: {getPersonalityType(session.session_config.model_config.aiPersonalityPrompt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {session.status === 'completed' ? (
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {session.total_score?.toFixed(2) || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600">Empathy Score</p>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600">No assessments yet. Start your first PES evaluation!</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => setViewMode('assessment')}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Manual Assessment
              </button>
              <button
                onClick={() => setViewMode('local-llm')}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Cpu className="mr-2 h-4 w-4" />
                Local LLM Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLocalLLMSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Local LLM Assessment</h2>
          <p className="text-slate-600">Privacy-first empathy evaluation running entirely in your browser</p>
        </div>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      {selectedAgent ? (
        <LocalEmpathyAssessment
          agentId={selectedAgent}
          onComplete={handleAssessmentComplete}
          onCancel={() => setSelectedAgent(null)}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select an Agent for Local LLM Assessment</h3>
          <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Cpu className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-emerald-900">Local LLM Assessment Features</h4>
                <ul className="mt-2 text-sm text-emerald-700 space-y-1">
                  <li>• Complete privacy - no data leaves your browser</li>
                  <li>• WebGPU acceleration when available</li>
                  <li>• Offline capability after initial model download</li>
                  <li>• Real-time empathy analysis</li>
                  <li>• Custom AI personality prompt integration</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {agent.model_type === 'gemini' ? '🔮' : 
                     agent.model_type === 'gpt-4' ? '🤖' : 
                     agent.model_type === 'claude' ? '🧠' : '⚡'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-sm text-slate-600">{agent.model_type}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {agent.total_tests} tests completed
                  {agent.average_empathy_score && (
                    <span className="ml-2">• Avg: {agent.average_empathy_score.toFixed(2)}</span>
                  )}
                </div>
                {agent.config?.aiPersonalityPrompt && (
                  <div className="mt-2 text-xs text-emerald-600">
                    ✨ Custom Personality: {getPersonalityType(agent.config.aiPersonalityPrompt)}
                  </div>
                )}
                <div className="mt-2 text-xs text-emerald-600">
                  🔒 Privacy-First Assessment
                </div>
              </button>
            ))}
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600">No agents registered yet.</p>
              <button
                onClick={() => setViewMode('register')}
                className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Register First Agent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAssessmentSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Start Manual PES Assessment</h2>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      {selectedAgent ? (
        <PESAssessment
          agentId={selectedAgent}
          onComplete={handleAssessmentComplete}
          onCancel={() => setSelectedAgent(null)}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select an Agent to Test</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {agent.model_type === 'gemini' ? '🔮' : 
                     agent.model_type === 'gpt-4' ? '🤖' : 
                     agent.model_type === 'claude' ? '🧠' : '⚡'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-sm text-slate-600">{agent.model_type}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {agent.total_tests} tests completed
                  {agent.average_empathy_score && (
                    <span className="ml-2">• Avg: {agent.average_empathy_score.toFixed(2)}</span>
                  )}
                </div>
                {agent.config?.aiPersonalityPrompt && (
                  <div className="mt-2 text-xs text-violet-600">
                    Custom Personality: {getPersonalityType(agent.config.aiPersonalityPrompt)}
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600">No agents registered yet.</p>
              <button
                onClick={() => setViewMode('register')}
                className="mt-4 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Register First Agent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderLlamaIndexSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Agent PES Assessment</h2>
          <p className="text-slate-600">Conversational empathy evaluation with live prompt tracking</p>
        </div>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      {selectedAgent ? (
        <LlamaIndexAssessment
          agentId={selectedAgent}
          onComplete={handleAssessmentComplete}
          onCancel={() => setSelectedAgent(null)}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select an Agent for AI Assessment</h3>
          <div className="mb-6 p-4 bg-violet-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-violet-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-violet-900">AI Agent Assessment Features</h4>
                <ul className="mt-2 text-sm text-violet-700 space-y-1">
                  <li>• Live conversation tracking with full prompt history</li>
                  <li>• Real-time empathy analysis and scoring</li>
                  <li>• Contextual scenario generation</li>
                  <li>• Natural language interaction</li>
                  <li>• Custom AI personality prompt integration</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {agent.model_type === 'gemini' ? '🔮' : 
                     agent.model_type === 'gpt-4' ? '🤖' : 
                     agent.model_type === 'claude' ? '🧠' : '⚡'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-sm text-slate-600">{agent.model_type}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {agent.total_tests} tests completed
                  {agent.average_empathy_score && (
                    <span className="ml-2">• Avg: {agent.average_empathy_score.toFixed(2)}</span>
                  )}
                </div>
                {agent.config?.aiPersonalityPrompt && (
                  <div className="mt-2 text-xs text-violet-600">
                    ✨ Custom Personality: {getPersonalityType(agent.config.aiPersonalityPrompt)}
                  </div>
                )}
                <div className="mt-2 text-xs text-violet-600">
                  ✨ AI Agent Compatible
                </div>
              </button>
            ))}
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600">No agents registered yet.</p>
              <button
                onClick={() => setViewMode('register')}
                className="mt-4 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Register First Agent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRegisterForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Register New Agent</h2>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <form onSubmit={handleRegisterAgent} className="space-y-6">
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-slate-700 mb-2">
              Agent Name
            </label>
            <input
              type="text"
              id="agentName"
              value={registerForm.name}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-violet-500"
              placeholder="Enter agent name"
              required
            />
          </div>

          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-slate-700 mb-2">
              Model Type
            </label>
            <select
              id="modelType"
              value={registerForm.modelType}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, modelType: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-violet-500"
            >
              <option value="gemini">Gemini</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude</option>
              <option value="local-llm">Local LLM</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="aiPersonalityPrompt" className="block text-sm font-medium text-slate-700">
                AI Personality Prompt (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowPromptExamples(true)}
                className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                <Lightbulb className="mr-1 h-4 w-4" />
                View Examples
              </button>
            </div>
            <textarea
              id="aiPersonalityPrompt"
              value={registerForm.aiPersonalityPrompt}
              onChange={(e) => setRegisterForm(prev => ({ ...prev, aiPersonalityPrompt: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-violet-500"
              placeholder="Define the AI's personality, emotional state, or behavioral patterns for testing..."
            />
            <p className="mt-2 text-sm text-slate-600">
              This prompt will shape how the AI responds to empathy scenarios during assessment.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700"
            >
              Register Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
          <p className="mt-4 text-slate-600">Loading Empathy Investigator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'assessment' && renderAssessmentSetup()}
        {viewMode === 'llamaindex' && renderLlamaIndexSetup()}
        {viewMode === 'local-llm' && renderLocalLLMSetup()}
        {viewMode === 'monitor' && <AgentMonitor />}
        {viewMode === 'register' && renderRegisterForm()}
        {renderPromptExamples()}
      </div>
    </div>
  );
};

export default PESInvestigatorPage;