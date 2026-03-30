import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, Cookie } from 'lucide-react';

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '💖', '🌟', '🔥'];
const EMOJI_PICKER = ['😄', '😊', '🙂', '😐', '😔', '😢', '🤩', '😴', '😤', '🥰', '🤗', '😎', '🌈', '⚡', '🌸', '💪'];

const scoreToEmoji = (score) => {
  if (score <= 2) return '😢';
  if (score <= 4) return '😔';
  if (score <= 5) return '😐';
  if (score <= 6) return '🙂';
  if (score <= 7) return '😊';
  if (score <= 8) return '😄';
  if (score <= 9) return '🤩';
  return '💖';
};

const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = name + "=" + JSON.stringify(value) + ";expires=" + date.toUTCString() + ";path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return JSON.parse(c.substring(nameEQ.length));
  }
  return null;
};

export default function MoodCheck() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/mood/questions?date=${today}`)
      .then(res => res.json())
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(() => {
        setQuestions([
          "If your mood was a color today, which one would it be?",
          "On a scale of 1-10, how much energy do you have right now?",
          "What's one small thing that made you smile today?",
          "Pick an emoji that represents your day 👇"
        ]);
        setLoading(false);
      });
  }, []);

  const handleNext = (val) => {
    const newAnswers = { ...answers, [questions[currentStep]]: val };
    setAnswers(newAnswers);
    setCurrentInput('');
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitMood(newAnswers);
    }
  };

  const submitMood = async (finalAnswers) => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/mood/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers: finalAnswers, fromGuest: !token })
      });
      const data = await res.json();
      const emoji = scoreToEmoji(data.score);
      const entry = { emoji, description: data.description, sentiment: data.sentiment, timestamp: new Date().toISOString() };

      const existingHistory = getCookie('guest_mood_history') || [];
      setCookie('guest_mood_history', [...existingHistory, entry], 30);

      setResult({ emoji, description: data.description });
    } catch (err) {
      setResult({ emoji: '🙂', description: "You seem to be doing okay today. Remember, it's fine to just be." });
    }
    setAnalyzing(false);
  };

  // Check if current question is asking for an emoji
  const isEmojiQuestion = questions[currentStep]?.toLowerCase().includes('emoji');

  if (loading) {
    return (
      <div className="flex-center h-screen bg-vibrant">
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: 20, color: 'var(--text-secondary)' }}>Milo is preparing your questions... 🧸</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-center h-screen bg-vibrant">
        <motion.div 
           className="card" style={{ maxWidth: 450, padding: 48, textAlign: 'center' }}
           initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        >
           <div style={{ fontSize: 80, marginBottom: 20 }}>{result.emoji}</div>
           <h2 style={{ fontSize: 24, marginBottom: 12 }}>Here's your vibe today</h2>
           <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
              "{result.description}"
           </p>
           <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-active)', textAlign: 'left', marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <Cookie size={20} color="var(--primary)" />
                 <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>Saved to this device</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '8px 0 0' }}>
                 Your mood is saved locally. Login to sync it to your calendar and track your journey.
              </p>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
               Save to My Calendar <Sparkles size={18} style={{ marginLeft: 8 }} />
             </button>
             <button className="btn btn-secondary" onClick={() => navigate('/activities')}>
               Try a Fun Activity
             </button>
             <button className="btn-back" style={{ margin: '8px auto 0' }} onClick={() => navigate(-1)}>
               <ArrowLeft size={14} /> Close Check-In
             </button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-center h-screen bg-vibrant">
      <div className="mood-flow-container" style={{ maxWidth: 600, width: '90%' }}>
         <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <button className="btn-back" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
            <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginTop: 24 }}>STEP {currentStep + 1} OF {questions.length}</div>
            <div className="progress-bar-bg" style={{ margin: '12px auto' }}>
               <div className="progress-bar-fill" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} />
            </div>
         </div>

         <AnimatePresence mode="wait">
           <motion.div 
             key={currentStep}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="card" style={{ padding: 48 }}
           >
              <h2 style={{ fontSize: 22, marginBottom: 24, lineHeight: 1.4 }}>{questions[currentStep]}</h2>
              
              {isEmojiQuestion && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                  {EMOJI_PICKER.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleNext(emoji)}
                      style={{
                        fontSize: 28,
                        padding: '8px 12px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.2)'; e.target.style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.borderColor = 'var(--border)'; }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <input 
                autoFocus
                className="form-input"
                placeholder={isEmojiQuestion ? "Or type your emoji here..." : "Talk to me..."}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                style={{ fontSize: 18, padding: '16px 20px', borderRadius: 16 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentInput.trim()) {
                    handleNext(currentInput);
                  }
                }}
              />
              <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text-tertiary)' }}>
                Press Enter to continue
              </p>
           </motion.div>
         </AnimatePresence>

         {analyzing && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
               <Loader2 className="animate-spin" size={24} style={{ display: 'inline-block' }} />
               <span style={{ marginLeft: 12, color: 'var(--primary)' }}>Milo is reading your vibe...</span>
            </div>
         )}
      </div>
    </div>
  );
}
