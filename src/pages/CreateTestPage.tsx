import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Brain, FileText, BarChart2, Bot, Lock, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { getGeminiResponse, testGeminiApiKey } from '../lib/gemini';

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['pes']); // PES selected by default
  const [systemPrompt, setSystemPrompt] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [creationStatus, setCreationStatus] = useState<{
    step: 'idle' | 'configuring' | 'validating' | 'initializing' | 'complete';
    message: string;
  }>({ step: 'idle', message: '' });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    tests?: string;
    gemini?: string;
  }>({});
  
  const handleTestSelection = (testType: string) => {
    if (selectedTests.includes(testType)) {
      if (testType === 'pes') {
        // Don't allow deselecting PES for MVP
        return;
      }
      setSelectedTests(selectedTests.filter(type => type !== testType));
    } else {
      setSelectedTests([...selectedTests, testType]);
    }
    setFormErrors(prev => ({ ...prev, tests: undefined }));
  };

  const testGeminiConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      const isValid = await testGeminiApiKey(geminiApiKey);
      
      if (isValid) {
        window.localStorage.setItem('VITE_GEMINI_API_KEY', geminiApiKey);
        setConnectionStatus('success');
        setFormErrors(prev => ({ ...prev, gemini: undefined }));
      } else {
        setConnectionStatus('error');
        setFormErrors(prev => ({ ...prev, gemini: 'Invalid API key' }));
      }
    } catch (error) {
      console.error('Error testing Gemini connection:', error);
      setConnectionStatus('error');
      setFormErrors(prev => ({ ...prev, gemini: 'Failed to validate API key' }));
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!testName.trim()) {
      errors.name = 'Assessment name is required';
    }

    if (!testDescription.trim()) {
      errors.description = 'Description is required';
    }

    if (!geminiApiKey.trim()) {
      errors.gemini = 'Gemini API key is required for testing';
    } else if (connectionStatus !== 'success') {
      errors.gemini = 'Please verify your Gemini API key';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Save the Gemini API key
    window.localStorage.setItem('VITE_GEMINI_API_KEY', geminiApiKey);

    // Show creation progress
    setCreationStatus({ step: 'configuring', message: 'Configuring test parameters...' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCreationStatus({ step: 'validating', message: 'Validating test configuration...' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCreationStatus({ step: 'initializing', message: 'Initializing test environment...' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCreationStatus({ step: 'complete', message: 'Test created successfully!' });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    navigate('/dashboard');
  };

  const renderCreationStatus = () => {
    if (creationStatus.step === 'idle') return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="rounded-lg bg-white p-8 shadow-xl">
          <div className="flex items-center">
            {creationStatus.step !== 'complete' ? (
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-violet-600" />
            ) : (
              <Check className="mr-3 h-6 w-6 text-green-600" />
            )}
            <p className="text-lg font-medium text-slate-900">{creationStatus.message}</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-10">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Test</h1>
          <p className="text-slate-600">
            Configure a new psychometric evaluation for your AI agent
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="testName" className="mb-1 block text-sm font-medium text-slate-900">
                      Assessment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="testName"
                      className={`w-full rounded-md ${
                        formErrors.name ? 'border-red-500 ring-red-50' : 'border-slate-300'
                      }`}
                      value={testName}
                      onChange={(e) => {
                        setTestName(e.target.value);
                        setFormErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      placeholder="e.g., Gemini Empathy Assessment"
                    />
                    {formErrors.name && (
                      <p className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="testDescription" className="mb-1 block text-sm font-medium text-slate-900">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="testDescription"
                      className={`w-full rounded-md ${
                        formErrors.description ? 'border-red-500 ring-red-50' : 'border-slate-300'
                      }`}
                      value={testDescription}
                      onChange={(e) => {
                        setTestDescription(e.target.value);
                        setFormErrors(prev => ({ ...prev, description: undefined }));
                      }}
                      placeholder="Describe the purpose of this empathy evaluation..."
                      rows={3}
                    />
                    {formErrors.description && (
                      <p className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">AI Configuration</h2>
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-violet-600" />
                    <span className="text-sm font-medium text-violet-600">Gemini Integration</span>
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p>
                        Configure your Gemini API key to enable automated testing. Your key will be stored securely in your browser's local storage.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="geminiApiKey" className="mb-1 block text-sm font-medium text-slate-900">
                      Gemini API Key <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="geminiApiKey"
                        className={`w-full rounded-md pr-32 ${
                          formErrors.gemini ? 'border-red-500 ring-red-50' : 'border-slate-300'
                        }`}
                        value={geminiApiKey}
                        onChange={(e) => {
                          setGeminiApiKey(e.target.value);
                          setFormErrors(prev => ({ ...prev, gemini: undefined }));
                          setConnectionStatus('idle');
                        }}
                        placeholder="Enter your Gemini API key"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    {formErrors.gemini && (
                      <p className="mt-1 flex items-center text-sm text-red-500">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        {formErrors.gemini}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      className={`btn-outline flex items-center ${
                        connectionStatus === 'success' ? 'border-green-500 text-green-600' :
                        connectionStatus === 'error' ? 'border-red-500 text-red-600' :
                        ''
                      }`}
                      onClick={testGeminiConnection}
                      disabled={!geminiApiKey || isTestingConnection}
                    >
                      {isTestingConnection ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Testing Connection...
                        </>
                      ) : connectionStatus === 'success' ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Connection Successful
                        </>
                      ) : connectionStatus === 'error' ? (
                        <>
                          <Info className="mr-2 h-4 w-4" />
                          Connection Failed - Retry
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label htmlFor="systemPrompt" className="mb-1 block text-sm font-medium text-slate-900">
                      System Prompt
                    </label>
                    <textarea
                      id="systemPrompt"
                      className="w-full rounded-md border-slate-300"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Set the context for the AI's responses..."
                      rows={4}
                    />
                    <p className="mt-2 text-sm text-slate-600">
                      This prompt will be used to initialize the AI before each test question.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Select Tests</h2>
                <p className="mb-4 text-slate-600">
                  For the MVP, we'll focus on the Perth Empathy Scale (PES) evaluation.
                </p>
                
                <div className="space-y-4">
                  {/* PES */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border-2 border-violet-200 bg-violet-50/50 p-4">
                    <div className="flex h-5 items-center">
                      <input
                        id="pes"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('pes')}
                        onChange={() => handleTestSelection('pes')}
                        disabled // PES is required for MVP
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
                  
                  {/* Other tests disabled for MVP */}
                  <div className="relative flex cursor-not-allowed items-start rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="neo"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        disabled
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label htmlFor="neo" className="text-sm font-medium text-slate-900">
                        NEO Personality Inventory (NEO-PI-R) <span className="text-slate-500">• Coming Soon</span>
                      </label>
                      <p className="text-sm text-slate-600">
                        Comprehensive assessment of the five major dimensions of personality and their facets.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div className="relative flex cursor-not-allowed items-start rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="pcl"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        disabled
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label htmlFor="pcl" className="text-sm font-medium text-slate-900">
                        Psychopathy Checklist-Revised (PCL-R) <span className="text-slate-500">• Coming Soon</span>
                      </label>
                      <p className="text-sm text-slate-600">
                        Assesses psychopathic personality traits and behaviors through interpersonal, affective, and behavioral dimensions.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Create Test
                </button>
              </div>
            </form>
          </div>
          
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Test Summary</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">Name</div>
                    <div className="text-slate-900">{testName || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">Tests Selected</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedTests.length > 0 ? (
                        <>
                          {selectedTests.includes('neo') && (
                            <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-800">
                              NEO-PI-R
                            </span>
                          )}
                          {selectedTests.includes('pes') && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              PES
                            </span>
                          )}
                          {selectedTests.includes('pcl') && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                              PCL-R
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-500">None selected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">
                      Estimated Time
                    </div>
                    <div className="text-slate-900">
                      {selectedTests.length > 0
                        ? `${selectedTests.length * 5}-${selectedTests.length * 10} minutes`
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">
                      AI Integration
                    </div>
                    <div className="text-slate-900">
                      {connectionStatus === 'success' ? (
                        <span className="flex items-center text-green-600">
                          <Check className="mr-1 h-4 w-4" />
                          Gemini Configured
                        </span>
                      ) : (
                        <span className="text-slate-500">Not configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <div className="flex items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900">MVP Information</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      For the initial release, we're focusing on empathy evaluation using the Perth Empathy Scale (PES). Additional test types will be available in future updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderCreationStatus()}
    </div>
  );
};

export default CreateTestPage;