import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mic, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Simple Age Capture Modal Component
const AgeInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [age, setAge] = useState('');
  
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass animate-bounce-in" style={{ width: '100%', maxWidth: 400, padding: 32, borderRadius: 24, background: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>Welcome to YuvaPulse</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Before we start, please tell us your age so we can better support you.</p>
        
        <input 
          type="number" 
          placeholder="Enter your age" 
          value={age} 
          onChange={(e) => setAge(e.target.value)}
          className="input-field"
          style={{ width: '100%', fontSize: 20, padding: 16, textAlign: 'center', borderRadius: 16, marginBottom: 24, border: '2px solid var(--border)' }}
          autoFocus
        />
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1, borderRadius: 100 }} onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, borderRadius: 100, opacity: age && age > 0 ? 1 : 0.5 }} 
            disabled={!age || age <= 0}
            onClick={() => onSubmit(age)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Emergency Contact List Modal
const SOSContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="glass animate-bounce-in" style={{ width: '100%', maxWidth: 400, padding: 32, borderRadius: 24, background: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🆘</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: '#EF4444' }}>Emergency Help</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>You are not alone. Please reach out to someone who can help you right now.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          <a href="tel:9876543210" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#10B981', textDecoration: 'none' }}>
            <PhoneCall size={18} /> On-Call Volunteer: 98765 43210
          </a>
          <a href="tel:9152987821" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#EF4444', textDecoration: 'none' }}>
            <PhoneCall size={18} /> iCall Helpline: 91529 87821
          </a>
          <a href="tel:18602662345" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F59E0B', textDecoration: 'none' }}>
            <PhoneCall size={18} /> Vandrevala Foundation: 1860 266 2345
          </a>
          <a href="tel:112" className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', color: '#EF4444', borderColor: '#EF4444' }}>
            <PhoneCall size={18} /> National Emergency: 112
          </a>
        </div>
        
        <button className="btn-outline" style={{ width: '100%', borderRadius: 100 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default function PreLoginMood() {
  const navigate = useNavigate();
  const { guestLogin, user } = useApp();
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [agePromptInfo, setAgePromptInfo] = useState({ isOpen: false, targetPath: '' });

  const handleStartRequest = (path) => {
    if (user) {
      navigate(path);
    } else {
      // Prompt for age instead of directly logging in
      setAgePromptInfo({ isOpen: true, targetPath: path });
    }
  };

  const handleAgeSubmit = (age) => {
    guestLogin(age); // Pass the captured age through context
    const path = agePromptInfo.targetPath;
    setAgePromptInfo({ isOpen: false, targetPath: '' });
    navigate(path);
  };

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      {/* Dynamic Modals */}
      <SOSContactModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
      
      <AgeInputModal 
        isOpen={agePromptInfo.isOpen} 
        onClose={() => setAgePromptInfo({ isOpen: false, targetPath: '' })} 
        onSubmit={handleAgeSubmit} 
      />
      
      {/* Floating SOS FAB */}
      <button 
        className="fab-sos animate-bounce-in delay-500" 
        onClick={() => setIsSosOpen(true)}
      >
        <div className="fab-icon"><PhoneCall size={18} /></div>
        <span>SOS: Need help?</span>
      </button>

      <nav className="landing-nav animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '24px 5%', boxSizing: 'border-box' }}>
        <div className="brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 900 }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #ffd8b8, #cde3d6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color="#2f2a28" />
          </div>
          YuvaPulse
        </div>
        <div className="links" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#about" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15, transition: 'color 0.2s' }}>About</a>
          <a href="#support" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 15, transition: 'color 0.2s' }}>Support</a>
          <button className="btn-outline" onClick={() => navigate('/volunteer-login')} style={{ cursor: 'pointer', padding: '8px 24px', borderRadius: 100, fontSize: 14 }}>
            Volunteer Login
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '16vh', maxWidth: 800 }} className="animate-fade-up delay-100">
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, marginBottom: 20, letterSpacing: '-1px', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          <span style={{ background: 'linear-gradient(120deg, #ffd8b8, #cde3d6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>A soft space to express</span><br />
          <span style={{ color: 'var(--text-primary)' }}>how I feel</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(16px, 2vw, 20px)', marginBottom: 48, fontWeight: 500 }}>
          No judgment. No pressure. Just start.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ padding: '16px 48px', fontSize: 18, borderRadius: 100 }}
            onClick={() => handleStartRequest('/mood')}
          >
            Start with how I feel
          </button>
          
          <button
            className="btn-secondary"
            style={{ 
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, 
              padding: '12px 24px', borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)',
              color: '#EF4444', fontWeight: 600, fontSize: 15
            }}
            onClick={() => setIsSosOpen(true)}
          >
            <PhoneCall size={18} /> Quick Call Help
          </button>
          
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No login required</span>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }} className="animate-fade-up delay-200">
          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => handleStartRequest('/mood')}
          >
            <span style={{ fontSize: 18 }}>🧠</span> Check how I feel
          </button>

          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => handleStartRequest('/chat')}
          >
            <span style={{ fontSize: 18 }}>💬</span> Just talk
          </button>

          <button
            className="chip"
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => handleStartRequest('/stress-relief')}
          >
            <span style={{ fontSize: 18 }}>🌿</span> Try a small activity
          </button>
        </div>
      </div>

      <div style={{ marginTop: 120, textAlign: 'center', width: '100%', maxWidth: 1000 }} className="animate-fade-up delay-300">
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>How it works</h4>
        <h2 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 40, fontWeight: 800 }}>3 Simple Steps</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, padding: '0 20px' }}>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥺</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Express it</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Share what is on my mind. Someone listens.</p>
          </div>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Talk freely</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chat anonymously at my pace.</p>
          </div>
          <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Feel lighter</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Try small activities and keep what helps.</p>
          </div>
        </div>
      </div>

      <div id="about" style={{ marginTop: 120, padding: '80px 5%', background: 'rgba(255,255,255,0.4)', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, color: 'var(--text-primary)' }}>About YuvaPulse</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            YuvaPulse is a privacy-first, judgment-free space created specifically for young people to express their feelings, 
            receive anonymous support, and access immediate crisis interventions without red tape or stigma.
          </p>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>
            We believe that every emotion matters and every person deserves to be heard. Powered by compassionate volunteers and smart AI assistance.
          </p>
        </div>
      </div>

      <div id="support" style={{ padding: '80px 5%', width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div className="glass" style={{ maxWidth: 800, width: '100%', textAlign: 'center', padding: 48, borderRadius: 24 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, color: 'var(--text-primary)' }}>Support & Resources</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            Whether you need someone to talk to, mental health resources, or immediate intervention, we are here 24/7.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setIsSosOpen(true)} style={{ padding: '12px 32px', borderRadius: 100 }}>
              <PhoneCall size={18} /> View 24/7 Numbers
            </button>
            <button className="btn-outline" onClick={() => handleStartRequest('/stress-relief')} style={{ padding: '12px 32px', borderRadius: 100 }}>
              Try Healing Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
