import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { User, Hash, ArrowRight, Shield, Loader } from 'lucide-react';

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [tab, setTab] = useState('new'); // 'new' | 'returning'
  const [age, setAge] = useState('');
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNewUser = async () => {
    if (!age || age < 10 || age > 100) { setError('Please enter a valid age (10–100)'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/auth/anonymous', { age: Number(age), nickname: nickname || 'Anonymous' });
      const { userId, token, nickname: nick } = res.data;
      loginUser({ userId, token, nickname: nick, role: 'user' });
      navigate('/dashboard');
    } catch (e) {
      // Offline fallback — generate ID client-side
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let id = 'MBX';
      for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
      const fakeToken = btoa(JSON.stringify({ userId: id, role: 'user', exp: Date.now() + 86400000 * 30 }));
      loginUser({ userId: id, token: fakeToken, nickname: nickname || 'Anonymous', role: 'user' });
      navigate('/dashboard');
    } finally { setLoading(false); }
  };

  const handleReturningUser = async () => {
    if (!userId.trim()) { setError('Please enter your User ID'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/auth/login', { userId: userId.trim().toUpperCase() });
      loginUser({ userId: res.data.userId, token: res.data.token, nickname: res.data.nickname, role: 'user' });
      navigate('/dashboard');
    } catch (e) {
      // Offline fallback
      const fakeToken = btoa(JSON.stringify({ userId: userId.trim().toUpperCase(), role: 'user' }));
      loginUser({ userId: userId.trim().toUpperCase(), token: fakeToken, nickname: 'Anonymous', role: 'user' });
      navigate('/dashboard');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-content animate-fade-up">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 999, marginBottom: 16
          }}>
            <Shield size={14} color="#6EE7B7" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6EE7B7' }}>100% Anonymous — No Email Required</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Enter MindBridge</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your identity stays completely private</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          {[{ id: 'new', label: '✨ First Time', icon: User }, { id: 'returning', label: '🔑 Return User', icon: Hash }].map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => { setTab(t.id); setError(''); }}
              style={{
                flex: 1, padding: '10px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
                fontWeight: 600, fontSize: 13, transition: 'all 0.3s',
                background: tab === t.id ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : 'transparent',
                color: tab === t.id ? 'white' : 'var(--text-secondary)',
                boxShadow: tab === t.id ? '0 4px 16px rgba(124,58,237,0.4)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="glass" style={{ padding: 28 }}>
          {tab === 'new' ? (
            <div className="animate-fade">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                A unique anonymous ID like <strong style={{ color: 'var(--purple-light)' }}>MBX5821</strong> will be generated for you.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label className="input-label">Your Age *</label>
                <input
                  id="age-input"
                  type="number"
                  placeholder="e.g. 18"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="input"
                  min={10} max={100}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Nickname (Optional)</label>
                <input
                  id="nickname-input"
                  type="text"
                  placeholder="e.g. StarGazer"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="input"
                  maxLength={20}
                />
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}
              <button
                id="create-account-btn"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleNewUser}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> Create My Safe Space</>}
              </button>
            </div>
          ) : (
            <div className="animate-fade">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Enter the User ID you received when you first signed up.
              </p>
              <div style={{ marginBottom: 24 }}>
                <label className="input-label">Your User ID</label>
                <input
                  id="userid-input"
                  type="text"
                  placeholder="e.g. MBX5821"
                  value={userId}
                  onChange={e => setUserId(e.target.value.toUpperCase())}
                  className="input"
                  style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, textAlign: 'center' }}
                />
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}
              <button
                id="returning-login-btn"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleReturningUser}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : <><ArrowRight size={16} /> Continue</>}
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }} onClick={() => navigate('/')}>← Back</button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }} onClick={() => navigate('/volunteer-login')}>Volunteer Portal</button>
        </p>
      </div>
    </div>
  );
}
