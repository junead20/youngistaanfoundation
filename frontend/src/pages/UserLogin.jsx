import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Calendar, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Cookie } from 'lucide-react';

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return JSON.parse(c.substring(nameEQ.length));
  }
  return null;
};

export default function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [moodHistory, setMoodHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const history = getCookie('guest_mood_history') || [];
    setMoodHistory(history.slice(-7));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        navigate('/dashboard/user');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="flex bg-vibrant" style={{ minHeight: '100vh' }}>
      {/* LEFT: CALENDAR & GUEST INSIGHTS */}
      <div className="login-visual-panel" style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column' }}>
        <button className="btn-back" style={{ marginBottom: 32 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 40 }}>
           <h1 style={{ fontSize: 32, marginBottom: 12 }}>Your Mood Journey</h1>
           <p style={{ color: 'var(--text-secondary)' }}>
              Here's how you've been feeling. Login to save and track your progress over time.
           </p>
        </div>

        {moodHistory.length > 0 ? (
          <div className="card" style={{ padding: 32 }}>
             <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={20} color="var(--primary)" /> Mood Calendar
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
                {moodHistory.map((h, i) => (
                  <div key={i} className="calendar-day" style={{ textAlign: 'center' }}>
                     <div style={{ fontSize: 11, marginBottom: 8, color: 'var(--text-tertiary)' }}>
                       {new Date(h.timestamp).toLocaleDateString(undefined, { weekday: 'short' })}
                     </div>
                     <div 
                        title={h.description}
                        style={{ 
                          width: 48, height: 48, borderRadius: 14, margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          fontSize: 28,
                          boxShadow: 'var(--shadow-sm)',
                          cursor: 'default'
                        }}
                     >
                        {h.emoji || '🙂'}
                     </div>
                  </div>
                ))}
                {Array.from({ length: 7 - moodHistory.length }).map((_, i) => (
                   <div key={`empty-${i}`} className="calendar-day" style={{ opacity: 0.3 }}>
                      <div style={{ fontSize: 11, marginBottom: 8, color: 'var(--text-tertiary)' }}>...</div>
                      <div style={{ width: 48, height: 48, borderRadius: 14, margin: '0 auto', background: 'var(--bg-secondary)', border: '1px dashed var(--border)' }} />
                   </div>
                ))}
             </div>
             <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                <Cookie size={10} style={{ marginRight: 4 }} /> Saved locally on this device
             </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>🧸</div>
             <h3>No mood entries yet</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Try a mood check-in first!</p>
             <button className="btn btn-secondary" onClick={() => navigate('/mood-check')}>
               Start Check-In <ArrowRight size={14} style={{ marginLeft: 6 }} />
             </button>
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--primary)' }}>
           <ShieldCheck size={20} />
           <span style={{ fontSize: 13, fontWeight: 600 }}>Secure, Encrypted Login</span>
        </div>
      </div>

      {/* RIGHT: LOGIN FORM */}
      <div className="login-form-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
         <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="card" style={{ width: 450, padding: 48 }}
         >
            <div style={{ marginBottom: 32 }}>
               <h2 style={{ fontSize: 28, marginBottom: 8 }}>Welcome Back</h2>
               <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Login to access your dashboard, chat with Milo, and join communities.</p>
            </div>

            {error && <div className="badge critical" style={{ marginBottom: 24, width: '100%', padding: '12px 16px' }}>{error}</div>}

            <form onSubmit={handleLogin}>
               <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                     className="form-input" type="email" placeholder="name@email.com" 
                     value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                     required 
                  />
               </div>
               <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                     className="form-input" type="password" placeholder="••••••••" 
                     value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                     required 
                  />
               </div>
               <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 12, width: '100%' }}>
                  Sign In <ArrowRight size={18} style={{ marginLeft: 8 }} />
               </button>
            </form>

            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14 }}>
               <span style={{ color: 'var(--text-tertiary)' }}>Don't have an account? </span>
               <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 40, paddingTop: 24, textAlign: 'center' }}>
               <Link to="/volunteer/login" style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>Volunteer Admin Access</Link>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
