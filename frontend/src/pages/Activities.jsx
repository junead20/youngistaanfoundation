import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Sparkles, Filter, ArrowRight, X, RotateCcw, CheckCircle, Heart, Brain, Smile } from 'lucide-react';

// ── MINI GAMES ──
const BREATHING_STEPS = ['Breathe in...', 'Hold...', 'Breathe out...', 'Hold...'];
const AFFIRMATIONS = [
  "I am enough, just as I am.",
  "My feelings are valid and important.",
  "I deserve kindness, especially from myself.",
  "I am stronger than I think.",
  "This moment will pass, and I will be okay.",
  "I choose to let go of what I can't control.",
  "My worth is not defined by my mistakes.",
  "I am growing, even when it doesn't feel like it."
];
const WORD_PAIRS = [
  { word: 'CALM', scrambled: 'MLAC' },
  { word: 'PEACE', scrambled: 'CAEPE' },
  { word: 'BRAVE', scrambled: 'EVBAR' },
  { word: 'HAPPY', scrambled: 'YPAHP' },
  { word: 'STRONG', scrambled: 'GNORTS' },
  { word: 'HOPE', scrambled: 'PEHO' },
];
const GRATITUDE_PROMPTS = [
  "Something that made me smile today...",
  "A person I'm grateful for...",
  "A skill I'm proud of...",
  "A memory that warms my heart...",
  "Something beautiful I noticed today..."
];
const MEMORY_EMOJIS = ['🌸', '🌊', '☀️', '🦋', '🌈', '🍀', '💜', '⭐'];

function BreathingGame({ onClose }) {
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [active, setActive] = useState(false);
  const durations = [4000, 4000, 4000, 4000];

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      if (step < 3) setStep(s => s + 1);
      else { setStep(0); setCycle(c => c + 1); }
    }, durations[step]);
    return () => clearTimeout(timer);
  }, [step, active, cycle]);

  const sizes = [120, 140, 80, 100];

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h2 style={{ marginBottom: 8 }}>4-4-4-4 Box Breathing</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Follow the circle. {cycle} cycles completed.</p>
      <motion.div
        animate={{ width: sizes[step], height: sizes[step] }}
        transition={{ duration: durations[step] / 1000, ease: 'easeInOut' }}
        style={{ background: 'linear-gradient(135deg, var(--primary), var(--palette-blue))', borderRadius: '50%', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}
      >
        {active ? BREATHING_STEPS[step] : 'Ready?'}
      </motion.div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setActive(!active)}>{active ? 'Pause' : 'Start'}</button>
        <button className="btn btn-secondary" onClick={onClose}><X size={16} /> Close</button>
      </div>
    </div>
  );
}

function GratitudeGame({ onClose }) {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    setEntries([...entries, { prompt: GRATITUDE_PROMPTS[currentPrompt], answer: text }]);
    setText('');
    if (currentPrompt < GRATITUDE_PROMPTS.length - 1) setCurrentPrompt(p => p + 1);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ marginBottom: 8 }}>Gratitude Journal ✨</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{entries.length} of {GRATITUDE_PROMPTS.length} entries</p>
      {currentPrompt < GRATITUDE_PROMPTS.length ? (
        <>
          <div className="card" style={{ marginBottom: 24, background: 'var(--primary-light)', border: 'none', padding: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--primary-dark)', margin: 0 }}>{GRATITUDE_PROMPTS[currentPrompt]}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" value={text} onChange={e => setText(e.target.value)} placeholder="Type your answer..." onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button className="btn btn-primary" onClick={handleAdd}>Add</button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌟</div>
          <h3>Beautiful! You found {entries.length} things to be grateful for.</h3>
        </div>
      )}
      {entries.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {entries.map((e, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{e.prompt}</span>
              <div style={{ fontWeight: 600, marginTop: 4 }}>{e.answer}</div>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: 24 }}><X size={16} /> Close</button>
    </div>
  );
}

function WordUnscramble({ onClose }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const check = () => {
    if (input.toUpperCase() === WORD_PAIRS[current].word) setScore(s => s + 1);
    if (current < WORD_PAIRS.length - 1) { setCurrent(c => c + 1); setInput(''); }
    else setDone(true);
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
      <h2>Word Unscramble Complete!</h2>
      <p style={{ fontSize: 18, color: 'var(--primary)', fontWeight: 700 }}>{score}/{WORD_PAIRS.length} correct</p>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Every positive word you unscramble plants a seed of good energy!</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => { setCurrent(0); setScore(0); setDone(false); setInput(''); }}><RotateCcw size={16} /> Play Again</button>
        <button className="btn btn-secondary" onClick={onClose}><X size={16} /> Close</button>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h2 style={{ marginBottom: 8 }}>Unscramble the Positive Word</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Word {current + 1} of {WORD_PAIRS.length}</p>
      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)', letterSpacing: 12, marginBottom: 32 }}>{WORD_PAIRS[current].scrambled}</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 300, margin: '0 auto' }}>
        <input className="form-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Your answer..." onKeyDown={e => e.key === 'Enter' && check()} style={{ textAlign: 'center', fontSize: 18, textTransform: 'uppercase' }} />
        <button className="btn btn-primary" onClick={check}>Check</button>
      </div>
    </div>
  );
}

