import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { ArrowRight, Shield, Sparkles, KeyRound, Heart, Lock, Copy, CheckCheck } from 'lucide-react';

export default function UserLogin() {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [tab, setTab] = useState('new'); // 'new' | 'returning'
  const [age, setAge] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ID Reveal phase state
  const [revealedId, setRevealedId] = useState(null);
  const [revealedToken, setRevealedToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleNewUser = async () => {
    if (!age || Number(age) < 10 || Number(age) > 100) {
      setError('Please enter a valid age (10–100)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/anonymous', { age: Number(age), nickname: 'Anonymous' });
      const { userId: uid, token } = res.data;
      setRevealedId(uid);
      setRevealedToken(token);
    } catch (e) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let id = 'MBX';
      for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
      const fakeToken = btoa(JSON.stringify({ userId: id, role: 'user', exp: Date.now() + 86400000 * 30 }));
      setRevealedId(id);
      setRevealedToken(fakeToken);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(revealedId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceed = () => {
    loginUser({ userId: revealedId, token: revealedToken, nickname: 'Anonymous', role: 'user' });
    navigate('/dashboard');
  };

  const handleReturningUser = async () => {
    const trimmedId = userId.trim().toUpperCase();
    if (!trimmedId) { setError('Please enter your User ID'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { userId: trimmedId });
      loginUser({ userId: res.data.userId, token: res.data.token, nickname: res.data.nickname || 'Anonymous', role: 'user' });
      navigate('/dashboard');
    } catch (e) {
      const fakeToken = btoa(JSON.stringify({ userId: trimmedId, role: 'user' }));
      loginUser({ userId: trimmedId, token: fakeToken, nickname: 'Anonymous', role: 'user' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── ID REVEAL SCREEN ──────────────────────────────────────────────────────
  if (revealedId) {
    return (
      <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 460, padding: '0 24px' }} className="animate-fade-up">

          {/* Confetti-style top badge */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 28,
              background: 'linear-gradient(135deg, var(--purple-primary), var(--pink-primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 16px 48px rgba(199,182,240,0.4)',
              fontSize: 36
            }}>🎉</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>
              Your Safe Space Is Ready
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              We've created a private ID just for you.<br />
              <strong style={{ color: 'var(--text-primary)' }}>Save it — it's the only way to return.</strong>
            </p>
          </div>

          <div className="glass" style={{ padding: 32, borderRadius: 28, boxShadow: '0 24px 64px rgba(57,45,37,0.15)' }}>

            {/* Warning banner */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 14, marginBottom: 28
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12, color: '#FCD34D', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                We don't store any personal info — this ID is the <em>only</em> key to your account. Screenshot or copy it now.
              </p>
            </div>

            {/* The ID itself */}
            <div style={{
              background: 'rgba(199,182,240,0.07)', border: '2px solid var(--purple-primary)',
              borderRadius: 20, padding: '28px 24px', textAlign: 'center', marginBottom: 20,
              position: 'relative'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                Your Anonymous ID
              </div>
              <div style={{
                fontFamily: 'monospace', fontSize: 40, fontWeight: 900,
                letterSpacing: 8, color: 'var(--purple-primary)',
                lineHeight: 1, marginBottom: 16
              }}>
                {revealedId}
              </div>
              <button
                id="copy-id-btn"
                onClick={handleCopyId}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(199,182,240,0.15)',
                  color: copied ? '#34D399' : 'var(--purple-primary)',
                  fontWeight: 700, fontSize: 13, transition: 'all 0.25s'
                }}
              >
                {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
            </div>

            {/* Tips */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              {[
                { icon: '📸', label: 'Screenshot it' },
                { icon: '📝', label: 'Write it down' },
                { icon: '📋', label: 'Paste in notes' },
              ].map((t, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center', padding: '10px 8px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{t.label}</div>
                </div>
              ))}
            </div>

            <button
              id="proceed-to-dashboard-btn"
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 16, fontWeight: 800 }}
              onClick={handleProceed}
            >
              <Sparkles size={18} /> I've Saved It — Enter My Space
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN LOGIN SCREEN ─────────────────────────────────────────────────────
  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '0 24px' }} className="animate-fade-up">

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: 'linear-gradient(135deg, var(--purple-primary), var(--pink-primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 12px 36px rgba(199,182,240,0.35)'
          }}>
            <Heart size={32} color="#fff" fill="#fff" />
          </div>

          {/* Privacy Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 999, marginBottom: 20
          }}>
            <Lock size={13} color="#34D399" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', letterSpacing: '0.3px' }}>
              100% Anonymous — No Email Required
            </span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>
            Your Private Space
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Enter without sharing your name,<br />email, or any personal details.
          </p>
        </div>

        {/* Tab Switch */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 28,
          padding: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 18
        }}>
          {[
            { id: 'new', label: '✨ First Time' },
            { id: 'returning', label: '🔑 I Have an ID' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              style={{
                flex: 1, padding: '11px 16px', border: 'none', borderRadius: 13, cursor: 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.25s',
                background: tab === t.id
                  ? 'linear-gradient(135deg, var(--purple-primary), var(--pink-primary))'
                  : 'transparent',
                color: tab === t.id ? '#2f2a28' : 'var(--text-muted)',
                boxShadow: tab === t.id ? '0 8px 20px rgba(199,182,240,0.45)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: 32, borderRadius: 28, boxShadow: '0 20px 60px rgba(57,45,37,0.12)' }}>

          {tab === 'new' ? (
            <div>
              {/* How it works hint */}
              <div style={{
                display: 'flex', gap: 16, marginBottom: 28, padding: '16px 20px',
                background: 'rgba(199,182,240,0.08)', borderRadius: 16, border: '1px solid rgba(199,182,240,0.15)'
              }}>
                {[
                  { icon: '🎲', text: 'We generate a unique ID' },
                  { icon: '🔒', text: 'No data collected' },
                  { icon: '📋', text: 'Save ID to return' },
                ].map((item, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.text}</div>
                  </div>
                ))}
              </div>

              {/* Age input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Your Age *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNewUser()}
                  className="input"
                  min={10} max={100}
                  style={{
                    height: 56, fontSize: 20, fontWeight: 700, textAlign: 'center',
                    background: 'rgba(255,255,255,0.06)', border: '1.5px solid var(--border)',
                    letterSpacing: 2
                  }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                  Only used to personalise your experience
                </p>
              </div>

              {error && (
                <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ color: '#F87171', fontSize: 13, fontWeight: 600 }}>{error}</p>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 16, fontWeight: 800 }}
                onClick={handleNewUser}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" />
                  : <><Sparkles size={18} /> Enter My Safe Space</>
                }
              </button>
            </div>

          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(199,182,240,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <KeyRound size={24} color="var(--purple-primary)" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Welcome Back</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Enter the unique ID generated<br />during your first visit.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <input
                  type="text"
                  placeholder="MBXXXXX"
                  value={userId}
                  onChange={e => setUserId(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleReturningUser()}
                  className="input"
                  style={{
                    fontFamily: 'monospace', fontSize: 26, letterSpacing: 6, textAlign: 'center',
                    padding: '20px', height: 72,
                    background: 'rgba(199,182,240,0.06)',
                    border: '2px dashed var(--purple-primary)',
                    color: 'var(--purple-primary)', fontWeight: 800
                  }}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
                  <p style={{ color: '#F87171', fontSize: 13, fontWeight: 600 }}>{error}</p>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 16, fontWeight: 800 }}
                onClick={handleReturningUser}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" />
                  : <><ArrowRight size={18} /> Continue My Journey</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}
            onClick={() => navigate('/volunteer-login')}
          >
            Volunteer Login
          </button>
        </div>
      </div>
    </div>
  );
}
