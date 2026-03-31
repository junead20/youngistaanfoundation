import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Users, Bell, AlertTriangle, MessageCircle,
  History, Send, Shield, ChevronDown, CheckCircle, Clock,
  Activity, User, Calendar, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';

export default function MenteeAnalysis() {
  const { volunteer } = useApp();
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!volunteer?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
      const mtRes = await axios.get('/api/volunteer/mentees', config);
      setMentees(mtRes.data);
      if (mtRes.data.length > 0) {
        handleSelectMentee(mtRes.data[0]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMentee = async (mentee) => {
    if (!volunteer?.token) return;
    setSelectedMentee(mentee);
    try {
      const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
      const res = await axios.get(`/api/volunteer/mentees/${mentee.userId}/history`, config);
      const chartData = res.data.map(d => ({
        date: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        mood: 11 - d.stressLevel,
        stress: d.stressLevel,
        emotion: d.emotion
      }));
      setMoodHistory(chartData);
    } catch (err) {
      console.error('History error:', err);
    }
  };

  if (loading) return <div className="page"><span className="spinner" /></div>;

  const isAtRisk = selectedMentee?.latestMood?.stressLevel >= 7;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0, overflow: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Persistent Sub-Header */}
        <header className="glass" style={{ flexShrink: 0, height: 70, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 10, backdropFilter: 'blur(20px)', borderRadius: 0, borderTop: 'none', borderLeft: 'none' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={20} color="var(--purple-primary)" />
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Mentee Performance Analysis</h1>
            </div>
          </div>
          <div className="glass" style={{ padding: '6px 14px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.4)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Live Monitor</span>
          </div>
        </header>

        {/* Scaled Content Area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>

          {/* Left Panel: Mentee List (Fixed height scrollable) */}
          <aside style={{ width: 320, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.2)' }}>
            <div style={{ padding: '24px 20px 12px 20px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Assigned Mentees ({mentees.length})</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 24px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mentees.map(m => {
                if (!m.latestMood || !m.userId) return null; // Skip if no mood data available
                const active = selectedMentee?.userId === m.userId;
                const risk = m.latestMood?.stressLevel >= 7;
                return (
                  <button
                    key={m.userId}
                    onClick={() => handleSelectMentee(m)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      borderRadius: 14, border: active ? '1px solid var(--purple-primary)' : '1px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                      background: active ? 'white' : 'transparent',
                      boxShadow: active ? '0 4px 12px rgba(199, 182, 240, 0.2)' : 'none',
                    }}
                    className="mentee-list-item"
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: active ? 'var(--purple-primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'white' : 'var(--text-muted)' }}>
                      <User size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.userId || 'Anonymous'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last: {m.latestMood?.emotion || 'N/A'}</div>
                    </div>
                    {risk && <AlertTriangle size={14} color="#EF4444" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))' }} />}
                  </button>
                )
              })}
            </div>
          </aside>

          {/* Main Visualizer Area */}
          <section style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            {selectedMentee ? (
              <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-up">

                {/* 1. Profile Header Strip */}
                <div className="glass" style={{ padding: '24px 32px', borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple-primary)', textTransform: 'uppercase' }}>Current Case</span>
                      <Shield size={14} color="var(--purple-primary)" />
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, letterSpacing: -0.5 }}>{selectedMentee?.userId}</h2>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={14} /> Registered {selectedMentee?.createdAt ? new Date(selectedMentee.createdAt).toLocaleDateString() : 'Today'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="glass" style={{ padding: '10px 20px', borderRadius: 16, background: isAtRisk ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', border: `1px solid ${isAtRisk ? '#EF4444' : '#10B981'}`, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: isAtRisk ? '#EF4444' : '#10B981', textTransform: 'uppercase', marginBottom: 2 }}>Risk Assessment</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: isAtRisk ? '#EF4444' : '#10B981' }}>{isAtRisk ? 'High Alert' : 'Healthy'}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  {[
                    { label: 'Emotion State', value: selectedMentee?.latestMood?.emotion || 'Unknown', color: 'var(--text-primary)' },
                    { label: 'Wellness Index', value: `${11 - (selectedMentee?.latestMood?.stressLevel || 5)}/10`, color: 'var(--purple-primary)' },
                    { label: 'Stress Factor', value: `${selectedMentee?.latestMood?.stressLevel || 0}/10`, color: isAtRisk ? '#EF4444' : 'var(--teal-primary)' }
                  ].map((stat, i) => (
                    <div key={i} className="glass" style={{ padding: 20, borderRadius: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Detailed Progress Chart */}
                <div className="glass" style={{ padding: 32, borderRadius: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>14-Day Wellness Trajectory</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={14} /> Analyzing trends
                    </div>
                  </div>
                  <div style={{ height: 320, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodHistory}>
                        <defs>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--purple-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--purple-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{ borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                          itemStyle={{ color: 'var(--purple-primary)', fontWeight: 800 }}
                        />
                        <ReferenceLine y={4} stroke="#EF4444" strokeDasharray="5 5" />
                        <Area type="monotone" dataKey="mood" stroke="var(--purple-primary)" strokeWidth={4} fillOpacity={1} fill="url(#moodGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Action Center */}
                <div className="glass" style={{ padding: '32px 40px', borderRadius: 32, background: isAtRisk ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <h4 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MessageCircle size={20} color="var(--purple-primary)" />
                      Intervention Guidelines
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                      {isAtRisk
                        ? "Critical stress levels detected. Immediate reach-out is recommended. Review recent logs for specific triggers."
                        : "Stability maintained. Regular weekly sessions are sufficient for this profile."}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary" style={{ height: 52, padding: '0 24px', borderRadius: 16, fontSize: 15 }}>
                      Start Conversation
                    </button>
                    <button className="btn btn-outline" style={{ height: 52, padding: '0 24px', borderRadius: 16, fontSize: 15 }}>
                      History
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Users size={32} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Ready for Analysis</h3>
                <p style={{ display: 'block', padding: '0 20px' }}>Select a mentee from the panel to generate a wellness report.</p>
              </div>
            )}
          </section>

        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .mentee-list-item:hover {
          background: rgba(255,255,255,0.5) !important;
          transform: translateX(4px);
        }
      `}} />
    </div>
  );
}
