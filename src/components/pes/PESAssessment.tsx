import React, { useState, useEffect } from 'react';
import { PESItem, PESSession, PESScores } from '../../lib/pesAgent';
import { mockPESAgentClient } from '../../lib/mockPESAgent';

interface PESAssessmentProps {
  agentId: string;
  onComplete?: (scores: PESScores) => void;
}

export const PESAssessment: React.FC<PESAssessmentProps> = ({ agentId, onComplete }) => {
  const [items, setItems] = useState<PESItem[]>([]);
  const [session, setSession] = useState<PESSession | null>(null);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  useEffect(() => {
    initializeAssessment();
  }, [agentId]);

  const initializeAssessment = async () => {
    try {
      setLoading(true);
      const [items, session] = await Promise.all([
        mockPESAgentClient.getPESItems(),
        mockPESAgentClient.startSession(agentId)
      ]);
      setItems(items);
      setSession(session);
      setLoading(false);
    } catch (err) {
      setError('Failed to initialize assessment');
      setLoading(false);
    }
  };

  const handleResponse = async (value: number) => {
    if (!session) return;

    const currentItem = items[currentItemIndex];
    setResponses(prev => ({ ...prev, [currentItem.id]: value }));

    try {
      await mockPESAgentClient.recordResponse(session.id, currentItem.id, value);
      
      if (currentItemIndex < items.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
      } else {
        const scores = await mockPESAgentClient.calculateScores(session.id);
        onComplete?.(scores);
      }
    } catch (err) {
      setError('Failed to record response');
    }
  };

  if (loading) {
    return <div>Loading assessment...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!session || items.length === 0) {
    return <div>No assessment available</div>;
  }

  const currentItem = items[currentItemIndex];
  const progress = ((currentItemIndex + 1) / items.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentItemIndex + 1} of {items.length}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{currentItem.question}</h3>
        <p className="text-sm text-gray-600 mb-6">{currentItem.item_guidance}</p>

        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleResponse(value)}
              className={`p-4 rounded-lg text-center transition-colors ${
                responses[currentItem.id] === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>
      </div>
    </div>
  );
};