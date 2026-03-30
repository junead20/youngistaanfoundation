import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function PreLoginMood() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      {/* Top Navigation */}
      <nav className="landing-nav animate-fade-up">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #D946EF, #C084FC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Heart size={18} fill="white" color="white" />
          </div>
          YuvaPulse
        </div>
        <div className="links">
          <a href="#about">About</a>
          <a href="#support">Support</a>
          <button className="btn-outline" onClick={() => navigate('/volunteer-login')} style={{ cursor: 'pointer' }}>
            Volunteer Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '16vh', maxWidth: 800 }} className="animate-fade-up delay-100">
        
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, marginBottom: 20, letterSpacing: '-1px', lineHeight: 1.1 }}>
          <span className="gradient-text">A safe space to express</span><br/>
          <span className="gradient-text">how you feel</span>
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(16px, 2vw, 20px)', marginBottom: 48, fontWeight: 500 }}>
          No judgment. No pressure. Just start.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn btn-primary btn-lg" 
            style={{ padding: '16px 48px', fontSize: 18, borderRadius: 100 }} 
            onClick={() => navigate('/mood')}
          >
            Start with how you feel
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No login required</span>
        </div>

        {/* Secondary Actions */}
        <div style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }} className="animate-fade-up delay-200">
          <button 
            className="chip" 
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/mood')}
          >
            <span style={{ fontSize: 18 }}>🧠</span> Check how I feel
          </button>
          
          <button 
            className="chip" 
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/talk')}
          >
            <span style={{ fontSize: 18 }}>💬</span> Just talk
          </button>

          <button 
            className="chip" 
            style={{ padding: '12px 24px', fontSize: 15, borderRadius: 100, display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={() => navigate('/stress-relief')}
          >
            <span style={{ fontSize: 18 }}>🌿</span> Try a small activity
          </button>
        </div>
      </div>

      {/* How it works simple section - mockup */}
      <div style={{ marginTop: '120px', textAlign: 'center', width: '100%', maxWidth: 1000 }} className="animate-fade-up delay-300">
        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>How it works</h4>
        <h2 style={{ fontSize: 28, color: 'var(--text-primary)', marginBottom: 40, fontWeight: 800 }}>3 Simple Steps</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, padding: '0 20px' }}>
           <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🥺</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Express it</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Share what's on your mind. We listen.</p>
           </div>
           <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Talk freely</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chat with our AI anonymously.</p>
           </div>
           <div className="glass" style={{ padding: '40px 24px', borderRadius: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Feel better</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Find activities and clarity to move forward.</p>
           </div>
        </div>
      </div>

    </div>
  );
}
