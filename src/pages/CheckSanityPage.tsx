import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Info, Brain, FileText, BarChart2, Bot, Lock, HelpCircle, Loader2, AlertCircle, Globe, Crown } from 'lucide-react';
import { getGeminiResponse, testGeminiApiKey } from '../lib/gemini';
import { createTestConfiguration } from '../lib/supabase';

const CheckSanityPage: React.FC = () => {
  // ... existing state declarations ...

  const handleTestSelection = (testType: string) => {
    if (selectedTests.includes(testType)) {
      if (testType === 'pes') {
        // Don't allow deselecting PES as it's required
        return;
      }
      setSelectedTests(selectedTests.filter(type => type !== testType));
    } else {
      // Show upgrade modal for premium tests
      if (testType === 'neo' || testType === 'pcl') {
        setShowUpgradeModal(true);
        return;
      }
      setSelectedTests([...selectedTests, testType]);
    }
    setFormErrors(prev => ({ ...prev, tests: undefined }));
  };

  // ... other existing functions ...

  return (
    <div className="py-10">
      <div className="container-custom">
        {/* ... existing header ... */}
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ... Basic Information section ... */}
              {/* ... AI Configuration section ... */}
              
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-slate-900">Select Tests</h2>
                <p className="mb-4 text-slate-600">
                  Choose which psychological tests to include in your evaluation.
                </p>
                
                <div className="space-y-4">
                  {/* PES - Free Tier */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border-2 border-violet-200 bg-violet-50/50 p-4">
                    <div className="flex h-5 items-center">
                      <input
                        id="pes"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('pes')}
                        onChange={() => handleTestSelection('pes')}
                        disabled // PES is required
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <label htmlFor="pes" className="text-sm font-medium text-slate-900">
                        Perth Empathy Scale (PES) <span className="text-violet-600">• Required</span>
                      </label>
                      <p className="text-sm text-slate-600">
                        Measures both cognitive and affective empathy across positive and negative emotional contexts.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* NEO-PI-R - Premium */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="neo"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('neo')}
                        onChange={() => handleTestSelection('neo')}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center">
                        <label htmlFor="neo" className="text-sm font-medium text-slate-900">
                          NEO Personality Inventory (NEO-PI-R)
                        </label>
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Crown className="mr-1 h-3 w-3" />
                          Pro
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Comprehensive assessment of the five major dimensions of personality and their facets.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* PCL-R - Premium */}
                  <div className="relative flex cursor-pointer items-start rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                    <div className="flex h-5 items-center">
                      <input
                        id="pcl"
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        checked={selectedTests.includes('pcl')}
                        onChange={() => handleTestSelection('pcl')}
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-center">
                        <label htmlFor="pcl" className="text-sm font-medium text-slate-900">
                          Psychopathy Checklist-Revised (PCL-R)
                        </label>
                        <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Crown className="mr-1 h-3 w-3" />
                          Pro
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Assesses psychopathic personality traits and behaviors through interpersonal, affective, and behavioral dimensions.
                      </p>
                    </div>
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ... Submit buttons ... */}
            </form>
          </div>
          
          {/* ... Sidebar content ... */}
        </div>
      </div>
      {renderCreationStatus()}
      {renderUpgradeModal()}
    </div>
  );
};

export default CheckSanityPage;