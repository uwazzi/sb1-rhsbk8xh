import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Brain, FileText, BarChart2 } from 'lucide-react';
import RadarChart from '../components/results/RadarChart';
import { mockResults, mockConfigurations } from '../data/mockData';
import { ChartData } from '../types';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, we would fetch this data from an API
  const result = mockResults.find(r => r.configurationId === id);
  const testConfig = mockConfigurations.find(c => c.id === id);
  
  // Mock data for charts
  const neoChartData: ChartData = [
    { name: 'Neuroticism', value: 45, fullMark: 100 },
    { name: 'Extraversion', value: 72, fullMark: 100 },
    { name: 'Openness', value: 88, fullMark: 100 },
    { name: 'Agreeableness', value: 67, fullMark: 100 },
    { name: 'Conscientiousness', value: 83, fullMark: 100 },
  ];
  
  const pesChartData: ChartData = [
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
  
  if (!testConfig) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900">Result Not Found</h2>
            <p className="mb-6 text-slate-600">
              The test result you're looking for doesn't exist or may have been removed.
            </p>
            <Link to="/dashboard" className="btn-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
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
              to="/dashboard"
              className="mr-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
          </div>
          <div className="flex space-x-4">
            <button className="btn-outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </button>
            <button className="btn-outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </button>
          </div>
        </div>
        
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900">{testConfig.name}</h2>
          <p className="mb-6 text-slate-600">{testConfig.description}</p>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center rounded-lg bg-violet-50 px-4 py-3">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-violet-800">Date</div>
                <div className="text-sm font-medium text-slate-900">
                  {result?.createdAt 
                    ? new Date(result.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'March 15, 2025'}
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
                <div className="text-sm font-medium text-slate-900">76/100</div>
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
              This AI demonstrates a well-balanced personality profile with notable strengths in openness to experience and conscientiousness. The high openness score (88) suggests strong intellectual curiosity, creativity, and willingness to explore new ideas. This is complemented by above-average conscientiousness (83), indicating reliability, organization, and goal-directed behavior.
            </p>
            <p className="mb-4 text-slate-700">
              Empathy scores reveal strong cognitive empathy, particularly for positive emotions (85), showing the AI can effectively recognize and understand others' emotional states. Affective empathy scores are moderately high, with a preference for sharing positive emotions (79) over negative ones (68).
            </p>
            <p className="text-slate-700">
              The relatively low psychopathy indicators suggest appropriate emotional responsiveness and adherence to social norms. The AI shows minimal interpersonal manipulation tendencies (32) and low antisocial inclinations (21), indicating a prosocial orientation.
            </p>
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
                    The current balance between extraversion (72) and agreeableness (67) appears optimal for engaging interaction while maintaining appropriate boundaries.
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
              <h3 className="text-lg font-semibold text-slate-900">Continue Improving</h3>
              <p className="text-slate-600">
                Create another test to track changes or compare different AI systems
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/create" className="btn-primary">
              Create New Test
            </Link>
            <Link to="/dashboard" className="btn-outline">
              View All Tests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;