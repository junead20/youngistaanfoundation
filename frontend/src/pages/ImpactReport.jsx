import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { getImpactStats } from '../services/api';

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

export default function ImpactReport() {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getImpactStats();
        setImpact(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Loading impact data...</p></div>;
  }

  if (!impact || impact.total === 0) {
    return <div className="empty-state"><div className="empty-state-icon">📈</div><h3>No Impact Data</h3><p>Seed the database from the main dashboard first.</p></div>;
  }

  // Build comparison chart data
  const programImpactData = Object.entries(impact.programImpact).map(([name, data]) => ({
    name,
    'Confidence Δ': parseFloat(data.avgConfImprovement),
    'Mood Δ': parseFloat(data.avgMoodImprovement),
    'Engagement Δ': parseFloat(data.avgEngImprovement),
    workshops: data.count,
    participants: data.participants
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📈 Impact Report</h1>
        <p>Measurable impact of Youngistaan's programs — before vs after workshop metrics for donors</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><Award size={22} /></div>
          <div className="stat-card-value">{impact.total}</div>
          <div className="stat-card-label">Workshops Conducted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon teal"><Users size={22} /></div>
          <div className="stat-card-value">{impact.totalParticipants}</div>
          <div className="stat-card-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><TrendingUp size={22} /></div>
          <div className="stat-card-value">+{impact.avgImprovement.confidence}</div>
          <div className="stat-card-label">Avg Confidence Boost</div>
          <div className="stat-card-change up">↑ Improvement</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange"><TrendingUp size={22} /></div>
          <div className="stat-card-value">+{impact.avgImprovement.mood}</div>
          <div className="stat-card-label">Avg Mood Boost</div>
          <div className="stat-card-change up">↑ Improvement</div>
        </div>
      </div>

      {/* Before vs After Visual */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">🎯 Before vs After — Overall Impact</h3>
            <p className="card-subtitle">Average improvement across all workshops</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 8 }}>
          {[
            { label: 'Confidence', before: (3.0 - parseFloat(impact.avgImprovement.confidence) / 2).toFixed(1), after: (3.0 + parseFloat(impact.avgImprovement.confidence) / 2).toFixed(1), improvement: impact.avgImprovement.confidence },
            { label: 'Mood', before: (3.0 - parseFloat(impact.avgImprovement.mood) / 2).toFixed(1), after: (3.0 + parseFloat(impact.avgImprovement.mood) / 2).toFixed(1), improvement: impact.avgImprovement.mood },
            { label: 'Engagement', before: (5.0 - parseFloat(impact.avgImprovement.engagement) / 2).toFixed(1), after: (5.0 + parseFloat(impact.avgImprovement.engagement) / 2).toFixed(1), improvement: impact.avgImprovement.engagement },
          ].map((metric, i) => (
            <div key={i} style={{
              padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              background: 'var(--bg-glass)', textAlign: 'center'
            }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)' }}>
                {metric.label}
              </h4>
              <div className="impact-comparison" style={{ gridTemplateColumns: '1fr auto 1fr', display: 'grid', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--warning-dark)' }}>
                    {metric.before}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Before</div>
                </div>
                <div style={{ fontSize: 24, color: 'var(--accent)' }}>→</div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--success)' }}>
                    {metric.after}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>After</div>
                </div>
              </div>
              <div style={{
                marginTop: 16, padding: '6px 16px', borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 184, 148, 0.1)', color: 'var(--success)',
                fontSize: 14, fontWeight: 700, display: 'inline-block'
              }}>
                +{metric.improvement} improvement
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Impact Chart */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Program-wise Impact</h3>
            <p className="card-subtitle">Average improvement per program</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={programImpactData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6C6C9C' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6C6C9C' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ color: '#B0B0D0', fontSize: 12 }}>{v}</span>} />
            <Bar dataKey="Confidence Δ" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Mood Δ" fill="#00CEC9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Engagement Δ" fill="#FDCB6E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Program Impact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {Object.entries(impact.programImpact).map(([name, data]) => (
          <div key={name} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
            <h3 className="card-title" style={{ marginBottom: 4 }}>
              {name === 'Bright Spark' ? '✨' : name === 'Gender Equality' ? '⚖️' : '🧑‍🏫'} {name}
            </h3>
            <p className="card-subtitle" style={{ marginBottom: 16 }}>
              {data.count} workshops • {data.participants} participants
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Confidence', value: data.avgConfImprovement, color: 'var(--primary-light)' },
                { label: 'Mood', value: data.avgMoodImprovement, color: 'var(--accent)' },
                { label: 'Engagement', value: data.avgEngImprovement, color: 'var(--warning)' },
              ].map((m) => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-tertiary)' }}>{m.label}</span>
                    <span style={{ fontWeight: 700, color: parseFloat(m.value) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {parseFloat(m.value) > 0 ? '+' : ''}{m.value}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill green"
                      style={{ width: `${Math.min(Math.abs(parseFloat(m.value)) * 30, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Workshops */}
      {impact.workshops && impact.workshops.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📋 Recent Workshops</h3>
              <p className="card-subtitle">Latest workshops with pre/post scores</p>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>City</th>
                <th>Volunteer</th>
                <th>Participants</th>
                <th>Pre-Confidence</th>
                <th>Post-Confidence</th>
                <th>Change</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {impact.workshops.map((w, i) => {
                const change = ((w.post_scores?.avg_confidence || 0) - (w.pre_scores?.avg_confidence || 0)).toFixed(1);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.program}</td>
                    <td>{w.city}</td>
                    <td>{w.volunteer_name || '—'}</td>
                    <td>{w.participants_count}</td>
                    <td style={{ color: 'var(--warning-dark)' }}>{w.pre_scores?.avg_confidence?.toFixed(1)}</td>
                    <td style={{ color: 'var(--success)' }}>{w.post_scores?.avg_confidence?.toFixed(1)}</td>
                    <td>
                      <span style={{
                        color: parseFloat(change) > 0 ? 'var(--success)' : 'var(--danger)',
                        fontWeight: 600
                      }}>
                        {parseFloat(change) > 0 ? '+' : ''}{change}
                      </span>
                    </td>
                    <td>{new Date(w.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
