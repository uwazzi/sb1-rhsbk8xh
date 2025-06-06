import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, BarChart2, SlidersHorizontal, Lock, Globe, Crown } from 'lucide-react';
import TestCard from '../components/tests/TestCard';
import { mockConfigurations } from '../data/mockData';
import { TestConfiguration } from '../types';
import { supabase } from '../lib/supabase';

const DashboardPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'my-tests' | 'community'>('my-tests');
  const [publicTests, setPublicTests] = useState<TestConfiguration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'community') {
      fetchPublicTests();
    }
  }, [viewMode]);

  const fetchPublicTests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_configurations')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform snake_case database properties to camelCase interface properties
      const transformedData = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        description: item.description,
        tests: item.selected_tests, // Transform selected_tests to tests
        aiSystemPrompt: item.system_prompt, // Transform system_prompt to aiSystemPrompt
        status: item.status,
        createdAt: new Date(item.created_at), // Transform created_at to createdAt and convert to Date
        updatedAt: new Date(item.updated_at), // Transform updated_at to updatedAt and convert to Date
        isPublic: item.is_public
      }));
      
      setPublicTests(transformedData);
    } catch (error) {
      console.error('Error fetching public tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const filteredTests = (viewMode === 'my-tests' ? mockConfigurations : publicTests).filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-10">
      <div className="container-custom">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Tests</h1>
            <p className="text-slate-600">
              View and manage your AI psychometric evaluations
            </p>
          </div>
          <Link
            to="/create"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Check Sanity
          </Link>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setViewMode('my-tests')}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                viewMode === 'my-tests'
                  ? 'bg-violet-100 text-violet-900'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Lock className="mr-2 h-4 w-4" />
              My Tests
            </button>
            <button
              onClick={() => setViewMode('community')}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                viewMode === 'community'
                  ? 'bg-violet-100 text-violet-900'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Globe className="mr-2 h-4 w-4" />
              Community Tests
            </button>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-slate-300 pl-10 text-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-slate-500" />
              <select
                className="rounded-md border-slate-300 text-sm focus:border-violet-500 focus:ring-violet-500"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'community' && (
          <div className="mb-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-white/20 p-3">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">Unlock Private Tests</h3>
                <p className="mb-4 text-violet-100">
                  Get access to all private community tests and premium features with our Pro plan.
                </p>
                <a
                  href="/pricing"
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50"
                >
                  Upgrade to Pro
                  <Crown className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <BarChart2 className="mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-xl font-medium text-slate-900">No tests found</h3>
            <p className="mb-6 max-w-md text-slate-600">
              {searchTerm || statusFilter !== 'all'
                ? "No tests match your current filters. Try adjusting your search criteria."
                : viewMode === 'community'
                ? "No public tests available yet. Be the first to share your test with the community!"
                : "You haven't created any psychometric tests yet. Get started by checking your AI's sanity."}
            </p>
            <Link
              to="/create"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Check Sanity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;