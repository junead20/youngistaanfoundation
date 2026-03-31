import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Send, Sparkles, MessageCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const MILO = {
  id: 'Milo',
  label: 'Milo',
  emoji: '🤖',
  icon: Sparkles,
  color: '#7C3AED', // Purple
  gradient: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.05))',
  border: 'rgba(124,58,237,0.3)',
  greeting: "Hi there! I'm Milo. I'm here to listen, chat, and help you work through whatever is on your mind today. How are you feeling? ✨",
  suggestions: ["I'm feeling a bit anxious.", "I just need to vent.", "Can we just chat?"]
};

export default function MiloChatbot() {
  const { user, moodData } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: MILO.greeting, timestamp: new Date(), persona: 'Milo' }
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
        moodData,
        persona: 'Milo'
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const aiMsg = { role: 'assistant', content: res.data.message, timestamp: new Date(), persona: 'Milo' };
      setMessages(prev => [...prev, aiMsg]);
      if (res.data.isCrisis) setIsCrisis(true);
    } catch {
      const lowerMsg = text.toLowerCase();
      let intent = 'general';
      if (lowerMsg.match(/\b(hi|hello|hey|how r u|how are you|sup|morning|evening|chat)\b/)) intent = 'greeting';
      else if (lowerMsg.match(/\b(eat|eating|food|hungry|dinner|lunch|breakfast)\b/)) intent = 'eating';
      else if (lowerMsg.match(/\b(sleep|tired|exhausted|insomnia|bed)\b/)) intent = 'sleep';
      else if (lowerMsg.match(/\b(anxious|stress|panic|nervous|worry|scared)\b/)) intent = 'anxiety';
      else if (lowerMsg.match(/\b(lonely|alone|nobody|isolated|friends)\b/)) intent = 'lonely';
      else if (lowerMsg.match(/\b(angry|mad|frustrated|hate|annoyed|vent)\b/)) intent = 'angry';
      else if (lowerMsg.match(/\b(sad|depressed|cry|crying|down|heartbroken)\b/)) intent = 'sad';
      else if (lowerMsg.includes('?')) intent = 'question';

      const MILO_RESPONSES = {
        'greeting': "Hello! I'm doing great. How are you feeling right now? I'm here to listen. ✨",
        'eating': "Nutrition is super important! Make sure you grab a bite to eat if you haven't already. 🥪",
        'sleep': "It sounds like you really need some rest. Taking a break from screens before bed can really help! 🌙",
        'anxiety': "Anxiety can feel so overwhelming. Let's take a slow, deep breath together. What is the main thing causing this stress right now?",
        'lonely': "You're definitely not alone. I am here to chat with you as long as you need. How can I best support you right now? 🤖",
        'angry': "It's completely normal to feel angry or frustrated. Let it all out! I'm here to listen without any judgment.",
        'sad': "I'm so sorry you're feeling down today. Let's take things one step at a time. Do you want to talk about what triggered this?",
        'question': "That's a really good question! What do you think the best approach would be?",
        'general': "I hear you. Your feelings make total sense. Can you tell me more about what's going on?"
      };

      const fallbackMsg = MILO_RESPONSES[intent] || MILO_RESPONSES['general'];
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg, timestamp: new Date(), persona: 'Milo' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
        
        {/* Chat Header */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: MILO.gradient }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: `${MILO.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${MILO.border}` }}>
              {MILO.emoji}
            </div>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800 }}>Chat with {MILO.label}</h1>
              <div style={{ fontSize: 12, color: MILO.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: MILO.color }} className="animate-pulse" /> Always here for you
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ShieldCheck size={18} color="var(--text-muted)" />
            <RefreshCw size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setMessages([{ role: 'assistant', content: MILO.greeting, timestamp: new Date(), persona: 'Milo' }])} />
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${MILO.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: `1px solid ${MILO.border}` }}>
                  {MILO.emoji}
                </div>
              )}
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{ maxWidth: '75%', borderLeft: m.role === 'assistant' ? `3px solid ${MILO.color}` : 'none' }}>
                {m.content}
                <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: 'right' }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${MILO.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{MILO.emoji}</div>
              <div className="chat-bubble chat-bubble-ai" style={{ borderLeft: `3px solid ${MILO.color}` }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: MILO.color, animation: 'pulse 1s infinite' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: MILO.color, animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: MILO.color, animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}
          {isCrisis && (
            <div className="crisis-banner animate-fade-up">
              <AlertTriangle size={20} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>We're concerned about you.</div>
                <div style={{ fontSize: 13 }}>Please consider calling a helpline (Vandrevala: 1860-2662-345) for immediate support.</div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length < 5 && MILO.suggestions && (
          <div style={{ padding: '0 32px', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }} className="animate-fade-up">
            {MILO.suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)} 
                className="btn-outline hover-glow" 
                style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, borderColor: MILO.border, color: MILO.color, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                disabled={loading}
              >
                " {s} "
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
            <input
              type="text"
              placeholder={`Share your thoughts with ${MILO.label}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="input"
              style={{ paddingRight: 60, height: 54, borderRadius: 16, borderColor: MILO.border }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="btn btn-primary"
              style={{ position: 'absolute', right: 8, top: 8, bottom: 8, width: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
