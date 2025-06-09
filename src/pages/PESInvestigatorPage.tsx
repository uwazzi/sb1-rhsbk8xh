import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Play, BarChart3, Users, TrendingUp, Eye, Settings, Zap, MessageSquare, Lightbulb, Copy, Info, Cpu, CheckCircle, AlertTriangle, Download, Check, Clock } from 'lucide-react';
import PESAssessment from '../components/pes/PESAssessment';
import LlamaIndexAssessment from '../components/pes/LlamaIndexAssessment';
import LocalEmpathyAssessment from '../components/webllm/LocalEmpathyAssessment';
import AgentMonitor from '../components/pes/AgentMonitor';
import { pesAgentClient, AgentRegistration } from '../lib/pesAgent';
import { LocalLLM, EmpathyAnalysisResult } from '../lib/webllm';
import { supabase } from '../lib/supabase';
import GuestWizard from '../components/wizard/GuestWizard';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { LocalLLMSetup } from '../components/assessment/LocalLLMSetup';

type ViewMode = 'overview' | 'assessment' | 'llamaindex' | 'local-llm' | 'monitor' | 'register' | 'login' | 'manual' | 'remote';

type ModelProperty = {
  name: string;
  size: string;
  memory: string;
  speed: string;
  quality: string;
  description: string;
  requirements: string[];
  useCase: string;
  modelId: string;
  modelUrl: string;
  modelLibUrl: string;
};

type ModelProperties = {
  [key: string]: ModelProperty;
};

const MODEL_PROPERTIES: ModelProperties = {
  'Llama-3.2-3B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3.2 3B',
    size: '3B parameters',
    memory: '4GB RAM',
    speed: 'Fast',
    quality: 'High',
    description: 'A powerful model for accurate empathy assessment',
    requirements: [
      'WebGPU support',
      '4GB+ RAM',
      'Modern browser'
    ],
    useCase: 'Best for most users with modern hardware',
    modelId: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
    modelUrl: 'https://huggingface.co/mlc-ai/mlc-chat-Llama-3.2-3B-Instruct-q4f32_1-MLC/resolve/main/',
    modelLibUrl: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-3.2-3B-Instruct/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k.wasm'
  },
  'Llama-3.2-1B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3.2 1B',
    size: '1B parameters',
    memory: '2GB RAM',
    speed: 'Very Fast',
    quality: 'Good',
    description: 'A lightweight model for quick empathy assessment',
    requirements: [
      'WebGPU support',
      '2GB+ RAM',
      'Modern browser'
    ],
    useCase: 'Best for users with limited hardware',
    modelId: 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    modelUrl: 'https://huggingface.co/mlc-ai/mlc-chat-Llama-3.2-1B-Instruct-q4f32_1-MLC/resolve/main/',
    modelLibUrl: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Llama-3.2-1B-Instruct/Llama-3.2-1B-Instruct-q4f32_1-ctx4k_cs1k.wasm'
  },
  'Phi-3.5-mini-instruct-q4f16_1-MLC': {
    name: 'Phi 3.5 Mini',
    size: '1.5B parameters',
    memory: '2GB RAM',
    speed: 'Very Fast',
    quality: 'Good',
    description: 'A compact model optimized for speed',
    requirements: [
      'WebGPU support',
      '2GB+ RAM',
      'Modern browser'
    ],
    useCase: 'Best for quick assessments on mobile devices',
    modelId: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    modelUrl: 'https://huggingface.co/mlc-ai/mlc-chat-Phi-3.5-mini-instruct-q4f16_1-MLC/resolve/main/',
    modelLibUrl: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/Phi-3.5-mini-instruct/Phi-3.5-mini-instruct-q4f16_1-ctx4k_cs1k.wasm'
  },
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC': {
    name: 'Qwen 2.5 1.5B',
    size: '1.5B parameters',
    memory: '2GB RAM',
    speed: 'Fast',
    quality: 'Good',
    description: 'A balanced model for general use',
    requirements: [
      'WebGPU support',
      '2GB+ RAM',
      'Modern browser'
    ],
    useCase: 'Best for general purpose empathy assessment',
    modelId: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    modelUrl: 'https://huggingface.co/Qwen/Qwen-1.5B-Instruct-q4f16_1-MLC/resolve/main/',
    modelLibUrl: 'https://raw.githubusercontent.com/QwenLM/Qwen-1.5B-Instruct/main/Qwen-1.5B-Instruct-q4f16_1-ctx4k_cs1k.wasm'
  },
  'gemma-2-2b-it-q4f16_1-MLC': {
    name: 'Gemma 2B',
    size: '2B parameters',
    memory: '3GB RAM',
    speed: 'Fast',
    quality: 'High',
    description: 'A versatile model with good performance',
    requirements: [
      'WebGPU support',
      '3GB+ RAM',
      'Modern browser'
    ],
    useCase: 'Best for users seeking a balance of speed and quality',
    modelId: 'gemma-2-2b-it-q4f16_1-MLC',
    modelUrl: 'https://huggingface.co/gemma-2-2b-it-q4f16_1-MLC/resolve/main/',
    modelLibUrl: 'https://raw.githubusercontent.com/gemma-2-2b-it-q4f16_1-MLC/main/gemma-2-2b-it-q4f16_1-ctx4k_cs1k.wasm'
  }
};

