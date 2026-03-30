import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MapPin, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { getStats } from '../services/api';

const cityEmojis = {
  Hyderabad: '🏛️',
  Bangalore: '💻',
  Delhi: '🏰',
  Mumbai: '🌊',
  Chennai: '🎭'
};

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

export default function GeographicInsights() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Loading geographic data...</p></div>;
  }

  if (!stats || !stats.cityStats || Object.keys(stats.cityStats).length === 0) {
    return <div className="empty-state"><div className="empty-state-icon">🌍</div><h3>No Geographic Data</h3><p>Seed the database from the main dashboard first.</p></div>;
  }

  const cityChartData = Object.entries(stats.cityStats).map(([city, data]) => ({
    city,
    'Avg Mood': parseFloat(data.avgMood),
    'Participants': data.count,
    'High Risk': data.highRisk || 0
  }));

  // Sort cities by mood (ascending for concern)
  const sortedCities = Object.entries(stats.cityStats)
    .sort((a, b) => parseFloat(a[1].avgMood) - parseFloat(b[1].avgMood));

  const bestCity = sortedCities[sortedCities.length - 1];
  const worstCity = sortedCities[0];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🌍 Geographic Insights</h1>
        <p>Compare wellbeing data across Hyderabad, Bangalore, Delhi, Mumbai, and Chennai</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card-icon blue"><MapPin size={22} /></div>
          <div className="stat-card-value">{Object.keys(stats.cityStats).length}</div>
          <div className="stat-card-label">Active Cities</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Users size={22} /></div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-label">Total Across Cities</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><TrendingUp size={22} /></div>
          <div className="stat-card-value">{bestCity?.[0] || '—'}</div>
          <div className="stat-card-label">Best Performing City</div>
          <div className="stat-card-change up">Mood: {bestCity?.[1]?.avgMood}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-value">{worstCity?.[0] || '—'}</div>
          <div className="stat-card-label">Needs Most Attention</div>
          <div className="stat-card-change down">Mood: {worstCity?.[1]?.avgMood}</div>
        </div>
      </div>

      {/* City Comparison Chart */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">City-wise Comparison</h3>
            <p className="card-subtitle">Mood and risk levels across cities</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={cityChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="city" tick={{ fontSize: 12, fill: '#B0B0D0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="Avg Mood" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="High Risk" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* City Cards Grid */}
      <div className="geo-grid">
        {Object.entries(stats.cityStats).map(([city, data]) => {
          const mood = parseFloat(data.avgMood);
          const status = mood >= 3.5 ? 'Healthy' : mood >= 2.5 ? 'Monitor' : 'Alert';
          const statusClass = mood >= 3.5 ? 'low' : mood >= 2.5 ? 'medium' : 'high';

          return (
            <div key={city} className="city-card">
              <div className="city-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{cityEmojis[city] || '🏙️'}</span>
                  <div>
                    <div className="city-name">{city}</div>
                    <span className={`badge ${statusClass}`} style={{ marginTop: 4 }}>{status}</span>
                  </div>
                </div>
              </div>
              <div className="city-stats">
                <div className="city-stat">
                  <div className="city-stat-value" style={{ color: mood >= 3 ? 'var(--success)' : 'var(--danger)' }}>
                    {data.avgMood}
                  </div>
                  <div className="city-stat-label">Avg Mood</div>
                </div>
                <div className="city-stat">
                  <div className="city-stat-value">{data.count}</div>
                  <div className="city-stat-label">Participants</div>
                </div>
                <div className="city-stat">
                  <div className="city-stat-value" style={{ color: data.highRisk > 5 ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {data.highRisk || 0}
                  </div>
                  <div className="city-stat-label">High Risk</div>
                </div>
                <div className="city-stat">
                  <div className="city-stat-value">{data.count > 0 ? Math.round(((data.highRisk || 0) / data.count) * 100) : 0}%</div>
                  <div className="city-stat-label">Risk Rate</div>
                </div>
              </div>

              {/* Mood visualization */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Mood Health</span>
                  <span style={{ fontWeight: 600 }}>{Math.round(mood * 20)}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${mood >= 3.5 ? 'green' : mood >= 2.5 ? 'yellow' : 'red'}`}
                    style={{ width: `${mood * 20}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">🧭 Geographic Insight</h3>
            <p className="card-subtitle">Key finding from regional data</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon insight">📍</div>
          <div className="insight-text">
            <h4>Regional Wellbeing Variation</h4>
            <p>
              {bestCity?.[0]} shows the highest average mood ({bestCity?.[1]?.avgMood}/5) while{' '}
              {worstCity?.[0]} has the lowest ({worstCity?.[1]?.avgMood}/5).{' '}
              {parseFloat(worstCity?.[1]?.avgMood) < 3
                ? `Immediate attention recommended for ${worstCity?.[0]} clusters.`
                : 'Overall city performance is within acceptable range.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
