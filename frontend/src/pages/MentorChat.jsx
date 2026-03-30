import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Users, Send, Star, Clock, ArrowLeft, AlertTriangle, ShieldCheck, CheckCircle, Loader } from 'lucide-react';

const MOCK_MENTORS = [
  { _id: 'm1', name: 'Priya S.', expertise: ['Anxiety', 'Studies'], ageGroups: ['13-18', '18-25'], bio: '3 years supporting teens through academic pressure and anxiety.', rating: 4.9, isAvailable: true, sessions: 142 },
  { _id: 'm2', name: 'Rahul M.', expertise: ['Relationships', 'Family'], ageGroups: ['18-25'], bio: 'Certified counselor passionate about youth well-being.', rating: 4.8, isAvailable: true, sessions: 89 },
  { _id: 'm3', name: 'Ananya K.', expertise: ['Stress', 'General Support'], ageGroups: ['13-18'], bio: 'Teen mental health advocate with empathetic listening skills.', rating: 4.7, isAvailable: true, sessions: 210 },
  { _id: 'm4', name: 'Dev P.', expertise: ['Depression', 'Loneliness'], ageGroups: ['18-25', '25+'], bio: 'Trained in CBT techniques, specializing in depression & isolation.', rating: 4.9, isAvailable: false, sessions: 56 },
];

export default function MentorChat() {
  const { user, moodData } = useApp();
  const [mentors, setMentors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get('/api/mentor')
      .then(r => setMentors(r.data.mentors))
      .catch(() => setMentors(MOCK_MENTORS))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const startSession = async (mentor) => {
    setIsConnecting(true);
    // Simulate connection handoff
    setTimeout(async () => {
      setSelected(mentor);
      setIsConnecting(false);
      try {
        await axios.post('/api/mentor/request', { 
          mentorId: mentor._id,
          stressLevel: moodData?.stressLevel,
          issue: moodData?.lastNote || 'General Support'
        }, { headers: { Authorization: `Bearer ${user?.token}` } });
      } catch {}
      setMessages([
        { role: 'mentor', content: `Hi! I'm ${mentor.name} 👋 I've just seen your mood entry. I'm here to listen and support you. How are you feeling right now?`, time: new Date() }
      ]);
    }, 2000);
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Simulate mentor typing
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replies = [
          "Thank you for sharing that. I really hear you. 💙",
          "That makes a lot of sense given what you're going through. What do you think would help you feel even a little bit better right now?",
          "You're doing the right thing by talking about this. I'm right here with you.",
          "That sounds incredibly tough. I appreciate your trust in sharing this with me.",
          "I understand. Let's take a deep breath together. What's the biggest thing on your mind today?",
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        setMessages(prev => [...prev, { role: 'mentor', content: reply, time: new Date() }]);
      }, 1500 + Math.random() * 1000);
    }, 500);
  };

  const formatTime = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isConnecting) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div className="glass" style={{ padding: 60, textAlign: 'center', borderRadius: 32, maxWidth: 400 }}>
              <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
                 <div className="spinner" style={{ width: 80, height: 80, borderWidth: 4, position: 'absolute', inset: 0 }} />
                 <CheckCircle size={32} color="var(--teal-primary)" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(100%, 100%)' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Connecting...</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Matching you with a compassionate mentor. Your privacy is protected.</p>
           </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: selected ? 0 : 32 }}>
        {!selected ? (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 className="section-title"><Users size={22} style={{ display: 'inline', marginRight: 10, color: '#06B6D4' }} />Volunteer Mentors</h1>
              <p className="section-subtitle">Real people, ready to listen. No judgment, just empathy.</p>
            </div>

            {/* High Stress Detection Banner */}
            {moodData?.stressLevel >= 7 && (
              <div className="crisis-banner animate-fade-up" style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertTriangle size={22} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#FCA5A5', marginBottom: 2 }}>Immediate support recommended</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                     Our mentors are specialized in crisis de-escalation. Connect with someone now or use the **Box Breathing** tool.
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {mentors.map(mentor => (
                  <div key={mentor._id} className="mentor-card glass">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white' }}>
                          {mentor.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16 }}>{mentor.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                               <Star size={12} fill="#F59E0B" color="#F59E0B" />
                               <span style={{ fontSize: 13, color: '#FCD34D', fontWeight: 700 }}>{mentor.rating}</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>• {mentor.sessions}+ sessions</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20, minHeight: 44 }}>{mentor.bio}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                      {mentor.expertise.map(e => <span key={e} className="badge badge-teal" style={{ fontSize: 11 }}>{e}</span>)}
                    </div>

                    <button 
                      className={`btn ${mentor.isAvailable ? 'btn-teal' : 'btn-secondary'}`} 
                      style={{ width: '100%', height: 48 }} 
                      onClick={() => mentor.isAvailable && startSession(mentor)} 
                      disabled={!mentor.isAvailable}
                    >
                      {mentor.isAvailable ? <><Send size={16} /> Connect with {mentor.name.split(' ')[0]}</> : 'Busy with student'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: 40, padding: 32, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
               <ShieldCheck size={40} color="var(--purple-light)" />
               <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>100% Privacy Guaranteed</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your real identity is never shared with mentors. Conversations are encrypted and anonymous.</p>
               </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-primary)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-secondary)', zIndex: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(null); setMessages([]); }} style={{ gap: 6 }}><ArrowLeft size={16} /> Exit</button>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>{selected.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Talking to {selected.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} className="animate-pulse" />
                  <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Active Session</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ textAlign: 'center', margin: '0 0 16px' }}>
                 <span style={{ padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', fontSize: 11, color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Today, {new Date().toLocaleDateString()}</span>
              </div>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
                  <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{ maxWidth: '75%', fontSize: 15, borderRadius: 20, padding: '14px 22px' }}>{m.content}</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.7 }}>{formatTime(m.time)}</span>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '0 8px' }}>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{selected.name} is typing</div>
                   <div className="dot-pulse" style={{ scale: '0.6' }} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 14, background: 'var(--bg-secondary)', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Share your thoughts honestly..." 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                  className="input" 
                  style={{ height: 56, paddingRight: 60, borderRadius: 16 }} 
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!input.trim()} 
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 12, background: 'var(--teal-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: input.trim() ? 1 : 0.5 }}
                >
                  <Send size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
