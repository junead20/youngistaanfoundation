import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import {
  Users, Bell, AlertTriangle, MessageCircle, 
  History, Send, Shield, ChevronDown, CheckCircle, Clock
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function VolunteerDashboard() {
  const { volunteer } = useApp();
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!volunteer?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
      const [mtRes, ntRes] = await Promise.all([
        axios.get('/api/volunteer/mentees', config),
        axios.get('/api/volunteer/notifications', config)
      ]);
      setMentees(mtRes.data);
      setNotifications(ntRes.data);
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
      // Recharts expects mood score 1-10. We'll use 11 - stressLevel for "Mood Score"
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

  const markRead = async (id) => {
    if (!volunteer?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${volunteer.token}` } };
      await axios.put(`/api/volunteer/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { }
  };

  if (loading) return <div className="app-layout" style={{ justifyContent: 'center' }}><span className="spinner" /></div>;

  const isAtRisk = selectedMentee?.latestMood?.stressLevel >= 7;
  const currentNotif = notifications.find(n => n.userId === selectedMentee?.userId);

  return (
    <div className="app-layout" style={{ background: '#F8FAFC', color: '#1E293B', minHeight: '100vh', display: 'flex' }}>
      
      {/* Sidebar - Optional Sidebar from Wireframe */}
      <aside style={{ width: 260, background: 'white', borderRight: '1px solid #E2E8F0', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ padding: 8, background: '#7C3AED', borderRadius: 10 }}><Shield size={20} color="white" /></div>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Volunt-Care</h2>
        </div>

        <div style={{ flex: 1 }}>
          <label className="label" style={{ color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, display: 'block' }}>Mentees</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {mentees.map(m => (
              <button
                key={m.userId}
                onClick={() => handleSelectMentee(m)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  background: selectedMentee?.userId === m.userId ? '#F1F5F9' : 'transparent',
                  color: selectedMentee?.userId === m.userId ? '#0F172A' : '#64748B'
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.userId}</span>
                {m.latestMood?.stressLevel >= 7 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <header style={{ height: 80, background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 50 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Volunteer Dashboard</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 8 }}
              >
                <Bell size={22} color="#64748B" />
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
                )}
              </button>
              
              {showNotifs && (
                <div className="glass" style={{ position: 'absolute', top: '100%', right: 0, width: 320, background: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: 16, marginTop: 12, borderRadius: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#1E293B' }}>Alerts ({notifications.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notifications.length === 0 ? <p style={{ fontSize: 12, color: '#94A3B8' }}>No unread alerts</p> : 
                      notifications.map(n => (
                        <div key={n._id} style={{ padding: 12, background: '#FFF7ED', borderRadius: 10, border: '1px solid #FFEDD5' }}>
                          <p style={{ fontSize: 12, lineHeight: 1.4, color: '#9A3412', marginBottom: 8 }}>{n.message}</p>
                          <button onClick={() => markRead(n._id)} style={{ padding: '4px 8px', background: 'white', border: '1px solid #FFEDD5', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>Mark Read</button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{volunteer?.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Primary Mentor</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronDown size={18} color="#64748B" /></div>
            </div>
          </div>
        </header>

        <main style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Mentee Selector Dropdown */}
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>Select Mentee</span>
            <div style={{ position: 'relative' }}>
              <select 
                className="input" 
                style={{ width: 300, appearance: 'none', background: 'white', border: '1px solid #E2E8F0' }}
                value={selectedMentee?.userId}
                onChange={e => handleSelectMentee(mentees.find(m => m.userId === e.target.value))}
              >
                {mentees.map(m => <option key={m.userId} value={m.userId}>Mentee {m.userId}</option>)}
              </select>
              <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
            
            {/* SECTION A: STUDENT SUMMARY CARD */}
            <section style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Section A: Student Summary Card</h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Mentee ID: <span style={{ fontWeight: 500 }}>{selectedMentee?.userId}</span></div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Current Mood Score: <span style={{ fontWeight: 500, color: isAtRisk ? '#EF4444' : '#10B981' }}>{11 - selectedMentee?.latestMood?.stressLevel}/10</span></div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>Risk Status Label: <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 14, background: isAtRisk ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isAtRisk ? '#EF4444' : '#10B981' }}>{isAtRisk ? 'At Risk' : 'Normal'}</span></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {isAtRisk && <div style={{ background: '#EF4444', color: 'white', padding: '6px 12px', borderRadius: 8, fontWeight: 800, fontSize: 12 }}>At Risk</div>}
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>Last updated: {selectedMentee?.latestMood?.timestamp ? new Date(selectedMentee.latestMood.timestamp).toLocaleDateString() : 'Today'}</div>
                </div>
              </div>
            </section>

            {/* SECTION B: MOOD TREND LINE CHART */}
            <section style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>Section B: Mood Trend Line Chart</h3>
              <div style={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodHistory} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} label={{ value: 'Mood score (1-10)', angle: -90, position: 'insideLeft', offset: 10 }} />
                    <Tooltip 
                      contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: '#7C3AED', fontWeight: 800 }}
                    />
                    <ReferenceLine y={4} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Low Mood', fill: '#EF4444', fontSize: 10 }} />
                    <Line type="monotone" dataKey="mood" stroke="#7C3AED" strokeWidth={3} dot={{ r: 6, fill: '#7C3AED', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 16 }}>Dates (last 7-14 days)</p>
            </section>

            {/* SECTION C: ALERT / NOTIFICATION PANEL */}
            <section style={{ background: isAtRisk ? '#FFF1F2' : 'white', padding: 32, borderRadius: 24, border: `1px solid ${isAtRisk ? '#FECDD3' : '#E2E8F0'}` }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Section C: Alert / Notification Panel</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isAtRisk ? '#F43F5E' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={20} color={isAtRisk ? 'white' : '#94A3B8'} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: 16, color: isAtRisk ? '#9F1239' : '#1E293B' }}>
                      {currentNotif ? currentNotif.message : (isAtRisk ? "At-Risk Alert Detected" : "Status Normal")}
                    </h4>
                    <p style={{ fontSize: 14, color: isAtRisk ? '#BE123C' : '#64748B' }}>
                      {isAtRisk ? "This student has shown high stress levels recently." : "Mentee is consistently maintaining a positive mood trend."}
                    </p>
                  </div>
                </div>
                {isAtRisk && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ color: '#F43F5E', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13 }}>
                      <AlertTriangle size={16} /> At Risk
                    </div>
                    <button className="btn btn-primary" style={{ background: '#F43F5E', border: 'none' }}>Reach Out</button>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION D: ACTION PANEL */}
            <section style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 }}>Section D: Action Panel</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-primary" style={{ height: 48, padding: '0 24px', gap: 8 }}>
                  <MessageCircle size={18} /> Start Conversation
                </button>
                <button className="btn btn-outline" style={{ height: 48, padding: '0 24px', gap: 8, borderColor: '#E2E8F0', color: '#64748B' }}>
                  <History size={18} /> View History
                </button>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

