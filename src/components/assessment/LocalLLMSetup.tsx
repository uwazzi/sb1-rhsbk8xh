import React, { useState, useEffect } from 'react';
import { LocalLLM } from '../../lib/webllm';
import { Button } from '../ui/button';
import { AlertTriangle, Download, Cpu, Brain, RefreshCw, Smartphone, Laptop, Info, Trash2, Shield } from 'lucide-react';

interface LocalLLMSetupProps {
  onModelReady: () => void;
  onBack: () => void;
}

interface ModelInfo {
  name: string;
  size: string;
  memory: string;
  speed: string;
  quality: string;
  description: string;
  requirements: string[];
  useCase: string;
  recommendedFor: 'mobile' | 'desktop' | 'both';
}

const MODEL_INFO: Record<string, ModelInfo> = {
  'Llama-3.2-3B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3.2 3B',
    size: '3.2GB',
    memory: '4GB RAM',
    speed: 'Fast',
    quality: 'High',
    description: 'Balanced model with good performance and quality',
    requirements: ['WebGPU', '4GB RAM'],
    useCase: 'General purpose, good for most tasks',
    recommendedFor: 'desktop'
  },
  'Llama-3.2-1B-Instruct-q4f32_1-MLC': {
    name: 'Llama 3.2 1B',
    size: '1.2GB',
    memory: '2GB RAM',
    speed: 'Very Fast',
    quality: 'Good',
    description: 'Lightweight model optimized for speed',
    requirements: ['WebGPU', '2GB RAM'],
    useCase: 'Quick responses, mobile devices',
    recommendedFor: 'mobile'
  },
  'Phi-3.5-mini-instruct-q4f16_1-MLC': {
    name: 'Phi 3.5 Mini',
    size: '1.5GB',
    memory: '2GB RAM',
    speed: 'Fast',
    quality: 'Good',
    description: 'Efficient model with good quality',
    requirements: ['WebGPU', '2GB RAM'],
    useCase: 'General purpose, mobile-friendly',
    recommendedFor: 'both'
  },
  'Qwen2.5-1.5B-Instruct-q4f16_1-MLC': {
    name: 'Qwen 2.5 1.5B',
    size: '1.5GB',
    memory: '2GB RAM',
    speed: 'Fast',
    quality: 'Good',
    description: 'Balanced model for various tasks',
    requirements: ['WebGPU', '2GB RAM'],
    useCase: 'General purpose, good for most devices',
    recommendedFor: 'both'
  },
  'gemma-2-2b-it-q4f16_1-MLC': {
    name: 'Gemma 2B',
    size: '2GB',
    memory: '3GB RAM',
    speed: 'Fast',
    quality: 'High',
    description: 'High-quality model with good performance',
    requirements: ['WebGPU', '3GB RAM'],
    useCase: 'Quality-focused tasks, desktop use',
    recommendedFor: 'desktop'
  }
};

