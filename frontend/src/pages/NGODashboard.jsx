import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Building2, Users, PieChart, TrendingUp, Heart
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

export default function NGODashboard() {
  const { volunteer } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalUsers: 0,
    activeInteractions: 0,
    highStressAlerts: 0
  });
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    if (!volunteer?.token) return;

    const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
    
    Promise.all([
      axios.get('/api/ngo/admin/stats', config),
      axios.get('/api/ngo/admin/volunteers', config)
    ]).then(([statsRes, volRes]) => {
      setStats(statsRes.data.stats);
      setMoodDistribution(statsRes.data.moodDistribution);
      setVolunteers(volRes.data.volunteers);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load NGO dashboard stats:', err);
      setLoading(false);
    });

  }, [volunteer]);

  const COLORS = {
    'Happy': '#10B981',
    'Neutral': '#67E8F9',
    'Sad': '#F59E0B',
    'Stressed': '#EF4444'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1A1A3E', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: 8 }}>
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
                <Building2 size={22} style={{ display: 'inline', marginRight: 10, color: '#06B6D4' }} />
                NGO Control Center
              </h1>
              <p className="section-subtitle">Real-time platform insights and volunteer monitoring.</p>
            </div>
            <div style={{ padding: '8px 16px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', borderRadius: 99, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06B6D4' }} />
              Admin Portal
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
            {[
              { label: 'Total Anonymous Users', value: stats.totalUsers, color: '#A78BFA', icon: Users },
              { label: 'Registered Mentors', value: stats.totalVolunteers, color: '#F59E0B', icon: Heart },
              { label: 'Est. Active Interactions', value: stats.activeInteractions, color: '#10B981', icon: TrendingUp },
              { label: 'Critical Stress Logs', value: stats.highStressAlerts, color: '#EF4444', icon: PieChart },
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
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Platform Health & Mood</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>A breakdown of generalized user mood states over the ecosystem based on recent check-ins.</p>
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

            {/* Quick List of Volunteers */}
            <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Volunteer Pulse</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Recently added or active volunteers.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflowY: 'auto' }}>
                {volunteers.slice(0, 5).map(v => (
                  <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-primary), var(--pink-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                    {v.name?.[0] || 'V'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v.name || 'Unknown Mentor'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.expertise?.[0] || 'General Support'}</div>
                    </div>
                    <div style={{ fontSize: 11, padding: '4px 8px', borderRadius: 99, background: v.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: v.isAvailable ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                      {v.isAvailable ? 'Available' : 'Offline'}
                    </div>
                  </div>
                ))}
                {volunteers.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No volunteers yet.</div>
                )}
              </div>
            </div>

          </div>

          {/* Global Directory Table */}
          <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Complete Volunteer Roster</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Volunteer Name</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Email Address</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Expertise Areas</th>
                    <th style={{ padding: '0 16px 12px 16px', color: 'var(--text-muted)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No volunteers found in the database.</td>
                    </tr>
                  ) : volunteers.map(v => (
                    <tr key={v._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{v.name || 'Unknown Mentor'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{v.email || 'No email'}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(v.expertise || []).map(exp => (
                            <span key={exp} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>{exp}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: v.isAvailable ? '#10B981' : '#EF4444' }}>
                          ● {v.isAvailable ? 'Ready for sessions' : 'Offline / Busy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
