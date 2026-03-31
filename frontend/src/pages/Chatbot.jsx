import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Send, Sparkles, MessageCircle, AlertTriangle, ShieldCheck, RefreshCw, Heart, Users, Book, ChevronRight } from 'lucide-react';

const PERSONAS = [
  {
    id: 'Caring Parent',
    label: 'Caring Parent',
    emoji: '💛',
    icon: Heart,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B20, #F59E0B05)',
    border: 'rgba(245, 158, 11, 0.3)',
    description: 'Warm, protective & unconditional love',
    greeting: "Sweetheart, I'm so glad you're here. Whatever you're going through, you're never alone. I love you and I believe in you. How are you doing today? 💛",
    suggestions: ["I'm feeling so anxious.", "I just feel really sad right now.", "Mom, I can't sleep."]
  },
  {
    id: 'Supportive Friend',
    label: 'Supportive Friend',
    emoji: '💙',
    icon: Users,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D420, #06B6D405)',
    border: 'rgba(6, 182, 212, 0.3)',
    description: 'Casual, relatable & real',
    greeting: "Hey! Really glad you came to talk. I'm here, no judgment whatsoever. What's been going on? 😊",
    suggestions: ["Bro, I'm exhausted.", "I feel so lonely today.", "I'm so angry at this situation."]
  },
  {
    id: 'Wise Mentor',
    label: 'Wise Mentor',
    emoji: '💚',
    icon: Book,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B98120, #10B98105)',
    border: 'rgba(16, 185, 129, 0.3)',
    description: 'Structured, logical & solution-focused',
    greeting: "Welcome. I'm here to think through challenges with you — objectively, and without judgment. What's weighing on your mind? 💚",
    suggestions: ["How do I manage this stress?", "Can I ask you a question?", "I keep feeling really depressed."]
  }
];

