import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, FileText, BarChart2, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { mockConfigurations } from '../data/mockData';
import { TestConfiguration } from '../types';
import { perthEmpathyScale } from '../lib/pes';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  icon: React.ReactNode;
}

const TestProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<TestConfiguration | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<Record<string, number>>({});

  useEffect(() => {
    const foundTest = mockConfigurations.find(t => t.id === id);
    if (foundTest) {
      setTest(foundTest);
      simulateTestProgress();
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const steps: ProgressStep[] = [
    {
      id: 'initialization',
      title: 'Test Initialization',
      description: 'Setting up test parameters and loading questions',
      status: 'pending',
      icon: <Brain className="h-6 w-6" />
    },
    {
      id: 'execution',
      title: 'Test Execution',
      description: 'Processing responses and collecting data',
      status: 'pending',
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 'analysis',
      title: 'Analysis',
      description: 'Analyzing responses and generating insights',
      status: 'pending',
      icon: <BarChart2 className="h-6 w-6" />
    }
  ];

  const simulateTestProgress = async () => {
    // Simulate initialization
    setCurrentStep(0);
    updateStepStatus(0, 'processing');
    await delay(2000);
    updateStepStatus(0, 'completed');

    // Simulate execution
    setCurrentStep(1);
    updateStepStatus(1, 'processing');
    await delay(3000);
    updateStepStatus(1, 'completed');

    // Simulate analysis
    setCurrentStep(2);
    updateStepStatus(2, 'processing');
    await delay(2000);

    // Get stored responses from localStorage
    const responses = JSON.parse(localStorage.getItem(`test_${id}_responses`) || '{}');
    
    // Calculate actual empathy scores
    const scores = await perthEmpathyScale.calculateScores(responses);
    setAnalysis(scores);
    
    // Store scores for results page
    localStorage.setItem(`test_${id}_scores`, JSON.stringify(scores));

    updateStepStatus(2, 'completed');

    // Navigate to results after a brief delay
    await delay(1500);
    navigate(`/results/${id}`);
  };

  const updateStepStatus = (index: number, status: ProgressStep['status']) => {
    steps[index].status = status;
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  if (!test) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-violet-600" />
          <p className="mt-4 text-slate-600">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-900">{test.name}</h1>
            <p className="text-slate-600">{test.description}</p>
          </div>

          <div className="mb-12">
            {steps.map((step, index) => (
              <div key={step.id} className="relative pb-12">
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute left-6 top-8 h-full w-0.5 ${
                      step.status === 'completed' ? 'bg-violet-600' : 'bg-slate-200'
                    }`}
                  ></div>
                )}
                <div className="relative flex items-start">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      step.status === 'completed'
                        ? 'bg-violet-600 text-white'
                        : step.status === 'processing'
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step.status === 'processing' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : step.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
                    <p className="text-slate-600">{step.description}</p>
                    {step.status === 'completed' && step.id === 'analysis' && (
                      <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                        <h3 className="mb-2 text-sm font-medium text-slate-900">Analysis Summary</h3>
                        <div className="space-y-2">
                          {Object.entries(analysis).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">
                                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                              </span>
                              <span className="font-medium text-slate-900">{Math.round(value)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              {currentStep < steps.length - 1
                ? 'Please wait while we process your test...'
                : 'Redirecting to detailed results...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProgressPage;