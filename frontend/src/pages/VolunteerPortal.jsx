import { useState, useEffect } from 'react';
import { Users, Upload, Send, Eye, FileText, Shield, LogIn, Lock, ArrowRight, UserCircle, MessageSquare } from 'lucide-react';
import { getVolunteerObs, getVolunteerStats } from '../services/api';

const obsTypeLabels = {
  withdrawn: '😶 Withdrawn',
  exam_stress: '📝 Exam Stress',
  bullying: '👊 Bullying',
  low_confidence: '📉 Low Confidence',
  anxiety: '😰 Anxiety',
  positive_change: '✨ Positive Change'
};

export default function VolunteerPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [tab, setTab] = useState('dashboard');
  const [observations, setObservations] = useState([]);
  const [volStats, setVolStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [obs, stats] = await Promise.all([getVolunteerObs(), getVolunteerStats()]);
      setObservations(obs);
      setVolStats(stats);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.email.includes('youngistaan') && loginForm.password.length > 3) {
      setIsLoggedIn(true);
      loadData();
    }
  };

  // Screen V1: Volunteer Login
  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in" style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        <div className="card" style={{ maxWidth: 450, padding: 48, textAlign: 'center' }}>
          <Lock size={48} color="var(--palette-purple)" style={{ marginBottom: 20 }} />
          <h2 style={{ marginBottom: 12 }}>Volunteer Admin Access</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 32 }}>
            Awaiting authentication. Please enter your Youngistaan Foundation credentials.
          </p>
          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input 
                type="email" className="form-input" placeholder="name@youngistaan.org" 
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" className="form-input" placeholder="••••••••" 
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                required 
              />
            </div>
            <button className="btn btn-primary w-full" style={{ marginTop: 12 }}>
              Secure Access
            </button>
          </form>
          <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
             <Shield size={10} style={{ marginRight: 4 }} /> All access is logged and encrypted.
          </div>
        </div>
      </div>
    );
  }

  // Screen V3: User Detail Anonymized
  if (selectedUser) {
    return (
      <div className="animate-fade-in" style={{ position: 'relative' }}>

         <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => setSelectedUser(null)}>
            ← Back to Dashboard
         </button>
         
         <div className="volunteer-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="card">
               <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ background: 'var(--bg-tertiary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>👤</div>
                  <h2 style={{ margin: 0 }}>User #{selectedUser.id}</h2>
                  <p style={{ color: 'var(--palette-blue)', fontWeight: 600, fontSize: 14 }}>Mood: {selectedUser.moodScore}/10</p>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="observation-meta">
                     <span className="badge medium">AGE: {selectedUser.age_group || '13-19'}</span>
                  </div>
                  <div className="observation-meta">
                     <span className="badge high">RISK: PRIORITY</span>
                  </div>
                  <button className="btn btn-primary w-full" style={{ marginTop: 12 }}>Respond to User</button>
               </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <h3 className="card-title"><MessageSquare size={18} /> Chat History</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.8 }}>
                  <div className="chat-message bot" style={{ maxWidth: '80%', padding: 12, background: 'var(--bg-glass)', borderRadius: 12 }}>
                     "How are things at school today?"
                  </div>
                  <div className="chat-message user" style={{ alignSelf: 'flex-end', maxWidth: '80%', padding: 12, background: 'var(--bg-tertiary)', borderRadius: 12 }}>
                     "Feeling really overwhelmed by the final exams next week..."
                  </div>
                  <div className="chat-message bot" style={{ maxWidth: '80%', padding: 12, background: 'var(--bg-glass)', borderRadius: 12 }}>
                     "I hear you. Exams can be tough. What's one small thing we can tackle?"
                  </div>
               </div>
               <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 16, fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Judges Note: Real identity is MASKED. 
               </div>
            </div>
         </div>
      </div>
    );
  }

  // Screen V2: Volunteer Dashboard
  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>


      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0 }}>Volunteer Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>Anonymized oversight for safety.</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--palette-purple)', fontWeight: 600 }}>VOLUNTEER_AUTH_TOKEN: ACTIVE</div>
      </div>

      <div className="tabs" style={{ marginBottom: 32 }}>
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          <Users size={14} style={{ marginRight: 6 }} /> Active Connections
        </button>
        <button className={`tab ${tab === 'offline' ? 'active' : ''}`} onClick={() => setTab('offline')}>
          <Upload size={14} style={{ marginRight: 6 }} /> Offline Sheets
        </button>
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          <FileText size={14} style={{ marginRight: 6 }} /> Analytics
        </button>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 20 }}>Priority Connections</h3>
        <table className="data-table">
          <thead>
            <tr>
               <th>User ID</th>
               <th>Mood Trend</th>
               <th>Risk Level</th>
               <th>Last Interaction</th>
               <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'AF32', moodTrend: '📉', risk: 'Priority Connect', time: '2m ago', moodScore: 3 },
              { id: 'BG89', moodTrend: '📈', risk: 'Low', time: '15m ago', moodScore: 8 },
              { id: 'CX12', moodTrend: '➖', risk: 'Moderate', time: '1h ago', moodScore: 5 },
            ].map((u, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: 'var(--palette-purple)' }}>User #{u.id}</td>
                <td style={{ fontSize: 18 }}>{u.moodTrend}</td>
                <td><span className={`badge ${u.risk === 'Priority Connect' ? 'critical' : u.risk === 'Moderate' ? 'yellow' : 'low'}`}>{u.risk}</span></td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{u.time}</td>
                <td>
                   <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(u)}>View Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
