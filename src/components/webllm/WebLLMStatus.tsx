import React, { useState, useEffect } from 'react';
import { Brain, Cpu, Zap, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { LocalLLM } from '../../lib/webllm';

interface WebLLMStatusProps {
  onModelReady?: (isReady: boolean) => void;
}

const WebLLMStatus: React.FC<WebLLMStatusProps> = ({ onModelReady }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check WebGPU support
    const webGPUSupported = LocalLLM.checkWebGPUSupport();
    setIsSupported(webGPUSupported);
    
    // Set recommended model
    const recommendedModel = LocalLLM.getRecommendedModel();
    setSelectedModel(recommendedModel);
  }, []);

  useEffect(() => {
    if (onModelReady) {
      onModelReady(isReady);
    }
  }, [isReady, onModelReady]);

  const handleInitialize = async () => {
    if (!selectedModel) return;

    setIsInitializing(true);
    setError(null);
    setProgress(0);

    try {
      const llm = new LocalLLM((progressValue) => {
        setProgress(progressValue);
      });

      await llm.initialize(selectedModel);
      setIsReady(true);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize local LLM');
      setIsReady(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const getModelSize = (modelId: string): string => {
    if (modelId.includes('3B')) return '~2.0GB';
    if (modelId.includes('1B') || modelId.includes('1.5B')) return '~800MB';
    if (modelId.includes('2b')) return '~1.3GB';
    return '~1.0GB';
  };

  const getModelDescription = (modelId: string): string => {
    if (modelId.includes('Llama-3.2-3B')) return 'Best performance, requires more memory';
    if (modelId.includes('Llama-3.2-1B')) return 'Lightweight, good for mobile devices';
    if (modelId.includes('Phi-3.5')) return 'Balanced performance and efficiency';
    if (modelId.includes('Qwen2.5')) return 'Fast inference, moderate size';
    if (modelId.includes('gemma-2')) return 'Google model, good quality';
    return 'Local language model';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Brain className="h-6 w-6 text-violet-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Local LLM Status</h3>
          <p className="text-sm text-slate-600">Run AI models directly in your browser</p>
        </div>
      </div>

      {/* WebGPU Support Check */}
      <div className="mb-6 p-4 rounded-lg bg-slate-50">
        <div className="flex items-center space-x-3">
          {isSupported ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">
              WebGPU Support: {isSupported ? 'Available' : 'Not Available'}
            </p>
            <p className="text-xs text-slate-600">
              {isSupported 
                ? 'GPU acceleration available for faster inference'
                : 'Will use CPU inference (slower but still functional)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      {!isReady && (
        <div className="mb-6">
          <label htmlFor="model-select" className="block text-sm font-medium text-slate-700 mb-2">
            Select Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            disabled={isInitializing}
          >
            {LocalLLM.getAvailableModels().map((model) => (
              <option key={model} value={model}>
                {model.split('-')[0]} {model.includes('3B') ? '3B' : model.includes('1B') ? '1B' : '2B'} - {getModelSize(model)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-600">
            {getModelDescription(selectedModel)}
          </p>
        </div>
      )}

      {/* Status Display */}
      <div className="space-y-4">
        {!isReady && !isInitializing && (
          <button
            onClick={handleInitialize}
            disabled={!selectedModel}
            className="w-full inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 h-4 w-4" />
            Initialize Local LLM ({getModelSize(selectedModel)})
          </button>
        )}

        {isInitializing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Downloading and initializing model...</span>
              <span className="font-medium text-slate-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600">
              This may take a few minutes depending on your internet connection...
            </p>
          </div>
        )}

        {isReady && (
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Local LLM Ready</p>
              <p className="text-xs text-green-700">
                Model loaded and ready for empathy assessment
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Initialization Failed</p>
              <p className="text-xs text-red-700">{error}</p>
              <button
                onClick={handleInitialize}
                className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Performance Info */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-900 mb-2">Performance Information</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {isSupported ? 'GPU Accelerated' : 'CPU Only'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">
              {selectedModel.includes('3B') ? 'High Quality' : 'Fast Inference'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebLLMStatus;