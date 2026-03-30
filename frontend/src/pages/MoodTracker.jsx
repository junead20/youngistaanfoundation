import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Heart, Calendar, TrendingUp, PieChart,
  Plus, History, CheckCircle, Wind
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RePie, Pie, Cell, AreaChart, Area
} from 'recharts';

const EMOTIONS = [
  { emoji: '😊', label: 'Happy', value: 'Happy', color: '#10B981' },
  { emoji: '😐', label: 'Neutral', value: 'Neutral', color: '#F59E0B' },
  { emoji: '😔', label: 'Sad', value: 'Sad', color: '#3B82F6' },
  { emoji: '😣', label: 'Stressed', value: 'Stressed', color: '#EF4444' }
];

const STRESSORS = ['Studies', 'Family', 'Relationships', 'Anxiety', 'Work', 'Loneliness', 'Health'];

export default function MoodTracker() {
  const { user } = useApp();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ emotion: 'Happy', stressors: [], stressLevel: 5, note: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/mood', { headers: { Authorization: `Bearer ${user?.token}` } });
      const data = res.data.entries;
      
      if (data && data.length > 0) {
        setEntries(data);
      } else {
        // Use mock data if database is empty
        const mock = Array.from({ length: 7 }).map((_, i) => ({
          _id: `mock-${i}`,
          emotion: ['Happy', 'Neutral', 'Stressed', 'Sad', 'Happy', 'Neutral', 'Happy'][i % 7],
          stressLevel: [3, 5, 8, 7, 4, 6, 3][i % 7],
          stressors: i % 2 === 0 ? ['Studies', 'Anxiety'] : ['Family'],
          timestamp: new Date(Date.now() - i * 86400000).toISOString()
        }));
        setEntries(mock);
      }
    } catch (e) {
      const mock = Array.from({ length: 7 }).map((_, i) => ({
        _id: `err-mock-${i}`,
        emotion: ['Happy', 'Neutral', 'Stressed', 'Sad', 'Happy', 'Neutral', 'Happy'][i % 7],
        stressLevel: [3, 5, 8, 7, 4, 6, 3][i % 7],
        stressors: ['Studies'],
        timestamp: new Date(Date.now() - i * 86400000).toISOString()
      }));
      setEntries(mock);
    } finally {
      setLoading(false);
    }
  };

  const toggleStressor = (s) => {
    setForm(prev => ({
      ...prev,
      stressors: prev.stressors.includes(s) ? prev.stressors.filter(x => x !== s) : [...prev.stressors, s]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/mood', form, { headers: { Authorization: `Bearer ${user?.token}` } });
      fetchEntries();
      setShowForm(false);
      setForm({ emotion: 'Happy', stressors: [], stressLevel: 5, note: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getPieData = () => {
    const counts = entries.reduce((acc, curr) => {
      acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(k => ({ name: k, value: counts[k], color: EMOTIONS.find(e => e.value === k)?.color }));
  };

  const getLineData = () => {
     return entries.slice().reverse().map(e => ({
        date: new Date(e.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' }),
        level: e.stressLevel
     }));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 className="section-title"><Heart size={22} style={{ display: 'inline', marginRight: 10, color: '#EC4899' }} />Mood Tracker</h1>
            <p className="section-subtitle">Understanding your emotional journey and stress triggers.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> {showForm ? 'Cancel' : 'Log Daily Entry'}
          </button>
        </div>

        {showForm && (
          <div className="glass animate-fade-up" style={{ padding: 28, marginBottom: 32 }}>
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>How are you feeling today?</h2>
              
              <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
                {EMOTIONS.map(e => (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setForm({ ...form, emotion: e.value })}
                    className={`emotion-card ${form.emotion === e.value ? 'selected' : ''}`}
                    style={{ flex: 1 }}
                  >
                    <span className="emoji">{e.emoji}</span>
                    <span className="label">{e.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 32 }}>
                <label className="label">Primary Stressors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STRESSORS.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => toggleStressor(s)}
                      className={`chip ${form.stressors.includes(s) ? 'selected' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label className="label">Stress Level (1–10)</label>
                  <span style={{ fontWeight: 700, color: form.stressLevel > 6 ? '#EF4444' : '#10B981' }}>{form.stressLevel}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="1"
                  value={form.stressLevel}
                  onChange={e => setForm({ ...form, stressLevel: Number(e.target.value) })}
                  className="slider"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Note</label>
                <textarea className="input" rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Entry</button>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Stress Trend Chart */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <TrendingUp size={18} color="#A78BFA" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Stress Trend</h3>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getLineData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} 
                    itemStyle={{ color: 'var(--purple-light)' }} 
                  />
                  <Area type="monotone" dataKey="level" stroke="var(--purple-primary)" fill="url(#colorStress)" strokeWidth={3} />
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--purple-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--purple-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <PieChart size={18} color="#06B6D4" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Emotion Distribution</h3>
            </div>
            <div style={{ height: 230 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <RePie>
                   <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {getPieData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                   </Pie>
                   <Tooltip />
                 </RePie>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <History size={18} color="#F59E0B" />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent History</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>MOOD</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>STRESS</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>TRIGGERS</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const emo = EMOTIONS.find(emo => emo.value === e.emotion);
                  const color = e.stressLevel <= 3 ? '#10B981' : e.stressLevel <= 6 ? '#F59E0B' : '#EF4444';
                  return (
                    <tr key={e._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontSize: 14 }}>{new Date(e.timestamp).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 20 }}>{emo?.emoji}</span>
                          <span style={{ fontSize: 14 }}>{e.emotion}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}><div style={{ fontWeight: 800, color }}>{e.stressLevel}</div></td>
                      <td style={{ padding: '16px' }}>
                         <div style={{ display: 'flex', gap: 6 }}>
                            {e.stressors?.map(s => <span key={s} className="badge badge-purple" style={{ fontSize: 10 }}>{s}</span>)}
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
