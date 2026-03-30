import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Heart, Calendar } from 'lucide-react';
import { chatWithMilo, saveMiloChat } from '../services/api';

export default function Milo() {
  const [ageGroup, setAgeGroup] = useState(null);
  const [moodScore, setMoodScore] = useState(null);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, options]);

  const addBotMessage = async (text, delay = 600) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, delay));
    setMessages(prev => [...prev, { text, isBot: true }]);
    setLoading(false);
  };

  const startInteraction = async (ag, mood) => {
    setAgeGroup(ag);
    setMoodScore(mood);
    setMessages([]);
    
    // Initial user rating "message" silently recorded for backend context
    const convoContext = [{ is_milo: false, text: `[Milo started. Mood rated: ${mood}/10]` }];
    
    setLoading(true);
    try {
      // Backend handles "first message" logic
      const reply = await chatWithMilo({ 
        ageGroup: ag, 
        moodScore: mood, 
        conversation: convoContext 
      });
      
      setMessages([{ text: reply.text, isBot: true, isAction: !!reply.action }]);
      if (reply.options) setOptions(reply.options);
      
      // Save state to be passed back on next turn
      if (reply.action) {
        saveChatToDb(convoContext, reply);
      }
    } catch (err) {
      console.error(err);
      await addBotMessage("Oops, my brain disconnected for a second. Try again?");
    }
    setLoading(false);
  };

  const saveChatToDb = async (convoArray, finalReply) => {
    try {
      await saveMiloChat({
        userId: "anon_" + Math.random().toString(36).substr(2, 9),
        ageGroup,
        moodScore,
        conversation: [...convoArray, { is_milo: true, text: finalReply.text }],
        actionTaken: finalReply.action
      });
    } catch (err) {
      console.error("Failed to save chat context", err);
    }
  };

  const handleOptionClick = async (optionText) => {
    setOptions([]); // hide immediately
    setMessages(prev => [...prev, { text: optionText, isBot: false }]);
    
    const currentConvo = messages.map(m => ({ is_milo: m.isBot, text: m.text }));
    currentConvo.push({ is_milo: false, text: optionText });

    setLoading(true);
    try {
      const reply = await chatWithMilo({ 
        ageGroup, 
        moodScore, 
        conversation: currentConvo 
      });
      
      setMessages(prev => [...prev, { text: reply.text, isBot: true, isAction: !!reply.action }]);
      if (reply.options) {
        setOptions(reply.options);
      }
      
      if (reply.action) {
        saveChatToDb(currentConvo, reply);
      }
    } catch (err) {
      console.error(err);
      await addBotMessage("I didn't quite catch that. Can you try again?");
    }
    setLoading(false);
  };

  const reset = () => {
    setAgeGroup(null);
    setMoodScore(null);
    setMessages([]);
    setOptions([]);
  };

  // Select Age and Initial Mood
  if (!ageGroup || !moodScore) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 500, width: '100%', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🧸</div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 8, fontSize: 32 }}>
            Hey, I'm Milo.
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16, lineHeight: 1.5 }}>
            I'm here to listen. No judgment, no quick fixes, just a space for you.
          </p>
          
          <div style={{ background: 'var(--bg-glass)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            {!ageGroup ? (
              <>
                <p style={{ fontWeight: 600, marginBottom: 16 }}>What age group are you?</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="btn btn-secondary w-full" onClick={() => setAgeGroup("11-14")}>11-14</button>
                  <button className="btn btn-secondary w-full" onClick={() => setAgeGroup("15-19")}>15-19</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, marginBottom: 16 }}>How are you feeling right now?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <span style={{ fontSize: 24 }}>😞</span>
                    <span style={{ fontSize: 24 }}>😐</span>
                    <span style={{ fontSize: 24 }}>🙂</span>
                    <span style={{ fontSize: 24 }}>🌟</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    defaultValue="5"
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-tertiary)' }}>
                    <span>1 (Struggling)</span>
                    <span>10 (Awesome)</span>
                  </div>
                  <button className="btn btn-primary w-full" onClick={() => startInteraction(ageGroup, moodScore || 5)}>
                    Start Talking
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40 }}>🧸</div>
          <div>
            <h1 style={{ fontSize: 24, margin: 0 }}>Milo</h1>
            <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>Always here to listen.</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={reset}>
          <RotateCcw size={14} /> End Chat
        </button>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, overflow: 'hidden' }}>
        
        {/* Messages */}
        <div className="chatbot-messages" style={{ flex: 1, overflowY: 'auto', paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
                style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', display: 'flex', gap: 12, maxWidth: '85%' }}
              >
                {msg.isBot && <div style={{ fontSize: 24 }}>🧸</div>}
                <div style={{ 
                  background: msg.isBot ? 'var(--bg-glass)' : 'var(--primary)',
                  border: msg.isBot ? '1px solid var(--border)' : 'none',
                  padding: '12px 16px',
                  borderRadius: 20,
                  borderTopLeftRadius: msg.isBot ? 4 : 20,
                  borderTopRightRadius: !msg.isBot ? 4 : 20,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: msg.isBot ? 'var(--text-primary)' : '#fff'
                }}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
                <div style={{ fontSize: 24 }}>🧸</div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-glass)', borderRadius: 20, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                  <div className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                  <div className="typing-dot" style={{ width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Options */}
        {options.length > 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}
          >
            {options.map((opt, i) => (
              <button 
                key={i} 
                className="chat-option-btn"
                onClick={() => handleOptionClick(opt)}
                style={{ 
                  background: 'transparent', border: '1px solid var(--primary)', 
                  color: 'var(--primary-light)', padding: '10px 16px', borderRadius: 20,
                  fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(108, 92, 231, 0.1)'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
