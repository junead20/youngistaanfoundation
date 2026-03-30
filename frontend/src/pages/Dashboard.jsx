import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Users, Heart, AlertTriangle, TrendingUp, Brain, HelpCircle, RefreshCw } from 'lucide-react';
import { getStats, seedDatabase } from '../services/api';

const COLORS = ['#00B894', '#FDCB6E', '#E17055', '#FF6B6B'];
const CHART_COLORS = { primary: '#6C5CE7', accent: '#00CEC9', warning: '#FDCB6E', danger: '#FF6B6B' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1A1A3E', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      await loadData();
    } catch (err) {
      console.error(err);
    }
    setSeeding(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading dashboard data...</p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <h3>No Data Yet</h3>
        <p>Seed the database with demo data to see the dashboard in action.</p>
        <button className="btn btn-primary" onClick={handleSeed} disabled={seeding}>
          <RefreshCw size={16} className={seeding ? 'loading-spinner' : ''} />
          {seeding ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      </div>
    );
  }

  const riskData = Object.entries(stats.riskDistribution).map(([name, value]) => ({ 
    name: name === 'CRITICAL' ? 'Priority' : name === 'HIGH' ? 'Needs Check-in' : name, 
    value 
  }));

  const programData = Object.entries(stats.programStats).map(([name, data]) => ({
    name: name.length > 14 ? name.slice(0, 14) + '…' : name,
    'Avg Mood': parseFloat(data.avgMood),
    'Avg Engagement': parseFloat(data.avgEngagement),
    'Low Confidence %': data.lowConfPct,
    participants: data.count
  }));
  const ageData = Object.entries(stats.ageGroupStats).map(([name, data]) => ({
    name: name === '6-12' ? 'Children (6-12)' : 'Teens (13-19)',
    'Avg Mood': parseFloat(data.avgMood),
    'Avg Engagement': parseFloat(data.avgEngagement),
    count: data.count
  }));

  return (
    <div className="animate-fade-in">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><Users size={22} /></div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Entries</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Heart size={22} /></div>
          <div className="stat-card-value">{stats.avgMood}</div>
          <div className="stat-card-label">Average Mood (out of 5)</div>
          <div className={`stat-card-change ${parseFloat(stats.avgMood) >= 3 ? 'up' : 'down'}`}>
            {parseFloat(stats.avgMood) >= 3 ? '↑ Healthy' : '↓ Needs Attention'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-value">{stats.riskDistribution.HIGH + stats.riskDistribution.CRITICAL}</div>
          <div className="stat-card-label">Needs a Check-in</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange"><HelpCircle size={22} /></div>
          <div className="stat-card-value">{stats.helpCount}</div>
          <div className="stat-card-label">Help Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><TrendingUp size={22} /></div>
          <div className="stat-card-value">{stats.peerSupportCount}</div>
          <div className="stat-card-label">Peer Support Used</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Mood Trend */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Mood Trend (30 Days)</h3>
              <p className="card-subtitle">Average daily mood score</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.moodTrend || []}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6C6C9C' }}
                tickFormatter={d => d.slice(5)} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgMood" stroke="#6C5CE7" fill="url(#moodGradient)"
                strokeWidth={2} dot={false} name="Avg Mood" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Wellbeing Distribution</h3>
              <p className="card-subtitle">Participant check-in states</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                paddingAngle={4} dataKey="value" stroke="none">
                {riskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* Program Comparison */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Program Comparison</h3>
              <p className="card-subtitle">Mood and engagement by program</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{value}</span>}
              />
              <Bar dataKey="Avg Mood" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Low Confidence %" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Group Comparison */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Age Group Comparison</h3>
              <p className="card-subtitle">Children vs Teens wellness</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#B0B0D0' }} width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{value}</span>}
              />
              <Bar dataKey="Avg Mood" fill="#00CEC9" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Avg Engagement" fill="#A29BFE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">🧠 Smart Insights</h3>
              <p className="card-subtitle">AI-generated insights from your data</p>
            </div>
            <Brain size={20} color="var(--primary-light)" />
          </div>
          <div className="insights-container">
            {stats.insights.map((insight, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${insight.type}`}>
                  {insight.type === 'critical' ? '🚨' :
                    insight.type === 'warning' ? '⚠️' :
                      insight.type === 'alert' ? '🔔' :
                        insight.type === 'insight' ? '💡' : 'ℹ️'}
                </div>
                <div className="insight-text">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Quick View */}
      {stats.cityStats && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">🌍 City Overview</h3>
              <p className="card-subtitle">Wellbeing snapshot across all cities</p>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Participants</th>
                <th>Avg Mood</th>
                <th>Needs Check-in</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.cityStats).map(([city, data]) => (
                <tr key={city}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{city}</td>
                  <td>{data.count}</td>
                  <td>
                    <span style={{ color: parseFloat(data.avgMood) >= 3 ? 'var(--success)' : 'var(--danger)' }}>
                      {data.avgMood}
                    </span>
                  </td>
                  <td>{data.highRisk}</td>
                  <td>
                    <span className={`badge ${parseFloat(data.avgMood) >= 3.5 ? 'low' : parseFloat(data.avgMood) >= 2.5 ? 'medium' : 'high'}`}>
                      {parseFloat(data.avgMood) >= 3.5 ? 'Healthy' : parseFloat(data.avgMood) >= 2.5 ? 'Monitor' : 'Alert'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
