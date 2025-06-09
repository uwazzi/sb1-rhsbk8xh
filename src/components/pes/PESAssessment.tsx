import React, { useState, useEffect } from 'react';
import { Brain, Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { pesAgentClient, PESItem, PESSession } from '../../lib/pesAgent';

interface PESAssessmentProps {
  agentId: string;
  onComplete: (sessionId: string, scores: any) => void;
  onCancel: () => void;
}

const PESAssessment: React.FC<PESAssessmentProps> = ({ agentId, onComplete, onCancel }) => {
  const [items, setItems] = useState<PESItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [session, setSession] = useState<PESSession | null>(null);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    initializeAssessment();
  }, [agentId]);

  const initializeAssessment = async () => {
    try {
      setLoading(true);
      
      // Get PES items
      const pesItems = await pesAgentClient.getPESItems();
      setItems(pesItems);

      // Start session
      const newSession = await pesAgentClient.startSession(agentId, {
        assessment_type: 'pes',
        version: '1.0'
      });
      setSession(newSession);
      setStartTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (value: number) => {
    if (!session || !items[currentItemIndex]) return;

    const item = items[currentItemIndex];
    const responseTime = Date.now() - startTime;

    try {
      // Record response
      await pesAgentClient.recordResponse(
        session.id,
        item.id,
        value,
        undefined,
        responseTime
      );

      // Update local state
      setResponses(prev => ({ ...prev, [item.id]: value }));

      // Move to next item or complete
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        await completeAssessment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record response');
    }
  };

  const completeAssessment = async () => {
    if (!session) return;

    try {
      setSubmitting(true);
      const scores = await pesAgentClient.calculateScores(session.id);
      onComplete(session.id, scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const goToPrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
      setStartTime(Date.now());
    }
  };

  const getSubscaleColor = (subscale: string) => {
    switch (subscale) {
      case 'NCE': return 'bg-red-100 text-red-800';
      case 'PCE': return 'bg-green-100 text-green-800';
      case 'NAE': return 'bg-blue-100 text-blue-800';
      case 'PAE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscaleName = (subscale: string) => {
    switch (subscale) {
      case 'NCE': return 'Negative Cognitive Empathy';
      case 'PCE': return 'Positive Cognitive Empathy';
      case 'NAE': return 'Negative Affective Empathy';
      case 'PAE': return 'Positive Affective Empathy';
      default: return subscale;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
          <p className="mt-4 text-slate-600">Initializing PES Assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
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

  if (submitting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
          <p className="mt-4 text-slate-600">Calculating empathy scores...</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Perth Empathy Scale Assessment</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>Item {currentItemIndex + 1} of {items.length}</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-slate-600 text-right">
          {Math.round(progress)}% Complete
        </div>
      </div>

      {/* Current Item */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getSubscaleColor(currentItem.subscale)}`}>
              {getSubscaleName(currentItem.subscale)}
            </span>
            {currentItem.item_guidance && (
              <div className="group relative">
                <Info className="h-5 w-5 text-slate-400 cursor-help" />
                <div className="absolute right-0 top-6 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-sm rounded-lg shadow-lg z-10">
                  {currentItem.item_guidance}
                </div>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            {currentItem.question}
          </h3>
          
          <p className="text-slate-600 text-sm">
            Please rate how much you agree with this statement on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree).
          </p>
        </div>

        {/* Likert Scale */}
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleResponse(value)}
                className="flex flex-col items-center p-4 rounded-lg border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 group-hover:border-violet-500 group-hover:bg-violet-500 transition-all duration-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-white">
                    {value}
                  </span>
                </div>
                <span className="mt-2 text-xs text-slate-500 text-center">
                  {value === 1 && 'Strongly Disagree'}
                  {value === 2 && 'Disagree'}
                  {value === 3 && 'Neutral'}
                  {value === 4 && 'Agree'}
                  {value === 5 && 'Strongly Agree'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentItemIndex === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>

          <button
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel Assessment
          </button>
        </div>
      </div>

      {/* Response Summary */}
      <div className="mt-6 bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-900 mb-3">Progress Summary</h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          {['NCE', 'PCE', 'NAE', 'PAE'].map((subscale) => {
            const subscaleItems = items.filter(item => item.subscale === subscale);
            const answeredItems = subscaleItems.filter(item => responses[item.id] !== undefined);
            
            return (
              <div key={subscale} className="bg-white rounded-lg p-3">
                <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getSubscaleColor(subscale)}`}>
                  {subscale}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {answeredItems.length}/{subscaleItems.length} items
                </div>
                <div className="mt-1 w-full bg-slate-200 rounded-full h-1">
                  <div
                    className="bg-violet-600 h-1 rounded-full"
                    style={{ width: `${(answeredItems.length / subscaleItems.length) * 100}%` }}
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

export default PESAssessment;