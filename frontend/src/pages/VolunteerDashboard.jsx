import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import {
  Users, ToggleLeft, ToggleRight, Star,
  MessageCircle, Clock, CheckCircle, AlertTriangle,
  History, Heart, Info, ArrowLeft, Send
} from 'lucide-react';

const MOCK_REQUESTS = [
  { 
    id: 1, userId: 'MBX4821', emotion: 'Stressed', stressLevel: 8, 
    stressors: ['Studies', 'Anxiety'], time: '2 min ago', status: 'waiting',
    lastNote: "I have three finals next week and I haven't even started studying. My chest feels tight."
  },
  { 
    id: 2, userId: 'MBX2193', emotion: 'Sad', stressLevel: 6, 
    stressors: ['Family'], time: '8 min ago', status: 'waiting',
    lastNote: "My parents are fighting again. It's hard to focus on anything else."
  },
  { 
    id: 3, userId: 'MBX9056', emotion: 'Stressed', stressLevel: 9, 
    stressors: ['Relationships', 'Anxiety'], time: '15 min ago', status: 'waiting',
    lastNote: "My partner and I just broke up. I feel like my world is ending."
  },
];

const RECENT_SESSIONS = [
  { id: 's1', userId: 'MBX3310', duration: '24 min', rating: 5, topic: 'Exam anxiety' },
  { id: 's2', userId: 'MBX7821', duration: '18 min', rating: 4, topic: 'Family conflict' },
];

export default function VolunteerDashboard() {
  const { volunteer } = useApp();
  const [isAvailable, setIsAvailable] = useState(true);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [activeSession, setActiveSession] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  const toggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    try {
      await axios.put('/api/mentor/availability', { isAvailable: next }, { headers: { Authorization: `Bearer ${volunteer?.token}` } });
    } catch {}
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

  const endSession = () => { setActiveSession(null); setChatMessages([]); };

  const stats = [
    { label: 'Total Sessions', value: volunteer?.totalSessions || 12, color: '#A78BFA' },
    { label: 'Active Requests', value: requests.length, color: '#F59E0B' },
    { label: 'Rating', value: '4.9 ⭐', color: '#10B981' },
    { label: 'Helped Today', value: 3, color: '#67E8F9' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Volunteer Sidebar */}
      <div style={{ width: 280, minHeight: '100vh', background: 'rgba(13,17,40,0.98)', borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="white" /></div>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }} className="gradient-text">MindBridge</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 46 }}>Volunteer Portal</p>
        </div>

        <div style={{ padding: '20px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#67E8F9' }}>{volunteer?.name || 'Volunteer Account'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{volunteer?.email || 'mentor@mindbridge.ai'}</div>
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
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Requests Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} className="animate-pulse" />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Active Support Requests ({requests.length})</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {requests.map(req => (
                <div key={req.id} className="glass animate-fade-up" style={{ padding: 24, borderLeft: `4px solid ${req.stressLevel >= 7 ? '#EF4444' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>User {req.userId}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 22 }}>{req.emotion === 'Stressed' ? '😣' : '😔'}</span>
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

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {chatMessages.map((m, i) => (
                  <div key={i}>
                    {m.role === 'system' ? (
                       <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                          <div style={{ padding: '8px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: 12, color: '#FCD34D', display: 'flex', alignItems: 'center', gap: 8 }}>
                             <Info size={14} /> {m.content}
                          </div>
                       </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'volunteer' ? 'flex-end' : 'flex-start', gap: 6 }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{m.sender}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                         </div>
                         <div className={`chat-bubble ${m.role === 'volunteer' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{ maxWidth: '85%', borderRadius: 20, padding: '12px 20px', background: m.role === 'volunteer' ? 'var(--teal-primary)' : 'rgba(255,255,255,0.05)', border: 'none' }}>{m.content}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Type your supportive response..." 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && sendVolMsg()} 
                    className="input" 
                    style={{ height: 50, paddingRight: 60, borderRadius: 14 }} 
                  />
                  <button 
                    onClick={sendVolMsg} 
                    disabled={!chatInput.trim()} 
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 10, background: 'var(--teal-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: chatInput.trim() ? 1 : 0.5 }}
                  >
                    <Send size={18} color="white" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
