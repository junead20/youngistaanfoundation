import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, MessageCircle, ShieldCheck, Heart, Sparkles, Wind, Users } from 'lucide-react';

export default function PreLoginMood() {
  const navigate = useNavigate();

  return (
    <div className="pre-login-container">
      <div className="glass-card pre-login-card animate-fade-up" style={{ textAlign: 'center', padding: '48px 32px' }}>
        
        {/* Brand Icon */}
        <div style={{ display: 'inline-flex', padding: 20, borderRadius: 24, background: 'linear-gradient(135deg, rgba(235,177,255,0.2), rgba(209,242,255,0.2))', border: '1px solid rgba(235,177,255,0.3)', marginBottom: 28 }} className="animate-float">
          <Brain size={48} className="gradient-text-purple" />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, letterSpacing: '-0.5px' }}>
          Welcome to <span className="gradient-text">Reachus</span>
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 40, maxWidth: 320, margin: '0 auto 40px' }}>
          Your anonymous, safe space for mental health support, AI empathy, and community connection.
        </p>

        <button 
          id="get-started-btn"
          className="btn btn-primary btn-lg" 
          style={{ width: '100%', height: 56, fontSize: 18, marginTop: 24 }} 
          onClick={() => navigate('/login')}
        >
          Get Started <ArrowRight size={22} />
        </button>

        <button 
          onClick={() => navigate('/volunteer-login')}
          style={{ width: '100%', marginTop: 28, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Are you a volunteer? Login here
        </button>

        <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
           <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Sparkles size={12} /> Trusted by 1,000+ students anonymously
           </p>
        </div>
      </div>
    </div>
  );
}
