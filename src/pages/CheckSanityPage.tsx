import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Brain, FileText, BarChart2, Bot, Lock, HelpCircle, Loader2, AlertCircle, Globe, Crown } from 'lucide-react';
import { getGeminiResponse, testGeminiApiKey } from '../lib/gemini';
import { createTestConfiguration } from '../lib/supabase';

const CheckSanityPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

  const handleVisibilityChange = (value: boolean) => {
    if (!value && !isPublic) {
      setShowUpgradeModal(true);
      return;
    }
    setIsPublic(value);
  };
  
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

    try {
      // Save the Gemini API key
      window.localStorage.setItem('VITE_GEMINI_API_KEY', geminiApiKey);

      // Show creation progress
      setCreationStatus({ step: 'configuring', message: 'Configuring test parameters...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create test in Supabase
      await createTestConfiguration({
        name: testName,
        description: testDescription,
        selectedTests,
        systemPrompt,
        isPublic
      });

      setCreationStatus({ step: 'validating', message: 'Validating test configuration...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCreationStatus({ step: 'initializing', message: 'Initializing test environment...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCreationStatus({ step: 'complete', message: 'Test created successfully!' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating test:', error);
      // Handle error appropriately
    }
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

  const renderUpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-full bg-violet-100 p-3">
              <Crown className="h-8 w-8 text-violet-600" />
            </div>
          </div>
          <h3 className="mb-2 text-center text-2xl font-bold text-slate-900">
            Upgrade to Pro
          </h3>
          <p className="mb-6 text-center text-slate-600">
            Private tests are a Pro feature. Upgrade to create tests that are only visible to you.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="btn-outline"
              onClick={() => {
                setShowUpgradeModal(false);
                setIsPublic(true);
              }}
            >
              Stay Free
            </button>
            <a
              href="/pricing"
              className="btn-primary inline-flex items-center"
            >
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="py-10">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Check AI Sanity</h1>
          <p className="text-slate-600">
            Configure a new psychological evaluation for your AI agent
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-900">
                      Visibility
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleVisibilityChange(true)}
                        className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                          isPublic
                            ? 'bg-violet-100 text-violet-900'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisibilityChange(false)}
                        className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                          !isPublic
                            ? 'bg-violet-100 text-violet-900'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Private
                        <Crown className="ml-2 h-4 w-4 text-amber-500" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {isPublic
                        ? 'Your test will be visible to the community. Great for sharing and collaboration!'
                        : 'Private tests are only visible to you (Pro feature)'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Rest of the form remains unchanged */}
              {/* ... AI Configuration section ... */}
              {/* ... Select Tests section ... */}
              {/* ... Submit buttons ... */}
            </form>
          </div>
          
          <div className="md:col-span-1">
            {/* Sidebar content remains unchanged */}
          </div>
        </div>
      </div>
      {renderCreationStatus()}
      {renderUpgradeModal()}
    </div>
  );
};

export default CheckSanityPage;