function AffirmationCard({ onClose }) {
  const [index, setIndex] = useState(Math.floor(Math.random() * AFFIRMATIONS.length));
  return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>💜</div>
          <h2 style={{ fontSize: 28, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.4 }}>"{AFFIRMATIONS[index]}"</h2>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setIndex(Math.floor(Math.random() * AFFIRMATIONS.length))}><RotateCcw size={16} /> Next</button>
        <button className="btn btn-secondary" onClick={onClose}><X size={16} /> Close</button>
      </div>
    </div>
  );
}

function MemoryGame({ onClose }) {
  const cards = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].sort(() => Math.random() - 0.5);
  const [revealed, setRevealed] = useState([]);
  const [matched, setMatched] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const handleClick = (i) => {
    if (disabled || revealed.includes(i) || matched.includes(i)) return;
    const next = [...revealed, i];
    setRevealed(next);
    if (next.length === 2) {
      setDisabled(true);
      if (cards[next[0]] === cards[next[1]]) {
        setMatched(m => [...m, ...next]);
        setRevealed([]);
        setDisabled(false);
      } else {
        setTimeout(() => { setRevealed([]); setDisabled(false); }, 800);
      }
    }
  };

  const done = matched.length === cards.length;

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h2 style={{ marginBottom: 8 }}>Mindful Memory 🧠</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{done ? '🎉 All matched! Great focus!' : `${matched.length / 2} of ${MEMORY_EMOJIS.length} pairs found`}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
        {cards.map((emoji, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(i)}
            style={{
              width: 64, height: 64, borderRadius: 12, fontSize: 28,
              border: matched.includes(i) ? '2px solid var(--success)' : '1px solid var(--border)',
              background: (revealed.includes(i) || matched.includes(i)) ? 'var(--bg-tertiary)' : 'var(--primary-light)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: '0.2s'
            }}
          >
            {(revealed.includes(i) || matched.includes(i)) ? emoji : '?'}
          </motion.button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {done && <button className="btn btn-primary" onClick={() => { setMatched([]); setRevealed([]); }}><RotateCcw size={16} /> Play Again</button>}
        <button className="btn btn-secondary" onClick={onClose}><X size={16} /> Close</button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
const GAMES = [
  { id: 'breathing', title: '4-4-4-4 Box Breathing', desc: 'Follow the circle to calm your mind using guided breathing.', icon: '🫧', duration: '3 min', category: 'Mindful', component: BreathingGame },
  { id: 'gratitude', title: 'Gratitude Journal', desc: 'Write down 5 things you appreciate right now.', icon: '✨', duration: '5 min', category: 'Mindful', component: GratitudeGame },
  { id: 'word', title: 'Positive Word Unscramble', desc: 'Unscramble positive words to boost your mood.', icon: '🔤', duration: '3 min', category: 'Creative', component: WordUnscramble },
  { id: 'affirmation', title: 'Affirmation Cards', desc: 'Flip cards with powerful self-affirmations.', icon: '💜', duration: '2 min', category: 'Mindful', component: AffirmationCard },
  { id: 'memory', title: 'Mindful Memory Match', desc: 'Match emoji pairs to exercise focus and attention.', icon: '🧠', duration: '5 min', category: 'Creative', component: MemoryGame },
];

export default function Activities() {
  const navigate = useNavigate();
  const [apiActivities, setApiActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [activeGame, setActiveGame] = useState(null);
  const [completedDB, setCompletedDB] = useState({});

  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => { setApiActivities(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['All', 'Games', 'Mindful', 'Creative', 'Physical', 'Social'];
  const isLoggedIn = !!localStorage.getItem('token');

  // Current active game modal
  if (activeGame) {
    const GameComponent = activeGame.component;
    return (
      <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 40px 80px' }}>
        <button className="btn-back" style={{ marginBottom: 24 }} onClick={() => setActiveGame(null)}>
          <ArrowLeft size={16} /> Back to List
        </button>
        <div className="card">
          <GameComponent onClose={() => setActiveGame(null)} />
        </div>
      </div>
    );
  }

  const filteredDB = filter === 'All'
    ? apiActivities
    : filter === 'Games'
    ? []
    : apiActivities.filter(a => a.category === filter);

  const todaySeed = new Date().getDate();
  const filteredGames = (filter === 'All' || filter === 'Games' || filter === 'Mindful' || filter === 'Creative'
    ? GAMES.filter(g => filter === 'All' || filter === 'Games' || g.category === filter)
    : []).sort((a, b) => {
       const hashA = a.id.charCodeAt(0) * todaySeed;
       const hashB = b.id.charCodeAt(0) * todaySeed;
       return (hashA % 3) - (hashB % 3);
    });

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
      {!isLoggedIn && (
        <button className="btn-back" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
      )}

      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
           <h1 style={{ fontSize: 32, margin: 0 }}>Fun Activities & Games ✨</h1>
           <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: 14 }}>Quick activities and games designed to boost your mood and mental wellness.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
           <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setActiveGame(GAMES[Math.floor(Math.random() * GAMES.length)])}
              style={{ marginRight: 16 }}
           >
              Quick Random Game <Sparkles size={14} style={{ marginLeft: 6 }} />
           </button>
           {categories.map((c) => (
              <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(c)}>
                {c}
              </button>
           ))}
        </div>
      </div>

      {/* INTERACTIVE GAMES SECTION */}
      {filteredGames.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain size={22} color="var(--primary)" /> Interactive Mind Games
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -4 }}
                className="card"
                style={{ padding: 28, cursor: 'pointer', border: '1px solid var(--border-active)' }}
                onClick={() => setActiveGame(game)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 36 }}>{game.icon}</span>
                  <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                    <Clock size={10} style={{ marginRight: 4 }} /> {game.duration}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{game.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{game.desc}</p>
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Play Now <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* DATABASE ACTIVITIES SECTION */}
      {filteredDB.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Smile size={22} color="var(--primary)" /> Quick Wellness Activities
          </h2>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner-sm" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {filteredDB.map((a, i) => (
                <motion.div
                  key={a._id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>{a.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}><Clock size={11} /> {a.duration}</span>
                  </div>
                  <h3 style={{ fontSize: 16, marginBottom: 10 }}>{a.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.6, marginBottom: 16 }}>{a.description}</p>
                  <button 
                     className={`btn btn-sm ${completedDB[a._id || i] ? 'btn-primary' : 'btn-secondary'}`} 
                     style={{ width: '100%', ...(completedDB[a._id || i] ? { background: 'var(--success)', color: '#000' } : {}) }}
                     onClick={() => setCompletedDB(prev => ({ ...prev, [a._id || i]: !prev[a._id || i] }))}
                  >
                    <CheckCircle size={14} style={{ marginRight: 6 }} /> {completedDB[a._id || i] ? 'Completed!' : 'Mark as Done'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {!isLoggedIn && (
        <div className="card" style={{ marginTop: 48, textAlign: 'center', background: 'var(--bg-glass)', border: '1px dashed var(--border-active)', padding: 40 }}>
          <Heart size={32} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h3>Want More?</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '12px auto 24px' }}>
            Login to chat with Milo, join communities, and track your mood journey.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Create Account <ArrowRight size={16} style={{ marginLeft: 8 }} /></button>
        </div>
      )}
    </div>
  );
}