export const LocalLLMSetup: React.FC<LocalLLMSetupProps> = ({ onModelReady, onBack }) => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelReady, setModelReady] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showDownloadWarning, setShowDownloadWarning] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [localLLM] = useState(() => new LocalLLM((progress: number) => {
    setDownloadProgress(progress);
  }));
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const models = LocalLLM.getAvailableModels();
    setAvailableModels(models);
    
    const recommendedModel = LocalLLM.getRecommendedModel();
    setSelectedModel(recommendedModel);

    checkPermissionsAndCache();
  }, []);

  const checkPermissionsAndCache = async () => {
    setCacheStatus('checking');
    setError(null);

    try {
      // Request storage permission
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'persistent-storage' });
        setPermissionStatus(permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          throw new Error('Storage permission denied');
        }
      }

      // Try to request storage quota
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        if (!isPersisted) {
          console.warn('Storage persistence request was denied');
        }
      }

      // Try to open the cache with a unique name
      const cacheName = `webllm-cache-${Date.now()}`;
      const cache = await caches.open(cacheName);
      
      // Try to add and delete a test entry
      const testUrl = `/test-cache-${Date.now()}`;
      await cache.add(testUrl);
      await cache.delete(testUrl);
      
      // Clean up the test cache
      await caches.delete(cacheName);
      
      setCacheStatus('available');
    } catch (err) {
      console.error('Permission/Cache check error:', err);
      setCacheStatus('unavailable');
      
      let errorMessage = 'Unable to access required permissions. This might be due to:\n\n';
      
      if (err instanceof Error && err.message.includes('permission')) {
        errorMessage += '1. Storage permission was denied\n';
        errorMessage += '2. Browser privacy settings are blocking access\n';
        errorMessage += '3. Running in private/incognito mode\n\n';
        errorMessage += 'Please:\n';
        errorMessage += '1. Allow storage permissions when prompted\n';
        errorMessage += '2. Use a different browser (Chrome or Edge recommended)\n';
        errorMessage += '3. Disable private/incognito mode';
      } else {
        errorMessage += '1. Browser privacy settings blocking cache access\n';
        errorMessage += '2. Running in private/incognito mode\n';
        errorMessage += '3. Insufficient storage permissions\n\n';
        errorMessage += 'Please try:\n';
        errorMessage += '1. Using a different browser (Chrome or Edge recommended)\n';
        errorMessage += '2. Clearing your browser cache\n';
        errorMessage += '3. Allowing storage permissions for this site';
      }
      
      setError(errorMessage);
    }
  };

  const requestPermissions = async () => {
    try {
      // Request storage permission
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'persistent-storage' });
        if (permissionStatus.state === 'prompt') {
          await navigator.storage.persist();
        }
      }

      // Request storage quota
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        console.log('Storage estimate:', estimate);
      }

      await checkPermissionsAndCache();
    } catch (err) {
      console.error('Permission request error:', err);
      setError('Failed to request permissions. Please try using a different browser or enabling permissions manually.');
    }
  };

  const clearCache = async () => {
    try {
      const keys = await caches.keys();
      const webllmCaches = keys.filter(key => key.startsWith('webllm-cache'));
      await Promise.all(webllmCaches.map(key => caches.delete(key)));
      await checkPermissionsAndCache();
    } catch (err) {
      console.error('Cache clear error:', err);
      setError('Failed to clear cache. Please try manually clearing your browser cache.');
    }
  };

  const handleModelSelect = (modelId: string) => {
    if (cacheStatus === 'unavailable') {
      setError('Please fix permission and cache access issues before selecting a model.');
      return;
    }
    setSelectedModel(modelId);
    setModelReady(false);
    setError(null);
    setShowDownloadWarning(true);
  };

  const handleInitializeModel = async () => {
    if (!selectedModel) return;
    
    setError(null);
    setDownloadProgress(0);
    setIsInitializing(true);
    setShowDownloadWarning(false);
    
    try {
      // Clear any existing cache for this model
      try {
        const keys = await caches.keys();
        const modelCaches = keys.filter(key => key.includes(selectedModel));
        await Promise.all(modelCaches.map(key => caches.delete(key)));
      } catch (err) {
        console.warn('Cache clear warning:', err);
      }

      // Initialize the model
      await localLLM.initialize(selectedModel);
      
      if (!localLLM.isReady()) {
        throw new Error('Model initialization failed. Please try again.');
      }
      
      setModelReady(true);
      onModelReady();
    } catch (err) {
      console.error('Model initialization error:', err);
      let errorMessage = 'Failed to initialize model';
      
      if (err instanceof Error) {
        if (err.message.includes('Cache') || err.message.includes('permission')) {
          errorMessage = 'Failed to access required permissions. Please try:\n' +
            '1. Using a different browser (Chrome or Edge recommended)\n' +
            '2. Clearing your browser cache\n' +
            '3. Allowing storage permissions for this site';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setModelReady(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setDownloadProgress(0);
    await requestPermissions();
  };

  const isWebGPUSupported = LocalLLM.checkWebGPUSupport();

  if (!isWebGPUSupported) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">WebGPU Not Supported</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your browser does not support WebGPU, which is required for running local LLMs.
            Please use a modern browser that supports WebGPU, such as Chrome or Edge.
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Local LLM Setup</h2>
        
        {/* Permission and Cache Status */}
        {cacheStatus === 'checking' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-600">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              <span>Checking permissions and cache availability...</span>
            </div>
          </div>
        )}

        {cacheStatus === 'unavailable' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Permissions Required</h4>
                <p className="text-red-700 text-sm whitespace-pre-line mb-4">
                  {error}
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={requestPermissions}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Request Permissions
                  </Button>
                  <Button
                    onClick={clearCache}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Model Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModels.map((modelId) => {
              const model = MODEL_INFO[modelId];
              if (!model) return null;

              const isSelected = selectedModel === modelId;
              const isRecommended = model.recommendedFor === 'both' || 
                (model.recommendedFor === 'mobile' && /Mobile|Android|iPhone/i.test(navigator.userAgent)) ||
                (model.recommendedFor === 'desktop' && !/Mobile|Android|iPhone/i.test(navigator.userAgent));

              return (
                <div
                  key={modelId}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  } ${cacheStatus === 'unavailable' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleModelSelect(modelId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{model.name}</h3>
                    <div className="flex gap-2">
                      {model.recommendedFor === 'mobile' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                          <Smartphone className="h-3 w-3 mr-1" />
                          Mobile
                        </span>
                      )}
                      {model.recommendedFor === 'desktop' && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center">
                          <Laptop className="h-3 w-3 mr-1" />
                          Desktop
                        </span>
                      )}
                      {model.recommendedFor === 'both' && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center">
                          <Cpu className="h-3 w-3 mr-1" />
                          Universal
                        </span>
                      )}
                      {isRecommended && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>{model.description}</p>
                    <div className="flex gap-4">
                      <span>Size: {model.size}</span>
                      <span>Memory: {model.memory}</span>
                    </div>
                    <div className="flex gap-4">
                      <span>Speed: {model.speed}</span>
                      <span>Quality: {model.quality}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download Warning */}
          {showDownloadWarning && selectedModel && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Download Warning</h4>
                  <p className="text-yellow-700 text-sm">
                    This model ({MODEL_INFO[selectedModel]?.size}) will be downloaded to your device.
                    {/Mobile|Android|iPhone/i.test(navigator.userAgent) && 
                      " Since you're on a mobile device, this may incur data charges from your carrier."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Download Progress */}
          {selectedModel && !modelReady && downloadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading model...</span>
                <span>{Math.round(downloadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                This may take a few minutes depending on your internet connection.
                The model will be cached for future use.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onBack}
              variant="outline"
              disabled={isInitializing}
            >
              Back
            </Button>
            {selectedModel && !modelReady && cacheStatus === 'available' && (
              <Button
                onClick={handleInitializeModel}
                disabled={!selectedModel || downloadProgress > 0 || isInitializing}
              >
                {isInitializing ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </div>
                ) : downloadProgress > 0 ? (
                  <div className="flex items-center">
                    <Download className="h-4 w-4 mr-2 animate-bounce" />
                    Downloading...
                  </div>
                ) : (
                  'Download & Initialize'
                )}
              </Button>
            )}
            {modelReady && (
              <Button
                onClick={onModelReady}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 