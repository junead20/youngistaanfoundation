import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BookOpen, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { getStats } from '../services/api';

const COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#FF6B6B', '#A29BFE'];

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

export default function Programs() {
  const [stats, setStats] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const filter = selectedProgram !== 'all' ? { program: selectedProgram } : {};
        const data = await getStats(filter);
        setStats(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [selectedProgram]);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Loading program data...</p></div>;
  }

  if (!stats || stats.total === 0) {
    return <div className="empty-state"><div className="empty-state-icon">📚</div><h3>No Program Data</h3><p>Seed the database from the main dashboard first.</p></div>;
  }

  const programData = Object.entries(stats.programStats).map(([name, data]) => ({
    name,
    'Avg Mood': parseFloat(data.avgMood),
    'Avg Engagement': parseFloat(data.avgEngagement),
    'Low Confidence %': data.lowConfPct,
    participants: data.count
  }));

  const pieData = Object.entries(stats.programStats).map(([name, data]) => ({
    name,
    value: data.count
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📚 Program Analytics</h1>
        <p>Program-wise wellbeing tracking for Bright Spark, Gender Equality, and Youth Mentoring</p>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <select className="form-select" value={selectedProgram}
          onChange={e => { setSelectedProgram(e.target.value); setLoading(true); }}>
          <option value="all">All Programs</option>
          <option value="Bright Spark">Bright Spark</option>
          <option value="Gender Equality">Gender Equality</option>
          <option value="Youth Mentoring">Youth Mentoring</option>
        </select>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><BookOpen size={22} /></div>
          <div className="stat-card-value">{Object.keys(stats.programStats).length}</div>
          <div className="stat-card-label">Active Programs</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Users size={22} /></div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><TrendingUp size={22} /></div>
          <div className="stat-card-value">{stats.avgMood}</div>
          <div className="stat-card-label">Overall Avg Mood</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-value">{(stats.riskDistribution.HIGH || 0) + (stats.riskDistribution.CRITICAL || 0)}</div>
          <div className="stat-card-label">High Risk Cases</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Program Comparison</h3>
              <p className="card-subtitle">Mood and engagement metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Avg Mood" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Avg Engagement" fill="#00CEC9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Low Confidence %" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Participant Distribution</h3>
              <p className="card-subtitle">By program enrollment</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                paddingAngle={4} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Program Detail Cards */}
      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {Object.entries(stats.programStats).map(([name, data], i) => (
          <div key={name} className="card">
            <h3 className="card-title" style={{ marginBottom: 4 }}>
              {name === 'Bright Spark' ? '✨' : name === 'Gender Equality' ? '⚖️' : '🧑‍🏫'} {name}
            </h3>
            <p className="card-subtitle" style={{ marginBottom: 20 }}>{data.count} participants</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Outfit', color: parseFloat(data.avgMood) >= 3 ? 'var(--success)' : 'var(--danger)' }}>
                  {data.avgMood}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg Mood</div>
              </div>
              <div style={{ padding: 12, background: 'var(--bg-glass)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--info)' }}>
                  {data.avgEngagement}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg Engagement</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Low Confidence</span>
                <span style={{ fontWeight: 600, color: data.lowConfPct > 40 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                  {data.lowConfPct}%
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${data.lowConfPct > 40 ? 'red' : data.lowConfPct > 25 ? 'yellow' : 'green'}`}
                  style={{ width: `${data.lowConfPct}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">🧠 Program Insights</h3>
              <p className="card-subtitle">AI-generated observations from program data</p>
            </div>
          </div>
          <div className="insights-container">
            {stats.insights.filter(i => i.program).map((insight, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${insight.type}`}>
                  {insight.type === 'warning' ? '⚠️' : insight.type === 'alert' ? '🔔' : '💡'}
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
    </div>
  );
}
