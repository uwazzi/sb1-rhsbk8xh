import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Brain, FileText, BarChart2, Bot, Lock, HelpCircle, Loader2, AlertCircle, Globe, Crown } from 'lucide-react';
import { getGeminiResponse, testGeminiApiKey } from '../lib/gemini';
import { createTestConfiguration, supabase } from '../lib/supabase';

const CheckSanityPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['pes']); // PES is required
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Status states
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    apiKey?: string;
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

  const testGeminiConnection = async () => {
    setConnectionStatus('testing');
    try {
      const isValid = await testGeminiApiKey(geminiApiKey);
      if (isValid) {
        setConnectionStatus('success');
        setFormErrors(prev => ({ ...prev, apiKey: undefined }));
      } else {
        setConnectionStatus('error');
        setFormErrors(prev => ({ ...prev, apiKey: 'Invalid API key' }));
      }
    } catch (error) {
      setConnectionStatus('error');
      setFormErrors(prev => ({ ...prev, apiKey: 'Connection failed' }));
    }
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!testName.trim()) {
      errors.name = 'Test name is required';
    }

    if (!geminiApiKey.trim()) {
      errors.apiKey = 'Gemini API key is required';
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
        systemPrompt: '', // Optional system prompt
      });

      setCreationStatus('success');
      navigate(`/test/${testConfig.id}`);
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
                <div className="space-y-4">
                  <div>
                    <label htmlFor="geminiApiKey" className="mb-1 block text-sm font-medium text-slate-700">
                      Gemini API Key
                    </label>
                    <div className="mt-1 flex rounded-lg shadow-sm">
                      <input
                        type="password"
                        id="geminiApiKey"
                        value={geminiApiKey}
                        onChange={(e) => {
                          setGeminiApiKey(e.target.value);
                          setFormErrors(prev => ({ ...prev, apiKey: undefined }));
                          setConnectionStatus('idle');
                        }}
                        className={`block w-full rounded-l-lg border ${
                          formErrors.apiKey ? 'border-red-300' : 'border-slate-300'
                        } px-3 py-2 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500`}
                        placeholder="Enter your Gemini API key"
                      />
                      <button
                        type="button"
                        onClick={testGeminiConnection}
                        disabled={connectionStatus === 'testing' || !geminiApiKey}
                        className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {connectionStatus === 'testing' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : connectionStatus === 'success' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : connectionStatus === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          'Test Connection'
                        )}
                      </button>
                    </div>
                    {formErrors.apiKey && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.apiKey}</p>
                    )}
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
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Need Help?</h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Not sure which tests to select? Check out our documentation for detailed information about each test and its use cases.
                </p>
                <a
                  href="/docs"
                  className="inline-flex items-center space-x-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>View Documentation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderCreationStatus()}
      {renderUpgradeModal()}
    </div>
  );
};

export default CheckSanityPage;