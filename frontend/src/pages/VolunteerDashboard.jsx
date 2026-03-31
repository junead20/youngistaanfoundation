import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import {
  Users, ToggleLeft, ToggleRight, Star,
  MessageCircle, Clock, CheckCircle, AlertTriangle,
  History, Heart, Info, ArrowLeft, Send,
  Calendar, TrendingUp, X, BarChart2, LogOut
} from 'lucide-react';

// Generate mock calendar data for 30 days
function generateMockCalendarData() {
  const data = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    if (Math.random() > 0.25) { // 75% days have data
      const avgStress = Math.floor(Math.random() * 10) + 1;
      data[dateKey] = {
        date: dateKey,
        avgStressLevel: avgStress,
        userCount: Math.floor(Math.random() * 12) + 1,
        distressCount: avgStress >= 7 ? Math.floor(Math.random() * 4) + 1 : 0,
        personas: ['Caring Parent', 'Supportive Friend', 'Wise Mentor'].filter(() => Math.random() > 0.4),
        topEmotions: ['Stressed', 'Sad', 'Anxious', 'Okay', 'Happy'].filter(() => Math.random() > 0.5),
        topCauses: ['Exams', 'Family', 'Relationships', 'Work', 'Health'].filter(() => Math.random() > 0.6),
        interactionCount: Math.floor(Math.random() * 30) + 3
      };
    }
  }
  return data;
}

const MOCK_REQUESTS = [
  {
    id: 1, userId: 'MBX4821', emotion: 'Stressed', stressLevel: 8,
    stressors: ['Studies', 'Anxiety'], time: '2 min ago', status: 'waiting',
    questionnaire: { sleep: 5, energy: 3, anxiety: 5 },
    lastNote: "I have three finals next week and I haven't even started studying. My chest feels tight."
  },
  {
    id: 2, userId: 'MBX2193', emotion: 'Sad', stressLevel: 6,
    stressors: ['Family'], time: '8 min ago', status: 'waiting',
    questionnaire: { sleep: 3, energy: 5, anxiety: 3 },
    lastNote: "My parents are fighting again. It's hard to focus on anything else."
  },
  {
    id: 3, userId: 'MBX9056', emotion: 'Stressed', stressLevel: 9,
    stressors: ['Relationships', 'Anxiety'], time: '15 min ago', status: 'waiting',
    questionnaire: { sleep: 4, energy: 4, anxiety: 4 },
    lastNote: "My partner and I just broke up. I feel like my world is ending."
  },
  {
    id: 4, userId: 'SOS-TR72', emotion: 'Crisis', stressLevel: 10,
    stressors: ['Emergency'], time: 'Just now', status: 'waiting',
    isEmergency: true, lastNote: 'VOICE_SOS: "I am feeling very alone and I don\'t know what to do. Please help me, bachao."'
  },
];

const RECENT_SESSIONS = [
  { id: 's1', userId: 'MBX3310', duration: '24 min', rating: 5, topic: 'Exam anxiety' },
  { id: 's2', userId: 'MBX7821', duration: '18 min', rating: 4, topic: 'Family conflict' },
];

