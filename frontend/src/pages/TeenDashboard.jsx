import { useState, useEffect } from 'react';
import {
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Activity, Brain, TrendingDown, Users, AlertTriangle, BookOpen } from 'lucide-react';
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

export default function TeenDashboard() {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, entriesData] = await Promise.all([
          getStats({ age_group: '13-19' }),
          getEntries({ age_group: '13-19' })
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
        <p className="loading-text">Loading teen dashboard...</p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧑‍🎓</div>
        <h3>No Teen Data</h3>
        <p>Seed the database from the main dashboard first.</p>
      </div>
    );
  }

  const programData = Object.entries(stats.programStats).map(([name, data]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    fullName: name,
    'Avg Mood': parseFloat(data.avgMood),
    'Avg Engagement': parseFloat(data.avgEngagement),
    'Low Confidence %': data.lowConfPct,
    participants: data.count
  }));

  // Mood vs Engagement correlation
  const moodEngagementData = [1, 2, 3, 4, 5].map(mood => {
    const matching = entries.filter(e => e.mood_score === mood);
    const avgEng = matching.length > 0
      ? matching.reduce((s, e) => s + (e.engagement_score || 5), 0) / matching.length
      : 0;
    return {
      mood: `Mood ${mood}`,
      'Avg Engagement': parseFloat(avgEng.toFixed(1)),
      count: matching.length
    };
  });

  const radarData = [
    { subject: 'Academic', A: parseFloat(stats.avgMood) * 18 },
    { subject: 'Social', A: stats.peerSupportCount > 0 ? Math.min((stats.peerSupportCount / stats.total) * 200, 100) : 40 },
    { subject: 'Emotional', A: parseFloat(stats.avgMood) * 20 },
    { subject: 'Confidence', A: 100 - (Object.values(stats.programStats).reduce((s, p) => s + p.lowConfPct, 0) / Math.max(Object.keys(stats.programStats).length, 1)) },
    { subject: 'Support', A: stats.helpCount > 0 ? Math.min((stats.helpCount / stats.total) * 300, 100) : 30 },
  ];

  const recentAlerts = entries.filter(e => e.risk_level === 'HIGH' || e.risk_level === 'CRITICAL').slice(0, 6);

  // Stress keywords analysis
  const stressWords = { 'stress': 0, 'anxiety': 0, 'alone': 0, 'sleep': 0, 'exam': 0, 'pressure': 0 };
  entries.forEach(e => {
    if (e.text) {
      Object.keys(stressWords).forEach(w => {
        if (e.text.toLowerCase().includes(w)) stressWords[w]++;
      });
    }
  });
  const stressData = Object.entries(stressWords).filter(([, v]) => v > 0)
    .map(([word, count]) => ({ word: word.charAt(0).toUpperCase() + word.slice(1), count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🧑‍🎓 Teens Dashboard (Ages 13-19)</h1>
        <p>Monitoring anxiety, social pressure, academic stress, and adolescent mental health</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><Users size={22} /></div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Teens Tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Activity size={22} /></div>
          <div className="stat-card-value">{stats.avgMood}</div>
          <div className="stat-card-label">Average Mood</div>
          <div className={`stat-card-change ${parseFloat(stats.avgMood) >= 3 ? 'up' : 'down'}`}>
            {parseFloat(stats.avgMood) >= 3 ? '✓ Stable' : '↓ Declining'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange"><Brain size={22} /></div>
          <div className="stat-card-value">
            {Math.round(Object.values(stats.programStats).reduce((s, p) => s + parseFloat(p.avgEngagement || 5), 0) / Math.max(Object.keys(stats.programStats).length, 1) * 10)}%
          </div>
          <div className="stat-card-label">Engagement Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><TrendingDown size={22} /></div>
          <div className="stat-card-value">{(stats.riskDistribution.HIGH || 0) + (stats.riskDistribution.CRITICAL || 0)}</div>
          <div className="stat-card-label">High Risk Teens</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Mood vs Engagement Correlation */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📚 Mood ↔ Engagement Correlation</h3>
              <p className="card-subtitle">How mood affects learning engagement</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={moodEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mood" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Avg Engagement" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
            💡 Students with low mood show significantly lower engagement
          </p>
        </div>

        {/* Wellness Radar */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Adolescent Wellness Radar</h3>
              <p className="card-subtitle">Multi-dimensional teen wellbeing</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius={90} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#B0B0D0' }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#00CEC9" fill="#00CEC9" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* Stress Keyword Analysis */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">🔍 Stress Keyword Analysis</h3>
              <p className="card-subtitle">Most mentioned stress indicators</p>
            </div>
          </div>
          {stressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
                <YAxis type="category" dataKey="word" tick={{ fontSize: 12, fill: '#B0B0D0' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FF6B6B" radius={[0, 4, 4, 0]} name="Mentions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No stress keywords detected</p></div>
          )}
        </div>

        {/* Program Stats */}
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Program Performance</h3>
              <p className="card-subtitle">Teen data by program</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={programData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="Avg Mood" fill="#A29BFE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Low Confidence %" fill="#FDCB6E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      {recentAlerts.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">🚨 Teen Risk Alerts</h3>
              <p className="card-subtitle">Adolescents who may need immediate intervention</p>
            </div>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>City</th>
                <th>Mood</th>
                <th>Risk</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.user_name || e.user_id}</td>
                  <td>{e.program}</td>
                  <td>{e.city}</td>
                  <td>
                    <span style={{ color: e.mood_score <= 2 ? 'var(--danger)' : 'var(--warning)' }}>
                      {e.mood_score}/5
                    </span>
                  </td>
                  <td><span className={`badge ${e.risk_level.toLowerCase()}`}>{e.risk_level}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.text || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mood Trend */}
      {stats.moodTrend && stats.moodTrend.length > 0 && (
        <div className="chart-card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">📉 Teen Mood Trend</h3>
              <p className="card-subtitle">Daily mood averages — watch for exam-month spikes</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.moodTrend}>
              <defs>
                <linearGradient id="teenMoodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A29BFE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A29BFE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6C6C9C' }} tickFormatter={d => d.slice(5)} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#6C6C9C' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgMood" stroke="#A29BFE" fill="url(#teenMoodGrad)"
                strokeWidth={2} dot={false} name="Avg Mood" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights */}
      {stats.insights && stats.insights.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">🧠 Teen-Specific Insights</h3>
              <p className="card-subtitle">AI-generated insights for adolescent wellbeing</p>
            </div>
          </div>
          <div className="insights-container">
            {stats.insights.map((insight, i) => (
              <div key={i} className="insight-card">
                <div className={`insight-icon ${insight.type}`}>
                  {insight.type === 'critical' ? '🚨' : insight.type === 'warning' ? '⚠️' :
                    insight.type === 'alert' ? '🔔' : insight.type === 'insight' ? '💡' : 'ℹ️'}
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
