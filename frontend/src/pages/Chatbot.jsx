import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Send, Sparkles, MessageCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import miloAvatar from '../assets/milo.png';

const SUGGESTED_QUESTIONS = [
  "How can I feel more positive today?",
  "What are some mindfulness exercises?",
  "I'm feeling lonely, can we talk?",
  "Tell me a motivational quote.",
  "How do I join a community group?"
];

export default function Chatbot() {
  const { user, moodData } = useApp();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hey there 👋 I'm Milo. I'm here for you — no judgment, just support. ${moodData ? `I can see you're feeling ${moodData.emotion} today. ` : ''}How are you doing right now?`,
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { 
        message: text,
        moodData 
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const aiMsg = { role: 'assistant', content: res.data.message, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      if (res.data.isCrisis) setIsCrisis(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting right now. But I'm still here for you. 💙", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
        
        {/* Chat Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--purple-primary), var(--teal-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={miloAvatar} alt="Milo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800 }}>Milo</h1>
              <div style={{ fontSize: 12, color: '#5cb89c', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5cb89c' }} /> Online & Listening
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <ShieldCheck size={20} color="var(--text-muted)" />
             <RefreshCw size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setMessages([messages[0]])} />
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 12 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(235,177,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <img src={miloAvatar} alt="Milo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{ maxWidth: '80%', position: 'relative' }}>
                {m.content}
                <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: 'right' }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12 }}>
               <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(235,177,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <img src={miloAvatar} alt="Milo" className="animate-pulse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <div className="chat-bubble chat-bubble-ai" style={{ width: 60, display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <div className="dot-pulse" />
               </div>
            </div>
          )}
          {isCrisis && (
            <div className="crisis-banner animate-fade-up">
              <AlertTriangle size={20} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>We're concerned about you.</div>
                <div style={{ fontSize: 13 }}>Please consider calling a helpline (e.g., Vandrevala: 1860-2662-345) for immediate support.</div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length < 3 && (
          <div style={{ padding: '0 32px 16px', display: 'flex', gap: 10, overflowX: 'auto', flexShrink: 0 }} className="hide-scrollbar">
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={() => handleSend(q)} className="chip" style={{ whiteSpace: 'nowrap' }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Message Milo..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="input" 
              style={{ paddingRight: 60, height: 54, borderRadius: 16 }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 12, background: 'var(--purple-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: (input.trim() && !loading) ? 1 : 0.5 }}
            >
              <Send size={20} color="white" />
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            Milo can make mistakes. Please check important info.
          </p>
        </div>

      </main>
    </div>
  );
}