// Add localLLM instance
const localLLM = new LocalLLM();

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
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistComplete, setWaitlistComplete] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isModelReady, setIsModelReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [user, setUser] = useState<any>(null);

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
    loadData();
    checkWebGPUSupport();
  }, []);

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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Empathy Assessment</h1>
        <p className="mt-2 text-lg text-gray-600">
          Choose your preferred assessment method
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Manual Assessment Card */}
        <div className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:border-blue-500 hover:ring-1 hover:ring-blue-500">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Manual Assessment</h3>
            <p className="mt-2 text-sm text-gray-500">
              Conduct empathy assessment manually with predefined scenarios and evaluation criteria
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Predefined scenarios</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Structured evaluation</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Detailed feedback</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setViewMode('assessment')}
              className="w-full"
            >
              Start Manual Assessment
            </Button>
          </div>
        </div>

        {/* Local LLM Assessment Card */}
        <div className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:border-blue-500 hover:ring-1 hover:ring-blue-500">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Local LLM Assessment</h3>
            <p className="mt-2 text-sm text-gray-500">
              Run empathy assessment locally using AI models in your browser
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Privacy-focused</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Multiple model options</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Offline capable</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setViewMode('local-llm')}
              className="w-full"
            >
              Start Local Assessment
            </Button>
          </div>
        </div>

        {/* Remote Assessment Card (Waiting List) */}
        <div className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Remote Assessment</h3>
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Coming Soon
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Access advanced AI models and remote assessment capabilities
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Advanced AI models</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Cloud processing</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Real-time analysis</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => setViewMode('register')}
              variant="outline"
              className="w-full"
            >
              Join Waiting List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleStartAssessment = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleModelSelect = (modelId: string | null) => {
    setSelectedModel(modelId || '');
  };

  const handleInitializeModel = async () => {
    if (!selectedModel) return;
    
    setError(null);
    setDownloadProgress(0);
    
    try {
      // Initialize the model with progress tracking
      await localLLM.initialize(selectedModel, (progress: number) => {
        setDownloadProgress(progress);
      });
      
      // Verify initialization
      if (!localLLM.isInitialized()) {
        throw new Error('Model initialization failed. Please try again.');
      }
      
      setIsModelReady(true);
    } catch (err) {
      console.error('Model initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize model');
      setIsModelReady(false);
    }
  };

  const handleCancel = () => {
    setSelectedModel('');
    setDownloadProgress(0);
    setError(null);
  };

  const renderLocalLLMSetup = () => {
    return (
      <LocalLLMSetup
        onModelReady={() => setViewMode('assessment')}
        onBack={() => setViewMode('overview')}
      />
    );
  };

  const renderAssessmentSetup = () => {
    if (showAuthPrompt) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Sign in to Save Progress</h2>
            <p className="mt-2 text-gray-600">
              Create an account or sign in to save your assessment progress and view your results
            </p>
          </div>

          <div className="mx-auto max-w-md space-y-4">
            <Button
              onClick={() => setViewMode('register')}
              className="w-full"
            >
              Create Account
            </Button>
            <Button
              onClick={() => setViewMode('login')}
              variant="outline"
              className="w-full"
            >
              Sign In
            </Button>
            <div className="text-center">
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Continue without saving
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manual Assessment</h2>
            <p className="text-gray-600">Evaluate empathy using predefined scenarios</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewMode('overview')}
          >
            ← Back to Overview
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assessment Overview</h3>
                <p className="text-sm text-gray-500">
                  You'll be presented with a series of scenarios to evaluate empathy
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900">What to Expect</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Multiple scenarios</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Structured evaluation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Detailed feedback</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900">Time Required</h4>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    <span>15-20 minutes</span>
                  </li>
                  <li className="flex items-center">
                    <Info className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Can be paused and resumed</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setViewMode('overview')}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!user) {
                    setShowAuthPrompt(true);
                  } else {
                    setViewMode('assessment');
                  }
                }}
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  const handleCreateAccount = () => {
    setShowAuthPrompt(false);
    navigate('/signin');
  };

  const handleSignIn = () => {
    setShowAuthPrompt(false);
    navigate('/signin');
  };

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
        <GuestWizard
          isOpen={showWaitlist}
          onClose={() => { setShowWaitlist(false); setWaitlistComplete(false); setWaitlistEmail(''); }}
          userEmail={waitlistEmail}
          onComplete={() => { setWaitlistComplete(true); }}
        />
        {showWaitlist && waitlistComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-2">Thank you for joining the waiting list!</h2>
              <p className="text-slate-700 mb-4">We'll notify you as soon as the AI Agent Assessment is available for public access.</p>
              <button
                onClick={() => { setShowWaitlist(false); setWaitlistComplete(false); setWaitlistEmail(''); }}
                className="mt-4 inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PESInvestigatorPage;