export default function Chatbot() {
  const { user, moodData } = useApp();
  const [selectedPersona, setSelectedPersona] = useState(() => {
    const saved = localStorage.getItem('mb_persona');
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectPersona = (persona) => {
    setSelectedPersona(persona);
    localStorage.setItem('mb_persona', JSON.stringify(persona));
    setMessages([{
      role: 'assistant',
      content: persona.greeting,
      timestamp: new Date(),
      persona: persona.id
    }]);
  };

  const resetPersona = () => {
    setSelectedPersona(null);
    setMessages([]);
    localStorage.removeItem('mb_persona');
  };

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
        persona: selectedPersona?.id || 'General'
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const aiMsg = { role: 'assistant', content: res.data.message, timestamp: new Date(), persona: selectedPersona?.id };
      setMessages(prev => [...prev, aiMsg]);
      if (res.data.isCrisis) setIsCrisis(true);
    } catch {
      const p = selectedPersona?.id || 'General';
      const lowerMsg = text.toLowerCase();
      let intent = 'general';
      if (lowerMsg.match(/\b(hi|hello|hey|how r u|how are you|sup|morning|evening)\b/)) intent = 'greeting';
      else if (lowerMsg.match(/\b(eat|eating|food|hungry|dinner|lunch|breakfast)\b/)) intent = 'eating';
      else if (lowerMsg.match(/\b(sleep|tired|exhausted|insomnia|bed)\b/)) intent = 'sleep';
      else if (lowerMsg.match(/\b(anxious|stress|panic|nervous|worry|scared)\b/)) intent = 'anxiety';
      else if (lowerMsg.match(/\b(lonely|alone|nobody|isolated|friends)\b/)) intent = 'lonely';
      else if (lowerMsg.match(/\b(angry|mad|frustrated|hate|annoyed)\b/)) intent = 'angry';
      else if (lowerMsg.match(/\b(sad|depressed|cry|crying|down|heartbroken)\b/)) intent = 'sad';
      else if (lowerMsg.includes('?')) intent = 'question';

      const SMART_MOCK_RESPONSES = {
        'Caring Parent': {
          'greeting': "Hi my love! I'm doing well, just taking a moment to think about you. How are you holding up today? 💛",
          'eating': "Are you making sure to eat enough, honey? Please grab something nutritious. A good meal always makes things feel a little better. 🍲",
          'sleep': "Oh honey, you must be exhausted. Have you tried winding down without your screen? Let's take a deep breath — I'm right here with you. 💛",
          'anxiety': "I can feel how overwhelmed you are, sweetheart. It's perfectly okay to feel this way. Just breathe. What's making you the most nervous right now? 🤗",
          'lonely': "I'm so sorry you're feeling alone, my love. I promise you mean the world to me. Want to tell me more about what's making you feel isolated? ❤️",
          'angry': "It's completely okay to be angry, honey. You have every right to feel that way. What happened that made you so frustrated?",
          'sad': "I hate seeing you sad, sweetheart. But it's okay to cry. Let it all out, I'm holding your hand. What triggered this feeling today?",
          'question': "That's a really thoughtful question, sweetheart. I think you actually already have the answer inside you — what does your heart tell you to do?",
          'general': "I hear you, sweetheart. Your feelings are completely valid. Tell me more about what's been going on — I'm not going anywhere. 💛"
        },
        'Supportive Friend': {
          'greeting': "Hey! I'm doing good, just hanging out. What's going on in your world today? 😊",
          'eating': "Dude, you've got to eat! Don't run on empty. Go grab a snack or order something. What are you craving right now? 🍔",
          'sleep': "Bro, sleep deprivation is the worst. 😭 You definitely need to crash. What's keeping your brain awake?",
          'anxiety': "Dude, I'd be stressed about that too! It's so much pressure. What's the absolute worst-case scenario? 💙",
          'lonely': "Man, that sucks. Feeling excluded is the worst. Just know I've got your back no matter what! 🙌 Want to vent?",
          'angry': "Honestly? I'd be furious too. That is totally unfair. Let it all out! What are you going to do about it?",
          'sad': "I'm so sorry you're feeling down. I literally just want to give you a hug right now. 😔 What do you need today?",
          'question': "Honestly? That's a super good question. What's your gut saying? 😊",
          'general': "Your feelings make total sense right now. Don't be too hard on yourself. Tell me more. 💙"
        },
        'Wise Mentor': {
          'greeting': "Hello there. I'm here and ready to listen. What is the main focus for you today? 💚",
          'eating': "Nutrition is fuel for your resilience. Make sure you are taking care of your basic physical needs before tackling complex emotions.",
          'sleep': "A rested mind is the foundation of resilience. What's one small change you can make tonight to improve your sleep? 💚",
          'anxiety': "Anxiety often comes from focusing on what we can't control. Let's break this down logically. What exactly is within your control?",
          'lonely': "It's entirely natural to feel disconnected sometimes. What is one small way you could reach out to someone today?",
          'angry': "Anger is data; it tells us our boundaries have been crossed. How can you communicate your boundaries right now?",
          'sad': "Sadness can feel heavy, but it passes. Give yourself permission to feel it. What would feel like a tiny win for you today? 💚",
          'question': "That's an excellent question. Based on your own past experiences, how would you approach this problem?",
          'general': "Recognizing how you feel is the first step. Now, tell me a bit more about the root cause of this feeling."
        },
        'General': {
          'greeting': "Hello! I'm here to support you. How are you feeling right now?",
          'eating': "It’s important to nourish your body, especially when you feel down. Have you eaten recently?",
          'sleep': "It sounds like you really need some rest. Have you considered trying some relaxing breathing exercises?",
          'anxiety': "I hear how anxious you are. Let's take a slow, deep breath together. What is the main thing causing this stress?",
          'lonely': "You're not alone. I am here to listen. Would you like to check out the Community page to see how others are coping?",
          'angry': "It's normal to feel angry when things go wrong. What helps you cool down usually?",
          'sad': "I'm sorry you're feeling so down today. Let's take things one step at a time.",
          'question': "That's a big question. I can help you talk through it.",
          'general': "I hear you, and I'm glad you reached out. Can you tell me more about what's happening?"
        }
      };

      const fallbackMsg = (SMART_MOCK_RESPONSES[p] || SMART_MOCK_RESPONSES['General'])[intent];
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackMsg, timestamp: new Date(), persona: p }]);
    } finally {
      setLoading(false);
    }
  };

  // Persona selection screen
  if (!selectedPersona) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: '100%', maxWidth: 680, padding: 20 }}>
            <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', padding: 16, borderRadius: 20, background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))', marginBottom: 20 }}>
                <Heart size={36} color="var(--purple-light)" fill="var(--purple-light)" />
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
                Talk to Your <span className="gradient-text">Loved Ones</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                Choose who you'd like to talk to today. Each persona adapts its tone, language, and support style just for you.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {PERSONAS.map((persona, i) => (
                <button
                  key={persona.id}
                  className={`glass animate-fade-up delay-${i}00`}
                  onClick={() => selectPersona(persona)}
                  style={{
                    padding: 28,
                    borderRadius: 24,
                    border: `1px solid ${persona.border}`,
                    background: persona.gradient,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 20px 40px ${persona.color}30`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${persona.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {persona.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8, color: persona.color }}>{persona.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{persona.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: persona.color, fontWeight: 700 }}>
                    Start Talking <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ShieldCheck size={14} /> All conversations are private and locally processed
            </p>
          </div>
        </main>
      </div>
    );
  }

  const persona = selectedPersona;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>

        {/* Chat Header */}
        <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${persona.gradient}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: `${persona.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `1px solid ${persona.border}` }}>
              {persona.emoji}
            </div>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800 }}>Your {persona.label}</h1>
              <div style={{ fontSize: 12, color: persona.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: persona.color }} className="animate-pulse" /> Here for you
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={resetPersona} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}>
              Switch Persona
            </button>
            <ShieldCheck size={18} color="var(--text-muted)" />
            <RefreshCw size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setMessages([{ role: 'assistant', content: persona.greeting, timestamp: new Date(), persona: persona.id }])} />
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${persona.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: `1px solid ${persona.border}` }}>
                  {persona.emoji}
                </div>
              )}
              <div className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{ maxWidth: '75%', borderLeft: m.role === 'assistant' ? `3px solid ${persona.color}` : 'none' }}>
                {m.content}
                <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: 'right' }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${persona.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{persona.emoji}</div>
              <div className="chat-bubble chat-bubble-ai" style={{ borderLeft: `3px solid ${persona.color}` }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: persona.color, animation: 'pulse 1s infinite' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: persona.color, animation: 'pulse 1s infinite 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: persona.color, animation: 'pulse 1s infinite 0.4s' }} />
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
        {messages.length < 5 && persona.suggestions && (
          <div style={{ padding: '0 32px', display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }} className="animate-fade-up">
            {persona.suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)} 
                className="btn-outline hover-glow" 
                style={{ padding: '8px 16px', borderRadius: 100, fontSize: 13, borderColor: persona.border, color: persona.color, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
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
              placeholder={`Talk to your ${persona.label.toLowerCase()}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="input"
              style={{ paddingRight: 60, height: 54, borderRadius: 16, borderColor: persona.border }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: 12, background: persona.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s', opacity: (input.trim() && !loading) ? 1 : 0.5 }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            {persona.emoji} Talking to your {persona.label} · Privacy protected
          </p>
        </div>
      </main>
    </div>
  );
}
