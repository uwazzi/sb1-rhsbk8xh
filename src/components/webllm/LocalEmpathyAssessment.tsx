import React, { useState, useEffect } from 'react';
import { Brain, Zap, CheckCircle, AlertCircle, BarChart3, Clock } from 'lucide-react';
import { LocalLLM, EmpathyAnalysisResult } from '../../lib/webllm';
import { pesQuestions } from '../../data/mockData';
import WebLLMStatus from './WebLLMStatus';

interface LocalEmpathyAssessmentProps {
  onComplete: (results: EmpathyAnalysisResult) => void;
  onCancel: () => void;
  personalityPrompt?: string;
}

const LocalEmpathyAssessment: React.FC<LocalEmpathyAssessmentProps> = ({
  onComplete,
  onCancel,
  personalityPrompt
}) => {
  const [llm] = useState(() => new LocalLLM());
  const [isModelReady, setIsModelReady] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(true);

  const currentQuestion = pesQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / pesQuestions.length) * 100;

  useEffect(() => {
    // Hide status panel once model is ready
    if (isModelReady) {
      setShowStatus(false);
    }
  }, [isModelReady]);

  const handleGenerateResponse = async () => {
    if (!currentQuestion || !isModelReady) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await llm.generateEmpathyResponse(
        currentQuestion.prompt,
        personalityPrompt
      );
      setCurrentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate response');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!currentResponse.trim()) return;

    // Save current response
    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: currentResponse
    };
    setResponses(updatedResponses);

    if (currentQuestionIndex < pesQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentResponse('');
    } else {
      // Complete assessment
      completeAssessment(updatedResponses);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentResponse(responses[pesQuestions[currentQuestionIndex - 1].id] || '');
    }
  };

  const completeAssessment = async (finalResponses: Record<string, string>) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const results = await llm.assessEmpathy(finalResponses);
      onComplete(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze responses');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showStatus || !isModelReady) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Local LLM Empathy Assessment</h2>
          <p className="text-slate-600">
            Run empathy evaluation entirely in your browser with privacy and offline capability
          </p>
        </div>

        <WebLLMStatus onModelReady={setIsModelReady} />

        {personalityPrompt && (
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-900">Custom AI Personality</h4>
                <p className="text-sm text-amber-700 mt-1">
                  The local LLM will use your custom personality prompt to generate contextual empathy responses.
                </p>
                <div className="mt-2 p-3 bg-white rounded border border-amber-200">
                  <p className="text-xs text-slate-700 line-clamp-3">{personalityPrompt}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Assessment Options
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Analyzing Empathy Responses</h3>
          <p className="mt-2 text-slate-600">
            Local LLM is processing your responses to generate empathy scores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Local LLM Empathy Assessment</h2>
            <p className="text-slate-600">Question {currentQuestionIndex + 1} of {pesQuestions.length}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Brain className="h-4 w-4 text-green-600" />
            <span>Local LLM Active</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="mb-6">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 mb-4">
            {currentQuestion.category}
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            {currentQuestion.question}
          </h3>
          
          <div className="rounded-lg bg-slate-50 p-4 mb-6">
            <p className="text-slate-700">{currentQuestion.prompt}</p>
          </div>
        </div>

        {/* AI Response Generation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900">AI Response</h4>
            <button
              onClick={handleGenerateResponse}
              disabled={isGenerating}
              className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate with Local LLM
                </>
              )}
            </button>
          </div>

          <textarea
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            placeholder="Click 'Generate with Local LLM' to create an AI response, or write your own..."
            className="w-full h-32 rounded-lg border border-slate-300 p-4 focus:border-violet-500 focus:ring-violet-500"
            disabled={isGenerating}
          />

          {personalityPrompt && currentResponse && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ✨ Response generated with custom personality context
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-start space-x-3 rounded-lg bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ← Previous
          </button>

          <button
            onClick={onCancel}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel Assessment
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!currentResponse.trim()}
            className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {currentQuestionIndex === pesQuestions.length - 1 ? (
              <>
                Complete Assessment
                <CheckCircle className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next →
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Assessment Progress</h4>
        <div className="grid grid-cols-4 gap-4">
          {['NCE', 'PCE', 'NAE', 'PAE'].map((subscale) => {
            const subscaleQuestions = pesQuestions.filter(q => 
              q.category.toLowerCase().includes(subscale.toLowerCase())
            );
            const answeredQuestions = subscaleQuestions.filter(q => responses[q.id]);
            
            return (
              <div key={subscale} className="text-center">
                <div className="text-sm font-medium text-slate-900">{subscale}</div>
                <div className="text-xs text-slate-600">
                  {answeredQuestions.length}/{subscaleQuestions.length}
                </div>
                <div className="mt-1 w-full bg-slate-200 rounded-full h-1">
                  <div
                    className="bg-violet-600 h-1 rounded-full"
                    style={{ 
                      width: `${subscaleQuestions.length > 0 ? (answeredQuestions.length / subscaleQuestions.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LocalEmpathyAssessment;