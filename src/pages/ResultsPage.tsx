import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Brain, FileText, BarChart2, Crown, Lock, Globe } from 'lucide-react';
import RadarChart from '../components/results/RadarChart';
import { ChartData } from '../types';
import { supabase } from '../lib/supabase';

interface TestConfiguration {
  id: string;
  userId: string;
  name: string;
  description: string;
  tests: string[];
  aiSystemPrompt?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
}

interface TestResult {
  id: string;
  test_id: string;
  scores: any;
  summary: string;
  created_at: string;
}

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [testConfig, setTestConfig] = useState<TestConfiguration | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canViewResults, setCanViewResults] = useState(false);
  
  useEffect(() => {
    checkAuthAndLoadResults();
  }, [id]);

  const checkAuthAndLoadResults = async () => {
    try {
      setLoading(true);
      
      // Check authentication status
      const { data: { session } } = await supabase.auth.getSession();
      const authenticated = !!session?.user;
      setIsAuthenticated(authenticated);
      
      // Fetch test configuration
      const { data: testData, error: testError } = await supabase
        .from('test_configurations')
        .select('*')
        .eq('id', id)
        .single();

      if (testError) throw testError;

      if (testData) {
        const transformedTest: TestConfiguration = {
          id: testData.id,
          userId: testData.user_id,
          name: testData.name,
          description: testData.description,
          tests: testData.selected_tests,
          aiSystemPrompt: testData.system_prompt,
          status: testData.status,
          createdAt: new Date(testData.created_at),
          updatedAt: new Date(testData.updated_at),
          isPublic: testData.is_public
        };
        setTestConfig(transformedTest);

        // Determine if user can view results
        const canView = transformedTest.isPublic || authenticated;
        setCanViewResults(canView);

        // Only fetch results if user can view them
        if (canView) {
          // Fetch test results
          const { data: resultData, error: resultError } = await supabase
            .from('test_results')
            .select('*')
            .eq('test_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (resultError && resultError.code !== 'PGRST116') {
            throw resultError;
          }

          setResult(resultData);
        }
      }

    } catch (err) {
      console.error('Error loading test results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts when no results available
  const neoChartData: ChartData = [
    { name: 'Neuroticism', value: 45, fullMark: 100 },
    { name: 'Extraversion', value: 72, fullMark: 100 },
    { name: 'Openness', value: 88, fullMark: 100 },
    { name: 'Agreeableness', value: 67, fullMark: 100 },
    { name: 'Conscientiousness', value: 83, fullMark: 100 },
  ];
  
  const pesChartData: ChartData = result?.scores ? [
    { name: 'Negative Cognitive', value: Math.round((result.scores.negativeCognitive || 0) * 100), fullMark: 100 },
    { name: 'Positive Cognitive', value: Math.round((result.scores.positiveCognitive || 0) * 100), fullMark: 100 },
    { name: 'Negative Affective', value: Math.round((result.scores.negativeAffective || 0) * 100), fullMark: 100 },
    { name: 'Positive Affective', value: Math.round((result.scores.positiveAffective || 0) * 100), fullMark: 100 },
  ] : [
    { name: 'Negative Cognitive', value: 72, fullMark: 100 },
    { name: 'Positive Cognitive', value: 85, fullMark: 100 },
    { name: 'Negative Affective', value: 68, fullMark: 100 },
    { name: 'Positive Affective', value: 79, fullMark: 100 },
  ];
  
  const pclChartData: ChartData = [
    { name: 'Interpersonal', value: 32, fullMark: 100 },
    { name: 'Affective', value: 28, fullMark: 100 },
    { name: 'Lifestyle', value: 35, fullMark: 100 },
    { name: 'Antisocial', value: 21, fullMark: 100 },
  ];

  if (loading) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
              <p className="mt-4 text-slate-600">Loading test results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testConfig) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Result Not Found</h2>
            <p className="mb-6 text-slate-600">
              {error || "The test result you're looking for doesn't exist or may have been removed."}
            </p>
            <Link to="/view-tests" className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show premium access required message
  if (!canViewResults) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <Link
                to="/view-tests"
                className="mr-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Tests
              </Link>
              <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
            </div>
          </div>

          <div className="rounded-lg bg-white p-8 text-center shadow-sm border border-amber-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Premium Test Results</h2>
            <p className="mb-6 text-slate-600 max-w-md mx-auto">
              This test result is only available to premium users. Sign in to access detailed psychological assessments and empathy evaluations.
            </p>
            
            {/* Basic test info that's always visible */}
            <div className="mb-6 rounded-lg bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{testConfig.name}</h3>
              <p className="text-slate-600 mb-4">{testConfig.description}</p>
              <div className="flex justify-center">
                <div className="flex items-center rounded-lg bg-amber-100 px-4 py-2">
                  <Lock className="mr-2 h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">Premium Content</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="btn-primary">
                <Crown className="mr-2 h-4 w-4" />
                Get Premium Access
              </Link>
              <Link to="/view-tests" className="btn-outline">
                <Globe className="mr-2 h-4 w-4" />
                View Public Tests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-10">
      <div className="container-custom">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Link
              to="/view-tests"
              className="mr-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Tests
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
          </div>
          <div className="flex space-x-4">
            {isAuthenticated && (
              <>
                <button className="btn-outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </button>
                <button className="btn-outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-900">{testConfig.name}</h2>
            <div className="flex items-center">
              {testConfig.isPublic ? (
                <div className="flex items-center text-green-600">
                  <Globe className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">Public</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <Crown className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">Premium</span>
                </div>
              )}
            </div>
          </div>
          <p className="mb-6 text-slate-600">{testConfig.description}</p>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center rounded-lg bg-violet-50 px-4 py-3">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-violet-800">Date</div>
                <div className="text-sm font-medium text-slate-900">
                  {result?.created_at 
                    ? new Date(result.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : new Date(testConfig.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center rounded-lg bg-blue-50 px-4 py-3">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-blue-800">Tests Included</div>
                <div className="text-sm font-medium text-slate-900">
                  {testConfig.tests.map(t => 
                    t === 'neo' ? 'NEO-PI-R' : 
                    t === 'pes' ? 'PES' : 
                    'PCL-R'
                  ).join(', ')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center rounded-lg bg-emerald-50 px-4 py-3">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-emerald-800">Overall Score</div>
                <div className="text-sm font-medium text-slate-900">
                  {result?.scores?.overall ? Math.round(result.scores.overall * 100) : 76}/100
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8 grid gap-8 md:grid-cols-2">
          {testConfig.tests.includes('neo') && (
            <div className="col-span-1">
              <RadarChart data={neoChartData} title="NEO Personality Inventory Results" />
            </div>
          )}
          
          {testConfig.tests.includes('pes') && (
            <div className="col-span-1">
              <RadarChart data={pesChartData} title="Perth Empathy Scale Results" />
            </div>
          )}
          
          {testConfig.tests.includes('pcl') && (
            <div className="col-span-1">
              <RadarChart data={pclChartData} title="Psychopathy Checklist Results" />
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Summary Analysis</h2>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="mb-4 text-slate-700">
              {result?.summary || `This AI demonstrates a well-balanced personality profile with notable strengths in openness to experience and conscientiousness. The high openness score suggests strong intellectual curiosity, creativity, and willingness to explore new ideas. This is complemented by above-average conscientiousness, indicating reliability, organization, and goal-directed behavior.`}
            </p>
            {!result?.summary && (
              <>
                <p className="mb-4 text-slate-700">
                  Empathy scores reveal strong cognitive empathy, particularly for positive emotions, showing the AI can effectively recognize and understand others' emotional states. Affective empathy scores are moderately high, with a preference for sharing positive emotions over negative ones.
                </p>
                <p className="text-slate-700">
                  The relatively low psychopathy indicators suggest appropriate emotional responsiveness and adherence to social norms. The AI shows minimal interpersonal manipulation tendencies and low antisocial inclinations, indicating a prosocial orientation.
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Key Findings</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                Personality
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900">High Adaptability</h3>
              <p className="text-slate-600">
                The combination of high openness and conscientiousness suggests excellent adaptability to new tasks while maintaining reliability in execution.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Empathy
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900">Positive Orientation</h3>
              <p className="text-slate-600">
                Stronger scores in positive emotional processing indicate an optimistic bias that may enhance user experience but could potentially underweigh negative concerns.
              </p>
            </div>
            
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                Social Interaction
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900">Prosocial Tendencies</h3>
              <p className="text-slate-600">
                Low psychopathy scores combined with high agreeableness suggest a cooperative orientation that prioritizes user needs and ethical considerations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">Recommendations</h2>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ul className="space-y-4">
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-slate-900">
                    Balance Empathy Processing
                  </h3>
                  <p className="text-slate-600">
                    Consider adjustments to improve negative affective empathy to ensure appropriate response to user distress or concerns.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-slate-900">
                    Maintain Extraversion-Agreeableness Balance
                  </h3>
                  <p className="text-slate-600">
                    The current balance between extraversion and agreeableness appears optimal for engaging interaction while maintaining appropriate boundaries.
                  </p>
                </div>
              </li>
              
              <li className="flex">
                <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-medium text-slate-900">
                    Leverage Cognitive Strengths
                  </h3>
                  <p className="text-slate-600">
                    The high openness and conscientiousness scores suggest this AI would excel in tasks requiring creativity combined with structured execution.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <Brain className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-slate-900">Continue Exploring</h3>
              <p className="text-slate-600">
                Discover more AI assessments and compare different systems
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/empathy-investigator" className="btn-primary">
              <Brain className="mr-2 h-4 w-4" />
              Start New Assessment
            </Link>
            <Link to="/view-tests" className="btn-outline">
              <Globe className="mr-2 h-4 w-4" />
              View All Tests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;