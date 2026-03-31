import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, UserCircle, MessageSquare } from 'lucide-react';

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData})
      });
      const data = await res.json();
      if (res.ok && data.role === 'volunteer') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        navigate('/dashboard/volunteer');
      } else if (res.ok && data.role !== 'volunteer') {
        setError('Only volunteers can access this portal');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="flex-center bg-vibrant h-screen">
      <button className="btn-back" style={{ position: 'absolute', top: 32, left: 32 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: 450, padding: 48, textAlign: 'center' }}>
         <div style={{ background: 'var(--bg-tertiary)', width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-active)' }}>
            <Lock size={40} color="var(--palette-purple)" />
         </div>
         
         <h2 style={{ fontSize: 28, marginBottom: 12 }}>Volunteer Admin Access</h2>
         <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32, maxWidth: 300, margin: '0 auto 32px' }}>
            Please authenticate using your Youngistaan Foundation credentials.
         </p>

         {error && <div className="badge critical" style={{ marginBottom: 24, padding: '12px 16px' }}>{error}</div>}

         <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-group">
               <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Official Work Email</label>
               <input className="form-input" type="email" placeholder="name@youngistaan.org" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="form-group">
               <label className="form-label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
               <input className="form-input" type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
            <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 12 }}>
               Secure Log In <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
         </form>

         <div style={{ marginTop: 32, fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)', paddingTop: 24, fontStyle: 'italic' }}>
            <ShieldCheck size={10} style={{ marginRight: 4 }} /> All access is monitored and encrypted.
         </div>

         <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
            <Link to="/volunteer/signup" style={{ color: 'var(--palette-purple)', fontWeight: 600 }}>Create Volunteer Account</Link>
         </div>
      </motion.div>
    </div>
  );
}
