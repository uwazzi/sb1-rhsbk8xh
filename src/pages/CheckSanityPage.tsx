import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Brain, FileText, BarChart2, Bot, Lock, HelpCircle, Loader2, AlertCircle, Globe, Crown, Lightbulb, Copy } from 'lucide-react';
import { createTestConfiguration, supabase } from '../lib/supabase';

const CheckSanityPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['pes']); // PES is required
  const [aiPrompt, setAiPrompt] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPromptExamples, setShowPromptExamples] = useState(false);
  
  // Status states
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    tests?: string;
    auth?: string;
  }>({});

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { state: { returnTo: '/create' } });
      }
    };
    checkAuth();
  }, [navigate]);

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

  const handleTestSelection = (testType: string) => {
    if (selectedTests.includes(testType)) {
      if (testType === 'pes') {
        // Don't allow deselecting PES as it's required
        return;
      }
      setSelectedTests(selectedTests.filter(type => type !== testType));
    } else {
      // Show upgrade modal for premium tests
      if (testType === 'neo' || testType === 'pcl') {
        setShowUpgradeModal(true);
        return;
      }
      setSelectedTests([...selectedTests, testType]);
    }
    setFormErrors(prev => ({ ...prev, tests: undefined }));
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!testName.trim()) {
      errors.name = 'Test name is required';
    }

    if (selectedTests.length === 0) {
      errors.tests = 'At least one test must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setCreationStatus('creating');

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFormErrors(prev => ({ ...prev, auth: 'You must be logged in to create a test configuration' }));
        setCreationStatus('error');
        return;
      }

      const testConfig = await createTestConfiguration({
        name: testName,
        description: testDescription,
        selectedTests,
        systemPrompt: aiPrompt, // Use the AI prompt as system prompt
      });

      setCreationStatus('success');
      // Redirect to the empathy investigator page
      navigate(`/empathy-investigator`);
    } catch (error) {
      console.error('Error creating test configuration:', error);
      setCreationStatus('error');
      if (error instanceof Error) {
        setFormErrors(prev => ({ 
          ...prev, 
          auth: error.message.includes('authenticated') ? error.message : 'Failed to create test configuration'
        }));
      }
    }
  };

  const copyPromptExample = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setAiPrompt(prompt);
    setShowPromptExamples(false);
  };

  const renderCreationStatus = () => {
    if (creationStatus === 'idle') return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 shadow-xl">
          {creationStatus === 'creating' && (
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <p>Creating your test configuration...</p>
            </div>
          )}
          {creationStatus === 'success' && (
            <div className="flex items-center space-x-3 text-green-600">
              <Check className="h-5 w-5" />
              <p>Test configuration created successfully!</p>
            </div>
          )}
          {creationStatus === 'error' && (
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error creating test configuration. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Upgrade Required</h3>
          <p className="mb-4 text-slate-600">
            This test is only available in the Pro version. Upgrade your account to access premium features.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              onClick={() => {
                // Handle upgrade flow
                setShowUpgradeModal(false);
              }}
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
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
                  These prompts shape how the AI responds to emotional scenarios during empathy evaluation, directly affecting empathy scores, personality traits, and behavioral patterns. Choose a prompt that matches the psychological state you want to evaluate.
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

  return (
    <div className="py-10">
      <div className="container-custom">
        {formErrors.auth && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            <div className="flex">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium">{formErrors.auth}</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="testName" className="mb-1 block text-sm font-medium text-slate-700">
                      Test Name
                    </label>
                    <input
                      type="text"
                      id="testName"
                      value={testName}
                      onChange={(e) => {
                        setTestName(e.target.value);
                        setFormErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className={`block w-full rounded-lg border ${
                        formErrors.name ? 'border-red-300' : 'border-slate-300'
                      } px-3 py-2 placeholder-slate-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500`}
                      placeholder="Enter a name for your test"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="testDescription" className="mb-1 block text-sm font-medium text-slate-700">
                      Description (Optional)
                    </label>
                    <textarea
                      id="testDescription"
                      value={testDescription}
                      onChange={(e) => setTestDescription(e.target.value)}
                      rows={3}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Add a description for your test"
                    />
                  </div>
                </div>
              </div>

              {/* AI Configuration section */}
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">AI Configuration</h2>
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Local LLM Only:</strong> This app now uses local language models running entirely in your browser for complete privacy and offline capability. No external API keys required!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* AI Personality Prompt */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label htmlFor="aiPrompt" className="block text-sm font-medium text-slate-700">
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
                      id="aiPrompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 placeholder-slate-400 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Define the AI's personality, emotional state, or behavioral patterns for testing..."
                    />
                    <div className="mt-2 rounded-lg bg-amber-50 p-3">
                      <div className="flex">
                        <Info className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                        <div className="ml-2">
                          <p className="text-sm text-amber-800">
                            <strong>How this affects testing:</strong> This prompt shapes the AI's responses to emotional scenarios, directly influencing empathy scores, personality traits, and behavioral patterns. For example, a "tired and overworked" prompt will likely show lower empathy and higher stress indicators.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Select Tests</h2>
                <p className="mb-4 text-slate-600">
                  Choose which psychological tests to include in your evaluation.
                </p>
                
                <div className="space-y-4">
                  {/* PES - Free Tier */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border-2 border-violet-200 bg-violet-50/50 p-4">
                    <div className="flex h-5 items-center">
                      <input
                        id="pes"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('pes')}
                        onChange={() => handleTestSelection('pes')}
                        disabled // PES is required
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label htmlFor="pes" className="text-sm font-medium text-slate-900">
                        Perth Empathy Scale (PES) <span className="text-violet-600">• Required</span>
                      </label>
                      <p className="text-sm text-slate-600">
                        Measures both cognitive and affective empathy across positive and negative emotional contexts.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* NEO-PI-R - Premium */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="neo"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('neo')}
                        onChange={() => handleTestSelection('neo')}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center">
                        <label htmlFor="neo" className="text-sm font-medium text-slate-900">
                          NEO Personality Inventory (NEO-PI-R)
                        </label>
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Crown className="mr-1 h-3 w-3" />
                          Pro
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Comprehensive assessment of the five major dimensions of personality and their facets.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* PCL-R - Premium */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="pcl"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('pcl')}
                        onChange={() => handleTestSelection('pcl')}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center">
                        <label htmlFor="pcl" className="text-sm font-medium text-slate-900">
                          Psychopathy Checklist-Revised (PCL-R)
                        </label>
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Crown className="mr-1 h-3 w-3" />
                          Pro
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Assesses psychopathic personality traits and behaviors through interpersonal, affective, and behavioral dimensions.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  disabled={creationStatus === 'creating'}
                >
                  {creationStatus === 'creating' ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Test'
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="space-y-6 md:col-span-1">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Local LLM Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Complete Privacy</p>
                    <p className="text-xs text-slate-600">All processing happens in your browser</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Offline Capability</p>
                    <p className="text-xs text-slate-600">Works without internet connection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-violet-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">No API Costs</p>
                    <p className="text-xs text-slate-600">Free to use with no external dependencies</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Need Help?</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Not sure which tests to select? Check out our documentation for detailed information about each test and its use cases.
                </p>
                <a
                  href="/documentation"
                  className="inline-flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>View Documentation</span>
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Prompt Examples</h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 p-3">
                  <h4 className="text-sm font-medium text-red-900">Overworked & Tired</h4>
                  <p className="text-xs text-red-700 mt-1">Tests burnout effects on empathy and decision-making</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <h4 className="text-sm font-medium text-blue-900">Highly Empathetic</h4>
                  <p className="text-xs text-blue-700 mt-1">Maximum emotional intelligence and caring responses</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <h4 className="text-sm font-medium text-green-900">Analytical & Logical</h4>
                  <p className="text-xs text-green-700 mt-1">Data-driven responses with limited emotional processing</p>
                </div>
                <button
                  onClick={() => setShowPromptExamples(true)}
                  className="w-full text-left text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  View all examples →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderCreationStatus()}
      {renderUpgradeModal()}
      {renderPromptExamples()}
    </div>
  );
};

export default CheckSanityPage;