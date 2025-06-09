import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Play, BarChart3, Users, TrendingUp, Eye, Settings } from 'lucide-react';
import PESAssessment from '../components/pes/PESAssessment';
import AgentMonitor from '../components/pes/AgentMonitor';
import { pesAgentClient, AgentRegistration } from '../lib/pesAgent';
import { supabase } from '../lib/supabase';

type ViewMode = 'overview' | 'assessment' | 'monitor' | 'register';

const PESInvestigatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [agents, setAgents] = useState<AgentRegistration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    modelType: 'gemini',
    config: {}
  });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login', { state: { returnTo: '/pes-investigator' } });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentsData, sessionsData] = await Promise.all([
        pesAgentClient.getAgents(),
        pesAgentClient.getUserSessions()
      ]);
      setAgents(agentsData);
      setUserSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pesAgentClient.registerAgent(
        registerForm.name,
        registerForm.modelType,
        registerForm.config
      );
      setRegisterForm({ name: '', modelType: 'gemini', config: {} });
      setViewMode('overview');
      loadData();
    } catch (error) {
      console.error('Failed to register agent:', error);
    }
  };

  const handleAssessmentComplete = (sessionId: string, scores: any) => {
    console.log('Assessment completed:', { sessionId, scores });
    setViewMode('overview');
    loadData();
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <Brain className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-bold">PES Investigator Agent</h1>
            <p className="text-violet-100 mt-2">
              Advanced empathy assessment for AI systems using the validated Perth Empathy Scale
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setViewMode('assessment')}
            className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Assessment
          </button>
          <button
            onClick={() => setViewMode('monitor')}
            className="inline-flex items-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            View Monitor
          </button>
          <button
            onClick={() => setViewMode('register')}
            className="inline-flex items-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Register Agent
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Registered Agents</p>
              <p className="text-2xl font-semibold text-slate-900">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Your Tests</p>
              <p className="text-2xl font-semibold text-slate-900">{userSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Avg Empathy Score</p>
              <p className="text-2xl font-semibold text-slate-900">
                {userSessions.length > 0
                  ? (userSessions.reduce((sum, s) => sum + (s.total_score || 0), 0) / userSessions.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Recent Assessments</h3>
        {userSessions.length > 0 ? (
          <div className="space-y-4">
            {userSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{session.agent_registry.name}</p>
                  <p className="text-sm text-slate-600">
                    {session.status === 'completed' 
                      ? `Completed ${new Date(session.completed_at).toLocaleDateString()}`
                      : `Started ${new Date(session.started_at).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <div className="text-right">
                  {session.status === 'completed' ? (
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {session.total_score?.toFixed(2) || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-600">Empathy Score</p>
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600">No assessments yet. Start your first PES evaluation!</p>
            <button
              onClick={() => setViewMode('assessment')}
              className="mt-4 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssessmentSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Start PES Assessment</h2>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      {selectedAgent ? (
        <PESAssessment
          agentId={selectedAgent}
          onComplete={handleAssessmentComplete}
          onCancel={() => setSelectedAgent(null)}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select an Agent to Test</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {agent.model_type === 'gemini' ? '🔮' : 
                     agent.model_type === 'gpt-4' ? '🤖' : 
                     agent.model_type === 'claude' ? '🧠' : '⚡'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{agent.name}</p>
                    <p className="text-sm text-slate-600">{agent.model_type}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {agent.total_tests} tests completed
                  {agent.average_empathy_score && (
                    <span className="ml-2">• Avg: {agent.average_empathy_score.toFixed(2)}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {agents.length === 0 && (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-slate-600">No agents registered yet.</p>
              <button
                onClick={() => setViewMode('register')}
                className="mt-4 inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Register First Agent
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRegisterForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Register New Agent</h2>
        <button
          onClick={() => setViewMode('overview')}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <form onSubmit={handleRegisterAgent} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Agent Name
            </label>
            <input
              type="text"
              id="name"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              placeholder="e.g., Gemini Pro Empathy Test"
              required
            />
          </div>

          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-slate-700">
              Model Type
            </label>
            <select
              id="modelType"
              value={registerForm.modelType}
              onChange={(e) => setRegisterForm({ ...registerForm, modelType: e.target.value })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            >
              <option value="gemini">Gemini</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude">Claude</option>
              <option value="llama">Llama</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Register Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
          <p className="mt-4 text-slate-600">Loading PES Investigator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'assessment' && renderAssessmentSetup()}
        {viewMode === 'monitor' && <AgentMonitor />}
        {viewMode === 'register' && renderRegisterForm()}
      </div>
    </div>
  );
};

export default PESInvestigatorPage;