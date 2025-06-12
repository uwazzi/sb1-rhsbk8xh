import React, { useState } from 'react';
import { RemoteLLM, RemoteLLMConfig } from '../../lib/remoteLLM';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface RemoteAgentTestingProps {
  apiKey: string;
  onComplete: (results: TestResult) => void;
}

interface TestResult {
  response: string;
  metrics: {
    empathy: number;
    coherence: number;
    relevance: number;
    responseTime: number;
  };
}

export const RemoteAgentTesting: React.FC<RemoteAgentTestingProps> = ({
  apiKey,
  onComplete
}) => {
  const [scenario, setScenario] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TestResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleTest = async () => {
    if (!scenario.trim()) {
      setError('Please provide a scenario to test');
      return;
    }

    setIsTesting(true);
    setError(null);
    setProgress(0);
    setResults(null);

    try {
      const config: RemoteLLMConfig = {
        apiKey,
        model: 'gpt-4', // or your preferred model
        temperature: 0.7,
        maxTokens: 1000
      };

      const remoteLLM = new RemoteLLM(config);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const testResult = await remoteLLM.testAgentBehavior(scenario, personalityPrompt);

      clearInterval(progressInterval);
      setProgress(100);
      setResults(testResult);
      onComplete(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test agent behavior');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Remote Agent Testing</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Scenario
            </label>
            <Textarea
              value={scenario}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScenario(e.target.value)}
              placeholder="Describe a scenario to test the agent's behavior..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Personality Prompt (Optional)
            </label>
            <Textarea
              value={personalityPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPersonalityPrompt(e.target.value)}
              placeholder="Define the agent's personality traits and behavior..."
              className="min-h-[100px]"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isTesting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                Testing agent behavior... {progress}%
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Test completed successfully!</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-medium">Agent Response:</h3>
                <p className="text-sm">{results.response}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Metrics:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Empathy Score</p>
                    <p className="text-2xl font-bold">{results.metrics.empathy}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Coherence</p>
                    <p className="text-2xl font-bold">{results.metrics.coherence}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Relevance</p>
                    <p className="text-2xl font-bold">{results.metrics.relevance}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Response Time</p>
                    <p className="text-2xl font-bold">{results.metrics.responseTime}ms</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleTest}
            disabled={isTesting || !scenario.trim()}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Agent Behavior'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}; 