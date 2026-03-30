import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, UserCheck, LogIn, Mail, Smartphone, ArrowRight, Heart } from 'lucide-react';

export default function AuthGate() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMockLogin = (method) => {
    setLoading(true);
    // Simulating identity verification
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      localStorage.setItem('user_auth', 'true');
    }, 1500);
  };

  // Screen 7: Connected State (Success)
  if (isLoggedIn) {
    return (
      <div className="animate-fade-in" style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <div className="card" style={{ maxWidth: 500, padding: 48, textAlign: 'center', border: '2px solid var(--success)' }}>
          <div style={{ background: 'var(--success-light)', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <UserCheck size={40} color="var(--success)" />
          </div>
          <h1 style={{ marginBottom: 12 }}>You're Connected</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
            Identity verified. A trained Youngistaan volunteer will be with you in less than 5 minutes.
          </p>
          <div className="observation-card">
            <div className="observation-avatar">V</div>
            <div className="observation-content" style={{ textAlign: 'left' }}>
              <h4 style={{ margin: 0 }}>Volunteer #428</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Joining soon...</p>
            </div>
          </div>
          <button className="btn btn-primary w-full" style={{ marginTop: 24 }} onClick={() => navigate('/dashboard/user')}>
            Go to My Dashboard <ArrowRight size={18} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>
    );
  }

  // Screen 6: Login Required (Justified)
  return (
    <div className="animate-fade-in" style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <div className="card" style={{ maxWidth: 450, padding: 40, textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--palette-purple)" style={{ marginBottom: 20 }} />
        <h2 style={{ marginBottom: 12 }}>Safe Support Gate</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
          To connect you with a volunteer safely, we need to verify your identity. 
          Your information is always protected under our anonymity-first policy.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-secondary w-full" onClick={() => handleMockLogin('Google')} disabled={loading}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 600 }}>G</span>
              <span>Continue with Google</span>
            </div>
          </button>
          <button className="btn btn-secondary w-full" onClick={() => handleMockLogin('Phone')} disabled={loading}>
            <Smartphone size={18} style={{ marginRight: 8 }} /> Continue with Phone
          </button>
          <button className="btn btn-secondary w-full" onClick={() => handleMockLogin('Email')} disabled={loading}>
            <Mail size={18} style={{ marginRight: 8 }} /> Continue with Email
          </button>
        </div>

        {loading && (
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
             <div className="loading-spinner-sm" />
             <span style={{ fontSize: 13, color: 'var(--palette-purple)' }}>Creating secure connection...</span>
          </div>
        )}

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-tertiary)', fontSize: 12 }}>
           <Heart size={14} fill="var(--palette-purple)" />
           <span>Youngistaan safe community check</span>
        </div>
      </div>
    </div>
  );
}
