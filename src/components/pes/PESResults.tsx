import React from 'react';
import { PESScores } from '../../lib';

interface PESResultsProps {
  scores: PESScores;
  onClose: () => void;
}

const PESResults: React.FC<PESResultsProps> = ({ scores, onClose }) => {
  const getScoreInterpretation = (score: number) => {
    if (score >= 4.5) return 'Exceptional';
    if (score >= 4.0) return 'Very High';
    if (score >= 3.5) return 'High';
    if (score >= 3.0) return 'Moderate';
    if (score >= 2.5) return 'Below Average';
    return 'Low';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Assessment Results</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall Score */}
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">Overall Empathy Score</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">Total Score</span>
                <span className={`text-2xl font-semibold ${getScoreColor(scores.total_score)}`}>
                  {scores.total_score.toFixed(1)}/5.0
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full">
                <div
                  className="h-4 bg-blue-600 rounded-full"
                  style={{ width: `${(scores.total_score / 5) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-gray-600">
                {getScoreInterpretation(scores.total_score)} level of empathy
              </p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cognitive Empathy */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Cognitive Empathy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Positive (PCE)</span>
                    <span className={getScoreColor(scores.pce_score)}>
                      {scores.pce_score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${(scores.pce_score / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Negative (NCE)</span>
                    <span className={getScoreColor(scores.nce_score)}>
                      {scores.nce_score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-600 rounded-full"
                      style={{ width: `${(scores.nce_score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Affective Empathy */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Affective Empathy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Positive (PAE)</span>
                    <span className={getScoreColor(scores.pae_score)}>
                      {scores.pae_score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${(scores.pae_score / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Negative (NAE)</span>
                    <span className={getScoreColor(scores.nae_score)}>
                      {scores.nae_score.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-red-600 rounded-full"
                      style={{ width: `${(scores.nae_score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Interpretation</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong>Cognitive Empathy</strong> measures your ability to understand others' perspectives and emotions.
                {scores.pce_score >= 4.0 ? (
                  <span> Your high positive cognitive empathy score indicates strong ability to understand others' positive emotions.</span>
                ) : scores.pce_score >= 3.0 ? (
                  <span> Your moderate positive cognitive empathy score shows good understanding of others' positive emotions.</span>
                ) : (
                  <span> Your positive cognitive empathy score suggests room for improvement in understanding others' positive emotions.</span>
                )}
              </p>
              <p>
                {scores.nce_score >= 4.0 ? (
                  <span>Your high negative cognitive empathy score shows strong ability to understand others' negative emotions.</span>
                ) : scores.nce_score >= 3.0 ? (
                  <span>Your moderate negative cognitive empathy score indicates good understanding of others' negative emotions.</span>
                ) : (
                  <span>Your negative cognitive empathy score suggests room for improvement in understanding others' negative emotions.</span>
                )}
              </p>
              <p>
                <strong>Affective Empathy</strong> measures your emotional response to others' feelings.
                {scores.pae_score >= 4.0 ? (
                  <span> Your high positive affective empathy score indicates strong emotional resonance with others' positive feelings.</span>
                ) : scores.pae_score >= 3.0 ? (
                  <span> Your moderate positive affective empathy score shows good emotional response to others' positive feelings.</span>
                ) : (
                  <span> Your positive affective empathy score suggests room for improvement in responding to others' positive feelings.</span>
                )}
              </p>
              <p>
                {scores.nae_score >= 4.0 ? (
                  <span>Your high negative affective empathy score shows strong emotional response to others' negative feelings.</span>
                ) : scores.nae_score >= 3.0 ? (
                  <span>Your moderate negative affective empathy score indicates good emotional response to others' negative feelings.</span>
                ) : (
                  <span>Your negative affective empathy score suggests room for improvement in responding to others' negative feelings.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PESResults; 