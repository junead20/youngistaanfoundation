import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

const EXPERTISE_OPTIONS = ['Anxiety', 'Depression', 'Relationships', 'Family', 'Studies', 'General Support'];

export default function VolunteerLogin() {
  const navigate = useNavigate();
  const { loginVolunteer } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '', 
    password: '',
    name: '',
    expertise: [],
    bio: ''
  });

  const handleToggleExpertise = (exp) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(exp) 
        ? prev.expertise.filter(e => e !== exp)
        : [...prev.expertise, exp]
    }));
  };

  const validate = () => {
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password too short');
      return false;
    }

    if (isRegistering) {
      if (!formData.name.trim()) {
        setError('Full Name is required');
        return false;
      }
      if (formData.expertise.length === 0) {
        setError('Please select at least one expertise');
        return false;
      }
    }
    
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = isRegistering ? '/api/volunteer/register' : '/api/volunteer/login';
      const res = await axios.post(endpoint, formData);
      const authData = {
        ...res.data.volunteer,
        token: res.data.token
      };
      loginVolunteer(authData);
      
      if (authData.role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/volunteer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/volunteer/google-mock', {
        email: 'mock.volunteer@gmail.com',
        name: 'Mock Google Volunteer',
        googleId: 'mock-google-id-123456789'
      });
      const authData = {
        ...res.data.volunteer,
        token: res.data.token
      };
      loginVolunteer(authData);
      
      if (authData.role === 'ngo') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/volunteer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Auth simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="glass animate-fade-up" style={{ width: '100%', maxWidth: isRegistering ? 500 : 400, padding: 40 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {isRegistering && (
                <div>
                  <label className="label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" required className="input" style={{ paddingLeft: 40 }} 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" required className="input" style={{ paddingLeft: 40 }} 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
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
                  <div>
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

                  <div>
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
                <>{isRegistering ? 'Register' : 'Login'} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button 
            type="button"
            onClick={handleMockGoogleLogin}
            disabled={loading}
            className="btn btn-outline btn-lg" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, background: 'white', color: '#333', border: '1px solid #ddd', padding: '14px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 16 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Continue with Google</span>
          </button>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            style={{ width: '100%', marginTop: 20, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have a volunteer account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}


