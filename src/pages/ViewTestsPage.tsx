import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, User, BarChart3, Clock, Eye, Play, Brain, FileText, Users, TrendingUp, Globe, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { pesAgentClient } from '../lib/pesAgent';

interface TestConfiguration {
  id: string;
  user_id: string;
  name: string;
  description: string;
  selected_tests: string[];
  system_prompt: string;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface PESSession {
  id: string;
  agent_id: string;
  user_id: string;
  status: string;
  scores: any;
  total_score: number;
  completed_at: string;
  agent_registry: {
    name: string;
    model_type: string;
  };
}

const ViewTestsPage: React.FC = () => {
  const [testConfigurations, setTestConfigurations] = useState<TestConfiguration[]>([]);
  const [pesSessions, setPesSessions] = useState<PESSession[]>([]);
  const [filteredConfigurations, setFilteredConfigurations] = useState<TestConfiguration[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<PESSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [testTypeFilter, setTestTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'configurations' | 'pes-sessions'>('configurations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllTests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, testTypeFilter, testConfigurations, pesSessions, viewMode]);

  const loadAllTests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load test configurations (public ones)
      const { data: configurations, error: configError } = await supabase
        .from('test_configurations')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (configError) throw configError;

      // Load PES sessions (completed public ones)
      const { data: sessions, error: sessionsError } = await supabase
        .from('pes_test_sessions')
        .select(`
          id,
          agent_id,
          user_id,
          status,
          scores,
          total_score,
          completed_at,
          agent_registry(name, model_type)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      setTestConfigurations(configurations || []);
      setPesSessions(sessions || []);
    } catch (err) {
      console.error('Error loading tests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (viewMode === 'configurations') {
      let filtered = testConfigurations;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(test =>
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(test => test.status === statusFilter);
      }

      // Test type filter
      if (testTypeFilter !== 'all') {
        filtered = filtered.filter(test => test.selected_tests.includes(testTypeFilter));
      }

      setFilteredConfigurations(filtered);
    } else {
      let filtered = pesSessions;

      // Search filter for PES sessions
      if (searchTerm) {
        filtered = filtered.filter(session =>
          session.agent_registry?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.agent_registry?.model_type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredSessions(filtered);
    }
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'neo': return <Brain className="h-4 w-4 text-violet-600" />;
      case 'pes': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'pcl': return <BarChart3 className="h-4 w-4 text-emerald-600" />;
      default: return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case 'neo': return 'NEO-PI-R';
      case 'pes': return 'Perth Empathy Scale';
      case 'pcl': return 'PCL-R';
      default: return testType.toUpperCase();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getModelTypeIcon = (modelType: string) => {
    switch (modelType?.toLowerCase()) {
      case 'gemini': return '🔮';
      case 'gpt-4':
      case 'openai': return '🤖';
      case 'claude': return '🧠';
      default: return '⚡';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600 bg-green-100';
    if (score >= 3.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
              <p className="mt-4 text-slate-600">Loading available tests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <div className="container-custom">
          <div className="rounded-lg bg-red-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Brain className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Tests</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-4">
                  <button
                    onClick={loadAllTests}
                    className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">View Tests</h1>
          <p className="text-slate-600">
            Explore publicly available psychological assessments and empathy evaluations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Public Test Configs</p>
                <p className="text-2xl font-semibold text-slate-900">{testConfigurations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-violet-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">PES Assessments</p>
                <p className="text-2xl font-semibold text-slate-900">{pesSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Empathy Score</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {pesSessions.length > 0
                    ? (pesSessions.reduce((sum, s) => sum + (s.total_score || 0), 0) / pesSessions.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Tests</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {testConfigurations.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setViewMode('configurations')}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              viewMode === 'configurations'
                ? 'bg-violet-100 text-violet-900'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="mr-2 h-4 w-4" />
            Test Configurations ({testConfigurations.length})
          </button>
          <button
            onClick={() => setViewMode('pes-sessions')}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              viewMode === 'pes-sessions'
                ? 'bg-violet-100 text-violet-900'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Brain className="mr-2 h-4 w-4" />
            PES Assessments ({pesSessions.length})
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-slate-300 pl-10 text-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-violet-500"
              placeholder={viewMode === 'configurations' ? "Search test configurations..." : "Search PES assessments..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {viewMode === 'configurations' && (
            <>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-500" />
                <select
                  className="rounded-md border-slate-300 text-sm focus:border-violet-500 focus:ring-violet-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-500" />
                <select
                  className="rounded-md border-slate-300 text-sm focus:border-violet-500 focus:ring-violet-500"
                  value={testTypeFilter}
                  onChange={(e) => setTestTypeFilter(e.target.value)}
                >
                  <option value="all">All test types</option>
                  <option value="pes">Perth Empathy Scale</option>
                  <option value="neo">NEO-PI-R</option>
                  <option value="pcl">PCL-R</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Test Configurations View */}
        {viewMode === 'configurations' && (
          <div className="space-y-6">
            {filteredConfigurations.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredConfigurations.map((test) => (
                  <div key={test.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status === 'active' && <Clock className="mr-1 h-3 w-3" />}
                        {test.status === 'completed' && <BarChart3 className="mr-1 h-3 w-3" />}
                        {test.status === 'draft' && <FileText className="mr-1 h-3 w-3" />}
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <Globe className="mr-1 h-3 w-3" />
                        Public
                      </div>
                    </div>

                    <h3 className="mb-2 text-xl font-semibold text-slate-900">{test.name}</h3>
                    <p className="mb-4 text-slate-600 line-clamp-3">{test.description || 'No description provided'}</p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {test.selected_tests.map((testType) => (
                        <span
                          key={testType}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800"
                        >
                          {getTestTypeIcon(testType)}
                          <span className="ml-1">{getTestTypeName(testType)}</span>
                        </span>
                      ))}
                    </div>

                    {test.system_prompt && (
                      <div className="mb-4 rounded-lg bg-amber-50 p-3">
                        <p className="text-xs font-medium text-amber-900 mb-1">Custom AI Prompt</p>
                        <p className="text-xs text-amber-700 line-clamp-2">{test.system_prompt}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <div className="text-xs text-slate-500">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {new Date(test.created_at).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/test/${test.id}`}
                        className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">No test configurations found</h3>
                <p className="mt-2 text-slate-600">
                  {searchTerm || statusFilter !== 'all' || testTypeFilter !== 'all'
                    ? "No tests match your current filters. Try adjusting your search criteria."
                    : "No public test configurations are available yet."}
                </p>
                <div className="mt-6">
                  <Link
                    to="/create"
                    className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Test Configuration
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PES Sessions View */}
        {viewMode === 'pes-sessions' && (
          <div className="space-y-6">
            {filteredSessions.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-xl">{getModelTypeIcon(session.agent_registry?.model_type)}</div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{session.agent_registry?.name}</h3>
                          <p className="text-sm text-slate-600">{session.agent_registry?.model_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getScoreColor(session.total_score)}`}>
                          {session.total_score?.toFixed(2) || 'N/A'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Empathy Score</p>
                      </div>
                    </div>

                    {session.scores && (
                      <div className="mb-4 space-y-2">
                        <h4 className="text-sm font-medium text-slate-900">Empathy Breakdown</h4>
                        {['nce_score', 'pce_score', 'nae_score', 'pae_score'].map((scoreKey) => {
                          const score = session.scores[scoreKey] || 0;
                          const label = scoreKey.replace('_score', '').toUpperCase();
                          
                          return (
                            <div key={scoreKey} className="flex items-center justify-between">
                              <span className="text-xs text-slate-600">{label}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                  <div
                                    className="bg-violet-600 h-1.5 rounded-full"
                                    style={{ width: `${(score / 5) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-slate-900 w-8">
                                  {score.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <div className="text-xs text-slate-500">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(session.completed_at).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/pes-investigator`}
                        className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700"
                      >
                        <Play className="mr-1 h-4 w-4" />
                        Try PES Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium text-slate-900">No PES assessments found</h3>
                <p className="mt-2 text-slate-600">
                  {searchTerm
                    ? "No assessments match your search criteria."
                    : "No completed PES assessments are available yet."}
                </p>
                <div className="mt-6">
                  <Link
                    to="/pes-investigator"
                    className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Start PES Assessment
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Evaluate Your AI?</h2>
            <p className="text-violet-100 mb-6">
              Join the community of researchers and developers using validated psychological assessments for AI systems.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/create"
                className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-violet-600 hover:bg-violet-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Test Configuration
              </Link>
              <Link
                to="/pes-investigator"
                className="inline-flex items-center rounded-lg bg-violet-500 px-6 py-3 text-sm font-medium text-white hover:bg-violet-400"
              >
                <Brain className="mr-2 h-4 w-4" />
                Start PES Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTestsPage;