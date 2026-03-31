import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Shield, Users, PieChart, TrendingUp, Bell, Heart
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

export default function VolunteerDashboard() {
  const { volunteer } = useApp();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalMentees: 0,
    activeInteractions: 0,
    highStressAlerts: 0,
    unreadAlerts: 0
  });
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!volunteer?.token) return;

    const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };

    Promise.all([
      axios.get('/api/volunteer/dashboard-stats', config),
      axios.get('/api/volunteer/mentees', config),
      axios.get('/api/volunteer/notifications', config)
    ]).then(([statsRes, menteeRes, notifRes]) => {
      setStats(statsRes.data.stats);
      setMoodDistribution(statsRes.data.moodDistribution);
      setMentees(menteeRes.data);
      setNotifications(notifRes.data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load mentor dashboard stats:', err);
      setLoading(false);
    });

  }, [volunteer]);

  const markRead = async (id) => {
    if (!volunteer?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
      await axios.put(`/api/volunteer/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setStats(prev => ({ ...prev, unreadAlerts: Math.max(0, prev.unreadAlerts - 1) }));
    } catch { }
  };

  const COLORS = {
    'Happy': '#10B981',
    'Neutral': '#67E8F9',
    'Sad': '#F59E0B',
    'Stressed': '#EF4444'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{ background: '#1A1A3E', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8 }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{label}: {payload[0].value} logs</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="page"><span className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="animate-fade-up">
          <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="section-title">
                <Shield size={22} style={{ display: 'inline', marginRight: 10, color: '#A78BFA' }} />
                Volunteer Overview
              </h1>
              <p className="section-subtitle">Macro-level analysis and monitoring of assigned mentees.</p>
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(167, 139, 250, 0.1)', color: '#A78BFA', borderRadius: 99, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }} />
              Mentor Portal
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Assigned Mentees', value: stats.totalMentees, color: '#67E8F9', icon: Users },
              { label: 'Unread Alerts', value: stats.unreadAlerts, color: '#F59E0B', icon: Bell },
              { label: 'Est. Active Checks', value: stats.activeInteractions, color: '#10B981', icon: TrendingUp },
              { label: 'Critical / At-Risk', value: stats.highStressAlerts, color: '#EF4444', icon: PieChart },
            ].map((s, i) => (
              <div key={i} className="glass" style={{ padding: 20, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.5 }}>{s.label}</span>
                  <s.icon size={16} color={s.color} />
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 32 }}>

            {/* Charts Analysis */}
            <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Mentee Mood Breakdown</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Macro summary of how mentees in the platform are feeling based on recent check-ins.</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={moodDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#A78BFA'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Notifications Panel */}
            <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Action Required</h3>
                {stats.unreadAlerts > 0 && <span style={{ padding: '2px 8px', borderRadius: 99, background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 800 }}>{stats.unreadAlerts} New</span>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Unread alerts demanding mentor attention.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No unread alerts left!</div>
                ) : notifications.map(n => (
                  <div key={n._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', marginTop: 6 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Triggered recently</div>
                    </div>
                    <button
                      onClick={() => markRead(n._id)}
                      style={{ fontSize: 11, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-light)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Mentee Roster Table */}
          <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Global Mentee Roster</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Mentee Handle</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Current Mood Status</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Risk Level</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mentees.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No mentees in the database.</td>
                    </tr>
                  ) : mentees.map((m, i) => {
                    if (!m.userId) return null; // Skip entries without userId (shouldn't happen ideally)
                    const isAtRisk = m.latestMood?.stressLevel >= 7;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '16px', fontWeight: 600 }}>{m.userId || 'Anonymous User'}</td>
                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[m.latestMood?.emotion] || '#64748B' }} />
                            {m.latestMood?.emotion || 'Unknown'} (Stress: {m.latestMood?.stressLevel || 'N/A'})
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isAtRisk ? '#EF4444' : '#10B981', background: isAtRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: 6 }}>
                            {isAtRisk ? 'At Risk' : 'Normal'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)' }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
