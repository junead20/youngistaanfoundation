import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ShieldCheck, LogIn, ChevronRight, User, RotateCcw, Heart, Smile } from 'lucide-react';

export default function Milo() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [step, setStep] = useState(3); // 3: Chat, 4: Soft Login, 5: Escalation
  const messagesEndRef = useRef(null);

  const isGuest = !localStorage.getItem('token');
  const anonId = "anon_" + Math.random().toString(36).substr(2, 6);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, options, loading]);

  useEffect(() => {
    // Initial greeting
    setMessages([{ text: "Hey! I'm Milo. I'm here to listen. How's it going?", isBot: true }]);
    setOptions(["I'm feeling better", "Still a bit heavy", "What can we do?"]);
  }, []);

  const handleSend = async (text) => {
    if (!text && !inputText) return;
    const msg = text || inputText;
    
    setMessages(prev => [...prev, { text: msg, isBot: false }]);
    setInputText('');
    setInteractionCount(prev => prev + 1);
    setLoading(true);

    // SOFT LOGIN TRIGGER (Screen 4)
    if (isGuest && interactionCount + 1 === 3) {
      setTimeout(() => setStep(4), 1500);
    }

    try {
      const res = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversation: messages.concat({ text: msg, isBot: false }).map(m => ({ is_milo: m.isBot, text: m.text })),
          moodScore: 5 // Default for chat session
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.text, isBot: true }]);
      setOptions(data.options || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Screen 4: Soft Login Prompt
  if (step === 4) {
    return (
      <div className="flex-center h-screen bg-vibrant">

        <div className="card" style={{ maxWidth: 450, padding: 40, textAlign: 'center', border: '1px solid var(--border-active)' }}>
          <Smile size={48} color="var(--palette-purple)" style={{ marginBottom: 20 }} />
          <h2 style={{ marginBottom: 12 }}>Enjoying our chat?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Save your progress now to continue this conversation anytime and track your mood journey.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Create Account <LogIn size={18} style={{ marginLeft: 8 }} />
            </button>
            <button className="btn btn-secondary" onClick={() => setStep(3)}>
              Continue Anonymously
            </button>
          </div>
          <p style={{ marginTop: 24, fontSize: 11, color: 'var(--text-tertiary)' }}>
            <RotateCcw size={10} style={{ marginRight: 4 }} /> Identity is optional for now. You're in control.
          </p>
        </div>
      </div>
    );
  }

  // Screen 5: Escalation Prompt
  if (step === 5) {
    return (
      <div className="flex-center h-screen bg-vibrant">

        <div className="card" style={{ maxWidth: 450, padding: 40, textAlign: 'center', border: '1px solid var(--palette-pink)' }}>
           <Heart size={48} color="var(--palette-pink)" style={{ marginBottom: 20 }} fill="var(--palette-pink)" />
           <h2 style={{ marginBottom: 12 }}>Need a Human Connection?</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
              Would you like to connect with a trained Youngistaan volunteer for real-time support? 
              This requires a verified account for your safety.
           </p>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Verify & Talk to Volunteer <ArrowRight size={18} style={{ marginLeft: 8 }} />
             </button>
             <button className="btn btn-secondary" onClick={() => setStep(3)}>
                Stay with Milo (AI)
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container animate-fade-in" style={{ height: '85vh', position: 'relative' }}>

      
      <div className="chatbot-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ fontSize: 32 }}>🧸</div>
           <div>
              <h1 style={{ fontSize: 20, margin: 0 }}>Milo Companion</h1>
              <div style={{ fontSize: 11, color: 'var(--palette-pink)', fontWeight: 600 }}>SESSION_ID: {anonId}</div>
           </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setStep(5)}>
           Talk to Volunteer
        </button>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', marginTop: 20 }}>
         <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                     alignSelf: m.isBot ? 'flex-start' : 'flex-end',
                     maxWidth: '80%',
                     background: m.isBot ? 'var(--bg-tertiary)' : 'var(--primary)',
                     padding: '12px 16px',
                     borderRadius: 20,
                     fontSize: 15,
                     color: m.isBot ? 'var(--text-primary)' : '#fff',
                     border: m.isBot ? '1px solid var(--border)' : 'none'
                  }}
               >
                  {m.text}
               </motion.div>
            ))}
            {loading && <div className="loading-spinner-sm" style={{ alignSelf: 'flex-start' }} />}
            <div ref={messagesEndRef} />
         </div>

         <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            {options.length > 0 && (
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
                  {options.map((opt, i) => (
                     <button key={i} className="chip-btn" onClick={() => handleSend(opt)}>{opt}</button>
                  ))}
               </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
               <input 
                  className="form-input" 
                  placeholder="Type your message..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button className="btn btn-primary" onClick={() => handleSend()}>
                  <Send size={18} />
               </button>
            </div>
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
               <ShieldCheck size={10} style={{ marginRight: 4 }} /> Anonymous session active. Milo generates anonymous_user_id in background.
            </div>
         </div>
      </div>
    </div>
  );
}
