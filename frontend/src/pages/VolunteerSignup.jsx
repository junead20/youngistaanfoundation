import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, ArrowLeft, ShieldCheck, Lock, Star } from 'lucide-react';

export default function VolunteerSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'volunteer', age_group: 'N/A' 
  });
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@youngistaan.org')) {
      setError('Please use a valid @youngistaan.org email address');
      return;
    }
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
        navigate('/dashboard/volunteer');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="flex bg-vibrant h-screen">
      {/* LEFT: VOLUNTEER PANEL */}
      <div className="login-visual-panel" style={{ flex: 1, padding: '60px 80px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button className="btn-back" style={{ marginBottom: 32 }} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <h1 style={{ fontSize: 32, marginBottom: 24 }}>Join our Volunteer Force</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
               Be the guide that helps a teen navigate through the fog. 
               YuvaPulse connects 14,000+ volunteers with those in search 
               of a safe space.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div className="card" style={{ padding: 20, background: 'var(--bg-glass)', border: '1px solid var(--border-active)' }}>
                  <Star size={24} color="var(--palette-purple)" style={{ marginBottom: 12 }} />
                  <h4 style={{ margin: 0 }}>Expert Mentoring</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Access training and guides for empathetic engagement.</p>
               </div>
               <div className="card" style={{ padding: 20, background: 'var(--bg-glass)', border: '1px solid var(--border-active)' }}>
                  <Lock size={24} color="var(--palette-lavender)" style={{ marginBottom: 12 }} />
                  <h4 style={{ margin: 0 }}>Strict Privacy</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Our platform masks user identity, ensuring trust remains absolute.</p>
               </div>
            </div>
         </motion.div>
      </div>

      {/* RIGHT: SIGNUP FORM */}
      <div className="login-form-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ width: 450, padding: 48 }}>
            <h2 style={{ fontSize: 28, marginBottom: 32 }}>Volunteer Signup</h2>
            
            {error && <div className="badge critical" style={{ marginBottom: 24, padding: '12px 16px' }}>{error}</div>}

            <form onSubmit={handleSignup}>
               <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase' }}>Full Name</label>
                  <input className="form-input" type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
               </div>
               <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase' }}>Official Email</label>
                  <input className="form-input" type="email" placeholder="name@youngistaan.org" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
               </div>
               <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase' }}>Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
               </div>
               <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 12 }}>
                  Create Account <ArrowRight size={18} style={{ marginLeft: 8 }} />
               </button>
            </form>

            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14 }}>
               <span style={{ color: 'var(--text-tertiary)' }}>Already have a volunteer account? </span>
               <Link to="/volunteer/login" style={{ color: 'var(--palette-purple)', fontWeight: 600 }}>Log In</Link>
            </div>
         </motion.div>
      </div>
    </div>
  );
}