function MoodCalendar() {
  const [calendarData] = useState(generateMockCalendarData);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth] = useState(new Date());

  const getDayColor = (dateKey) => {
    const d = calendarData[dateKey];
    if (!d) return { bg: 'rgba(255,255,255,0.03)', text: 'var(--text-muted)', label: 'No data' };
    if (d.avgStressLevel >= 7) return { bg: 'rgba(239,68,68,0.2)', text: '#FCA5A5', label: 'High stress', border: '#EF4444' };
    if (d.avgStressLevel >= 4) return { bg: 'rgba(245,158,11,0.2)', text: '#FCD34D', label: 'Moderate', border: '#F59E0B' };
    return { bg: 'rgba(16,185,129,0.2)', text: '#6EE7B7', label: 'Good', border: '#10B981' };
  };

  // Build calendar grid for current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const totalUsers = Object.values(calendarData).reduce((s, d) => s + d.userCount, 0);
  const distressTotal = Object.values(calendarData).reduce((s, d) => s + d.distressCount, 0);
  const activeDays = Object.keys(calendarData).length;

  const selectedData = selectedDate ? calendarData[selectedDate] : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 380px' : '1fr', gap: 24, alignItems: 'start' }}>
      <div>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Active Days', value: activeDays, color: '#A78BFA' },
            { label: 'Total Check-ins', value: totalUsers, color: '#06B6D4' },
            { label: 'Distress Episodes', value: distressTotal, color: '#EF4444' },
            { label: 'Recovery Rate', value: `${activeDays ? Math.round((activeDays - distressTotal) / activeDays * 100) : 0}%`, color: '#10B981' }
          ].map((s, i) => (
            <div key={i} className="glass" style={{ padding: '16px 20px', textAlign: 'center', borderRadius: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>LEGEND:</span>
          {[
            { color: '#10B981', label: 'Good (1-3)' },
            { color: '#F59E0B', label: 'Moderate (4-6)' },
            { color: '#EF4444', label: 'High Stress (7-10)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, opacity: 0.7 }} />
              <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>No data</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{monthName}</h3>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click any day to view details</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const colors = getDayColor(dateKey);
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              const isSelected = selectedDate === dateKey;
              const data = calendarData[dateKey];
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  title={colors.label}
                  style={{
                    aspectRatio: '1', borderRadius: 10, background: colors.bg,
                    border: isSelected ? `2px solid ${colors.border || '#A78BFA'}` : isToday ? '2px solid #A78BFA' : `1px solid ${colors.border ? colors.border + '40' : 'var(--border)'}`,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    transition: 'all 0.2s', transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: isToday ? 900 : 600, color: colors.text }}>{day}</span>
                  {data && <span style={{ fontSize: 8, color: colors.text, opacity: 0.8 }}>{data.userCount}u</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDate && selectedData && (
        <div className="glass animate-fade-right" style={{ padding: 24, borderRadius: 20, position: 'sticky', top: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</h3>
            <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>

          {/* Stress meter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Avg Stress Level</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: selectedData.avgStressLevel >= 7 ? '#EF4444' : selectedData.avgStressLevel >= 4 ? '#F59E0B' : '#10B981' }}>{selectedData.avgStressLevel}/10</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${selectedData.avgStressLevel * 10}%`, borderRadius: 4, background: selectedData.avgStressLevel >= 7 ? '#EF4444' : selectedData.avgStressLevel >= 4 ? '#F59E0B' : '#10B981', transition: 'all 0.5s' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Users', value: selectedData.userCount, color: '#A78BFA' },
              { label: 'Distress', value: selectedData.distressCount, color: '#EF4444' },
              { label: 'Interactions', value: selectedData.interactionCount, color: '#06B6D4' },
              { label: 'Resolved', value: selectedData.userCount - selectedData.distressCount, color: '#10B981' }
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Emotions Detected</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(selectedData.topEmotions?.length ? selectedData.topEmotions : ['Stressed']).map(e => (
                <span key={e} className="badge badge-purple" style={{ fontSize: 11 }}>{e}</span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Main Causes</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(selectedData.topCauses?.length ? selectedData.topCauses : ['Various']).map(c => (
                <span key={c} className="badge badge-teal" style={{ fontSize: 11 }}>{c}</span>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Personas Used</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(selectedData.personas?.length ? selectedData.personas : ['General']).map(p => (
                <span key={p} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedDate && !selectedData && (
        <div className="glass" style={{ padding: 32, borderRadius: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
          <BarChart2 size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 14 }}>No data recorded for this day</p>
        </div>
      )}
    </div>
  );
}

export default function VolunteerDashboard() {
  const { volunteer } = useApp();
  const [activeTab, setActiveTab] = useState('requests');
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeSession, setActiveSession] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolution, setResolution] = useState({ safe: false, plan: false, ngo: false });

  useEffect(() => {
    const activeEmergency = requests.some(r => r.isEmergency);
    if (activeEmergency && !hasEmergency) {
      // Play SOS sound (Notification alert)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio play blocked by browser. Click anywhere to enable.'));
    }
    setHasEmergency(activeEmergency);
  }, [requests]);

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await axios.put('/api/mentor/availability', { isAvailable: next }, { headers: { Authorization: `Bearer ${volunteer?.token}` } });
    } catch { }
  };

  const acceptRequest = (req) => {
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setActiveSession(req);
    setChatMessages([
      { role: 'system', content: `Session started with ${req.userId}. They are feeling ${req.emotion} (Stress: ${req.stressLevel}/10).` },
      { role: 'user', content: req.lastNote || "Hi, I need someone to talk to...", sender: req.userId }
    ]);
  };

  const sendVolMsg = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'volunteer', content: chatInput, sender: volunteer?.name || 'You', time: new Date() }]);
    setChatInput('');
  };

  const endSession = () => {
    if (activeSession?.isEmergency) {
      // Require checklist for crisis sessions
      setShowResolutionModal(true);
    } else {
      setActiveSession(null);
      setChatMessages([]);
    }
  };

  const confirmEndSession = () => {
    if (!resolution.safe || !resolution.plan || !resolution.ngo) return;
    setActiveSession(null);
    setChatMessages([]);
    setShowResolutionModal(false);
    setResolution({ safe: false, plan: false, ngo: false });
  };

  const stats = [
    { label: 'Total Sessions', value: volunteer?.totalSessions || 12, color: '#A78BFA' },
    { label: 'Active Requests', value: requests.length, color: '#F59E0B' },
    { label: 'Rating', value: '4.9 ⭐', color: '#10B981' },
    { label: 'Helped Today', value: 3, color: '#67E8F9' },
  ];

  return (
    <div className={hasEmergency ? 'crisis-dashboard-alert' : ''} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Crisis Resolution Checklist Modal */}
      {showResolutionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass animate-bounce-in" style={{ width: '100%', maxWidth: 480, padding: 36, borderRadius: 24, border: '2px solid #EF4444' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#EF4444', marginBottom: 8 }}>Crisis Safety Checklist</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Before ending this SOS session, please confirm the following:</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {[
                { key: 'safe', label: 'User confirmed they are in a safe environment', icon: '🏠' },
                { key: 'plan', label: 'Safety Plan was built or discussed with user', icon: '📋' },
                { key: 'ngo', label: 'Primary helpline (AASRA/Vandrevala) was shared', icon: '📞' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: resolution[item.key] ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', borderRadius: 14, border: `1px solid ${resolution[item.key] ? '#10B981' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={resolution[item.key]} onChange={e => setResolution(prev => ({ ...prev, [item.key]: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }} />
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: resolution[item.key] ? '#6EE7B7' : 'var(--text-secondary)' }}>{item.label}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowResolutionModal(false)}>
                Keep Talking
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: resolution.safe && resolution.plan && resolution.ngo ? '#10B981' : 'rgba(16,185,129,0.3)', cursor: resolution.safe && resolution.plan && resolution.ngo ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}
                onClick={confirmEndSession}
                disabled={!resolution.safe || !resolution.plan || !resolution.ngo}
              >
                ✓ End Session Safely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Sidebar */}
      <div style={{ width: 280, minHeight: '100vh', background: 'rgba(13,17,40,0.98)', borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="white" /></div>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }} className="gradient-text">Manobandhu</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 46 }}>Volunteer Portal</p>
        </div>

        <div style={{ padding: '20px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#67E8F9' }}>{volunteer?.name || 'Volunteer Account'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{volunteer?.email || 'mentor@Manobandhu.ai'}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(volunteer?.expertise || ['Anxiety', 'Depression']).map(e => <span key={e} className="badge badge-teal" style={{ fontSize: 10 }}>{e}</span>)}
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 12, background: isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isAvailable ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, marginBottom: 24, cursor: 'pointer' }} onClick={toggleAvailability}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: isAvailable ? '#6EE7B7' : '#FCA5A5' }}>{isAvailable ? '🟢 Online' : '🔴 Offline'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Tap to toggle status</div>
            </div>
            {isAvailable ? <ToggleRight size={28} color="#10B981" /> : <ToggleLeft size={28} color="#EF4444" />}
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <div className="glass" style={{ padding: 16, textAlign: 'center', borderRadius: 12 }}>
          <Heart size={20} color="#EC4899" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>You've supported 14 people this week.</p>
        </div>
      </div>

      <main style={{ marginLeft: 280, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Welcome, <span className="gradient-text">{volunteer?.name?.split(' ')[0] || 'Mentor'} 👋</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>You are currently active and ready to support.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {stats.map((s, i) => (
              <div key={i} className="glass" style={{ padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 14, width: 'fit-content', border: '1px solid var(--border)' }}>
          {[
            { id: 'requests', label: 'Support Queue', icon: MessageCircle },
            { id: 'calendar', label: 'Mood Calendar', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: activeTab === tab.id ? 'var(--shadow-card)' : 'none'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'requests' && requests.some(r => r.isEmergency) && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} className="animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Mood Calendar Tab */}
        {activeTab === 'calendar' && !activeSession && <MoodCalendar />}

        {/* Support Queue Tab */}
        {(activeTab === 'requests' || activeSession) && (
        <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start' }}>

          {/* Requests Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} className="animate-pulse" />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Active Support Requests ({requests.length})</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {[...requests].sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0)).map(req => (
                <div 
                  key={req.id} 
                  className={`glass animate-fade-up ${req.isEmergency ? 'animate-shake' : ''}`} 
                  style={{ 
                    padding: 24, 
                    borderLeft: `4px solid ${req.isEmergency ? '#EF4444' : (req.stressLevel >= 7 ? '#EF4444' : '#F59E0B')}`,
                    border: req.isEmergency ? '2px solid #EF4444' : '1px solid var(--border)',
                    boxShadow: req.isEmergency ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>User {req.userId}</div>
                        {req.isEmergency && <span className="badge badge-red animate-pulse" style={{ background: '#EF4444', color: 'white', fontSize: 10 }}>🚨 SOS: VOICE EMERGENCY</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 22 }}>{req.isEmergency ? '🆘' : (req.emotion === 'Stressed' ? '😣' : '😔')}</span>
                        <span className={`badge ${req.stressLevel >= 7 ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: 11 }}>Stress {req.stressLevel}/10</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Clock size={14} /> {req.time}</div>
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 20, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>"{req.lastNote}"</p>
                  </div>

                  {req.questionnaire && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>💤 {req.questionnaire.sleep >= 4 ? 'Poor' : req.questionnaire.sleep <= 2 ? 'Great' : 'Okay'} Sleep</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>⚡ {req.questionnaire.energy >= 4 ? 'Low' : req.questionnaire.energy <= 2 ? 'High' : 'Medium'} Energy</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>😰 {req.questionnaire.anxiety >= 4 ? 'High' : req.questionnaire.anxiety <= 2 ? 'Low' : 'Med'} Anxiety</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                    {req.stressors.map(s => <span key={s} className="badge badge-purple" style={{ fontSize: 11 }}>{s}</span>)}
                  </div>

                  <button className="btn btn-teal" style={{ width: '100%', height: 48 }} onClick={() => acceptRequest(req)}>
                    <MessageCircle size={18} /> Accept Request
                  </button>
                </div>
              ))}
            </div>

            {requests.length === 0 && (
              <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
                <CheckCircle size={40} color="#10B981" style={{ marginBottom: 16, opacity: 0.5 }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Queue Clear</h3>
                <p style={{ color: 'var(--text-muted)' }}>Great job! There are no waiting requests at the moment.</p>
              </div>
            )}
          </div>

          {/* Chat Window */}
          {activeSession && (
            <div className="glass animate-fade-right" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: 32, overflow: 'hidden' }}>

              {/* Chat Header */}
              <div style={{ padding: '20px 24px', background: 'rgba(6,182,212,0.1)', borderBottom: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#67E8F9' }}>{activeSession.userId[0]}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{activeSession.userId}</div>
                    <div style={{ fontSize: 12, color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE7B7' }} /> Live Session
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={endSession}><LogOut size={14} /> End Session</button>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'system' ? 'center' : (m.role === 'volunteer' ? 'flex-end' : 'flex-start') }}>
                    {m.role === 'system' ? (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '4px 12px', borderRadius: 100 }}>
                        {m.content}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, padding: '0 4px' }}>{m.sender}</div>
                        <div style={{
                          maxWidth: '85%', padding: '12px 16px', borderRadius: 16,
                          background: m.role === 'volunteer' ? 'linear-gradient(135deg, #06B6D4, #0EA5E9)' : 'rgba(255,255,255,0.05)',
                          color: m.role === 'volunteer' ? 'white' : 'var(--text-primary)',
                          border: m.role === 'volunteer' ? 'none' : '1px solid var(--border)',
                          borderBottomRightRadius: m.role === 'volunteer' ? 4 : 16,
                          borderBottomLeftRadius: m.role === 'user' ? 4 : 16
                        }}>
                          {m.content}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Type your supportive response..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendVolMsg()}
                    style={{ flex: 1, borderRadius: 100 }}
                  />
                  <button className="btn btn-primary" style={{ width: 48, height: 48, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={sendVolMsg}>
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </main>
    </div>
  );
}
