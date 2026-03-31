import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import EmergencySOS from '../components/EmergencySOS';

export default function PreLoginMood() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 0 }}>
      <nav className="landing-nav animate-fade-up">
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #ffd8b8, #cde3d6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} color="#2f2a28" />
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
            style={{ padding: '16px 48px', fontSize: 18, borderRadius: 100, transition: 'all 0.3s' }}
            onClick={() => navigate('/login')}
          >
            Begin Anonymously
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <span style={{ fontSize: 14 }}>🔒</span> No registration or email required
          </div>
        </div>

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
            onClick={() => navigate('/chat')}
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
      <EmergencySOS />
    </div>
  );
}
