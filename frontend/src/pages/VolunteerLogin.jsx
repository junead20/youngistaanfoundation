import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { ShieldCheck, Mail, Lock, User, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

const EXPERTISE_OPTIONS = ['Anxiety', 'Depression', 'Relationships', 'Family', 'Studies', 'General Support'];
const AGE_GROUPS = ['13-18', '18-25', '25+'];

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const { loginVolunteer } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', 
    expertise: [], ageGroups: [], bio: ''
  });

  const handleToggleExpertise = (exp) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(exp) 
        ? prev.expertise.filter(e => e !== exp)
        : [...prev.expertise, exp]
    }));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegistering ? '/api/auth/volunteer/register' : '/api/auth/volunteer/login';
      const res = await axios.post(endpoint, formData);
      loginVolunteer(res.data);
      navigate('/volunteer-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: isRegistering ? 600 : 400, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', padding: 12, borderRadius: 16, background: 'rgba(6,182,212,0.1)', marginBottom: 16 }}>
              <ShieldCheck size={32} color="#06B6D4" />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Volunteer Portal</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isRegistering ? 'Join our community of empathetic mentors.' : 'Welcome back, Mentor.'}
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13, marginBottom: 24 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth}>
            <div style={{ display: 'grid', gridTemplateColumns: isRegistering ? '1fr 1fr' : '1fr', gap: 20 }}>
              {/* Common Fields */}
              <div style={{ gridColumn: isRegistering ? 'span 2' : 'span 1' }}>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" required className="input" style={{ paddingLeft: 40 }} 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ gridColumn: isRegistering ? 'span 2' : 'span 1' }}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" required className="input" style={{ paddingLeft: 40 }} 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {isRegistering && (
                <>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" required className="input" style={{ paddingLeft: 40 }} 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">Expertise (Select all that apply)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {EXPERTISE_OPTIONS.map(opt => (
                        <button
                          key={opt} type="button"
                          onClick={() => handleToggleExpertise(opt)}
                          className={`chip ${formData.expertise.includes(opt) ? 'selected' : ''}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label">A short bio about your experience</label>
                    <textarea 
                      className="input" rows={3} required
                      value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="e.g. 5 years of counseling experience..."
                    />
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 32 }} disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>{isRegistering ? 'Register as Volunteer' : 'Login'} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ width: '100%', marginTop: 20, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have a volunteer account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
