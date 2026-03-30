import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, ArrowLeft, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function UserSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'user', age_group: '13-19' 
  });
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
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
    <div className="flex bg-vibrant h-screen">
      {/* LEFT: EMPOWERMENT PANEL */}
      <div className="login-visual-panel" style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button className="btn-back" style={{ marginBottom: 32 }} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: 32, marginBottom: 24 }}>Join our Safe Space</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
               Be part of a 14,000+ strong community where mental wellbeing 
               is the priority. Every voice matters. Every feeling is valid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div className="card" style={{ padding: 20, background: 'var(--bg-glass)', border: '1px solid var(--border-active)' }}>
                  <ShieldCheck size={24} color="var(--palette-purple)" style={{ marginBottom: 12 }} />
                  <h4 style={{ margin: 0 }}>Progressive Trust</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Your data is only stored when YOU choose to connect.</p>
               </div>
               <div className="card" style={{ padding: 20, background: 'var(--bg-glass)', border: '1px solid var(--border-active)' }}>
                  <Heart size={24} color="var(--palette-pink)" style={{ marginBottom: 12 }} />
                  <h4 style={{ margin: 0 }}>No Judgment</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Talk about anything, from exam stress to midnight thoughts.</p>
               </div>
            </div>
         </motion.div>
      </div>

      {/* RIGHT: SIGNUP FORM */}
      <div className="login-form-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ width: 450, padding: 48 }}>
            <h2 style={{ fontSize: 28, marginBottom: 32 }}>Create Your Space</h2>
            
            {error && <div className="badge critical" style={{ marginBottom: 24, width: '100%' }}>{error}</div>}

            <form onSubmit={handleSignup}>
               <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" type="text" placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
               </div>
               <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="name@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
               </div>
               <div className="form-group">
                  <label className="form-label">Age Group</label>
                  <select className="form-input" value={formData.age_group} onChange={e => setFormData({...formData, age_group: e.target.value})} required>
                     <option value="6-12">Children (6-12)</option>
                     <option value="13-19">Teens (13-19)</option>
                  </select>
               </div>
               <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
               </div>
               <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 12 }}>
                  Start My Journey <Sparkles size={18} style={{ marginLeft: 8 }} />
               </button>
            </form>

            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14 }}>
               <span style={{ color: 'var(--text-tertiary)' }}>Already have an account? </span>
               <Link to="/login" style={{ color: 'var(--palette-purple)', fontWeight: 600 }}>Log In</Link>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
