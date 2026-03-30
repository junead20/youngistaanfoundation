import { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Heart, BookOpen, Smile, Users, AlertTriangle } from 'lucide-react';
import { getStats, getEntries } from '../services/api';

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

export default function ChildrenDashboard() {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          getStats({ age_group: '6-12' }),
          getEntries({ age_group: '6-12' })
        ]);
        setStats(statsData);
        setEntries(entriesData);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading children's dashboard...</p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👶</div>
        <h3>No Children Data</h3>
        <p>Seed the database from the main dashboard first.</p>
      </div>
    );
  }

  const programData = Object.entries(stats.programStats).map(([name, data]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    fullName: name,
    'Avg Mood': parseFloat(data.avgMood),
    'Low Confidence %': data.lowConfPct,
    participants: data.count
  }));

  const radarData = [
    { subject: 'Mood', A: parseFloat(stats.avgMood) * 20 },
    { subject: 'Confidence', A: stats.total > 0 ? 100 - (Object.values(stats.programStats).reduce((s, p) => s + p.lowConfPct, 0) / Object.keys(stats.programStats).length) : 50 },
    { subject: 'Engagement', A: Object.values(stats.ageGroupStats).reduce((s, a) => s + parseFloat(a.avgEngagement || 5), 0) / Math.max(Object.keys(stats.ageGroupStats).length, 1) * 10 },
    { subject: 'Safety', A: stats.total > 0 ? (1 - stats.helpCount / stats.total) * 100 : 80 },
    { subject: 'Social', A: stats.total > 0 ? (stats.peerSupportCount / stats.total) * 100 + 30 : 50 },
  ];

  const confDistribution = entries.reduce((acc, e) => {
    const l = e.confidence_level || 'moderate';
    acc[l] = (acc[l] || 0) + 1;
    return acc;
  }, {});

  const confData = Object.entries(confDistribution).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value
  }));

  const recentAlerts = entries.filter(e => e.risk_level === 'HIGH' || e.risk_level === 'CRITICAL').slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>👶 Children Dashboard (Ages 6-12)</h1>
        <p>Tracking learning stress, confidence, and emotional wellbeing for younger learners</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><Users size={22} /></div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Children Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Smile size={22} /></div>
          <div className="stat-card-value">{stats.avgMood}</div>
          <div className="stat-card-label">Average Mood</div>
          <div className={`stat-card-change ${parseFloat(stats.avgMood) >= 3 ? 'up' : 'down'}`}>
            {parseFloat(stats.avgMood) >= 3 ? '😊 Happy' : '😢 Needs Care'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange"><BookOpen size={22} /></div>
          <div className="stat-card-value">
            {Math.round(Object.values(stats.programStats).reduce((s, p) => s + p.lowConfPct, 0) / Math.max(Object.keys(stats.programStats).length, 1))}%
          </div>
          <div className="stat-card-label">Low Confidence Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-value">{(stats.riskDistribution.HIGH || 0) + (stats.riskDistribution.CRITICAL || 0)}</div>
          <div className="stat-card-label">Need Attention</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Program Performance</h3>
              <p className="card-subtitle">Mood and confidence by program</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Avg Mood" fill="#00CEC9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Low Confidence %" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Wellbeing Radar</h3>
              <p className="card-subtitle">Overall wellness dimensions</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#B0B0D0' }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence Distribution + Recent Alerts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Confidence Distribution</h3>
              <p className="card-subtitle">Self-confidence levels among children</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#B0B0D0' }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#A29BFE" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">⚠️ Recent Alerts</h3>
              <p className="card-subtitle">Children needing immediate attention</p>
            </div>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="empty-state">
              <p>✅ No high-risk alerts for this age group</p>
            </div>
          ) : (
            <div className="insights-container">
              {recentAlerts.map((e, i) => (
                <div key={i} className="insight-card">
                  <div className={`insight-icon ${e.risk_level === 'CRITICAL' ? 'critical' : 'warning'}`}>
                    {e.risk_level === 'CRITICAL' ? '🚨' : '⚠️'}
                  </div>
                  <div className="insight-text">
                    <h4>{e.user_name || `User ${e.user_id}`} — {e.program}</h4>
                    <p>Mood: {e.mood_score}/5 | Risk: {e.risk_level} | {e.city}{e.text ? ` — "${e.text}"` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mood Trend */}
      {stats.moodTrend && stats.moodTrend.length > 0 && (
        <div className="chart-card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">📈 Children Mood Trend</h3>
              <p className="card-subtitle">Daily mood averages for the 6-12 age group</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.moodTrend}>
              <defs>
                <linearGradient id="childMoodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00CEC9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00CEC9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6C6C9C' }} tickFormatter={d => d.slice(5)} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgMood" stroke="#00CEC9" fill="url(#childMoodGrad)"
                strokeWidth={2} dot={false} name="Avg Mood" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
