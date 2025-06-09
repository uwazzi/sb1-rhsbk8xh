import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Clock, Users, BarChart3, Eye, Plus } from 'lucide-react';
import { pesAgentClient, AgentRegistration } from '../../lib/pesAgent';

interface AgentStats {
  totalTests: number;
  averageScore: number;
  sessions: any[];
}

const AgentMonitor: React.FC = () => {
  const [agents, setAgents] = useState<AgentRegistration[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<Record<string, AgentStats>>({});
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [agentsData, sessionsData] = await Promise.all([
        pesAgentClient.getAgents(),
        pesAgentClient.getPublicSessions()
      ]);

      setAgents(agentsData);
      setSessions(sessionsData);

      // Load stats for each agent
      const statsPromises = agentsData.map(async (agent) => {
        try {
          const stats = await pesAgentClient.getAgentStats(agent.id);
          return { agentId: agent.id, stats };
        } catch (error) {
          console.error(`Failed to load stats for agent ${agent.id}:`, error);
          return { agentId: agent.id, stats: { totalTests: 0, averageScore: 0, sessions: [] } };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { agentId, stats }) => {
        acc[agentId] = stats;
        return acc;
      }, {} as Record<string, AgentStats>);

      setAgentStats(statsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return 'text-green-600 bg-green-100';
    if (score >= 3.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getModelTypeIcon = (modelType: string) => {
    switch (modelType.toLowerCase()) {
      case 'gemini':
        return '🔮';
      case 'gpt-4':
      case 'openai':
        return '🤖';
      case 'claude':
        return '🧠';
      default:
        return '⚡';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 animate-pulse text-violet-600" />
          <p className="mt-4 text-slate-600">Loading agent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Monitor</h1>
          <p className="text-slate-600">Track AI agent empathy performance across PES assessments</p>
        </div>
        <button
          onClick={() => setShowRegisterForm(true)}
          className="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Register Agent
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Brain className="h-8 w-8 text-violet-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Agents</p>
              <p className="text-2xl font-semibold text-slate-900">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Tests</p>
              <p className="text-2xl font-semibold text-slate-900">
                {Object.values(agentStats).reduce((sum, stats) => sum + stats.totalTests, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Avg Empathy Score</p>
              <p className="text-2xl font-semibold text-slate-900">
                {agents.length > 0 
                  ? (Object.values(agentStats).reduce((sum, stats) => sum + stats.averageScore, 0) / agents.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Recent Tests</p>
              <p className="text-2xl font-semibold text-slate-900">
                {sessions.filter(s => {
                  const completedAt = new Date(s.completed_at);
                  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return completedAt > dayAgo;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {agents.map((agent) => {
          const stats = agentStats[agent.id] || { totalTests: 0, averageScore: 0, sessions: [] };
          
          return (
            <div key={agent.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getModelTypeIcon(agent.model_type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                    <p className="text-sm text-slate-600">{agent.model_type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  {selectedAgent === agent.id ? 'Hide' : 'View'} Details
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-slate-900">{stats.totalTests}</p>
                  <p className="text-xs text-slate-600">Tests</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-semibold rounded-full px-2 py-1 ${getScoreColor(stats.averageScore)}`}>
                    {stats.averageScore.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats.sessions.filter(s => {
                      const completedAt = new Date(s.completed_at);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return completedAt > weekAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-slate-600">This Week</p>
                </div>
              </div>

              {/* Empathy Subscales */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Latest Empathy Profile</h4>
                <div className="space-y-2">
                  {['NCE', 'PCE', 'NAE', 'PAE'].map((subscale) => {
                    const latestSession = stats.sessions[0];
                    const score = latestSession?.scores?.[`${subscale.toLowerCase()}_score`] || 0;
                    
                    return (
                      <div key={subscale} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">
                          {subscale === 'NCE' && 'Negative Cognitive'}
                          {subscale === 'PCE' && 'Positive Cognitive'}
                          {subscale === 'NAE' && 'Negative Affective'}
                          {subscale === 'PAE' && 'Positive Affective'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-violet-600 h-2 rounded-full"
                              style={{ width: `${(score / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-900 w-8">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAgent === agent.id && (
                <div className="mt-6 border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Test Sessions</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {stats.sessions.slice(0, 10).map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            Score: {session.total_score?.toFixed(2) || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(session.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getScoreColor(session.total_score || 0)}`}>
                            {session.total_score >= 4.0 ? 'High' : session.total_score >= 3.0 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Test Activity</h3>
        <div className="space-y-4">
          {sessions.slice(0, 10).map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-xl">{getModelTypeIcon(session.agent_registry.model_type)}</div>
                <div>
                  <p className="font-medium text-slate-900">{session.agent_registry.name}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(session.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getScoreColor(session.total_score)}`}>
                  {session.total_score.toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Empathy Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentMonitor;