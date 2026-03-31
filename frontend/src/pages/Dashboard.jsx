import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  MessageCircle, Users, Heart, TrendingUp, Zap, Sparkles,
  ArrowRight, BookOpen, Wind, Activity, CheckCircle,
  ChevronLeft, ChevronRight, Star, Clock, Copy, CheckCheck, X, Shield
} from 'lucide-react';

function EmojiStreakCalendar({ moodHistory }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // MOOD MAPPING
    const getEmoji = (dayNum) => {
      const entry = moodHistory.find(h => {
        const d = new Date(h.timestamp);
        return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year;
      });
      if (!entry) return null;
      const moodEmojis = { 'Happy': '😊', 'Neutral': '😐', 'Sad': '😔', 'Stressed': '😣' };
      return moodEmojis[entry.emotion] || '✨';
    };

    // Fill blanks
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} style={{ width: '100%', aspectRatio: '1/1' }} />);
    }

    // Fill days
    for (let i = 1; i <= totalDays; i++) {
      const emoji = getEmoji(i);
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
      days.push(
        <div key={i} style={{ 
          width: '100%', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', position: 'relative',
          borderRadius: 12, background: isToday ? 'rgba(156, 198, 179, 0.15)' : 'rgba(255,255,255,0.03)',
          border: isToday ? '1px solid var(--teal-primary)' : '1px solid transparent'
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', position: 'absolute', top: 4, left: 6 }}>{i}</span>
          {emoji ? <span style={{ fontSize: 24 }} className="animate-bounce-in">{emoji}</span> : null}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="glass animate-fade-up" style={{ padding: 24, borderRadius: 24, background: 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Mood Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronLeft size={18} /></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>{d}</div>)}
        {renderDays()}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loginUser } = useApp();
  const [profile, setProfile] = useState(null);
  const [aiTip, setAiTip] = useState("Generating your daily tip...");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idCopied, setIdCopied] = useState(false);
  const [idBannerDismissed, setIdBannerDismissed] = useState(
    () => sessionStorage.getItem('mbx_id_banner_dismissed') === 'true'
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.userId || '').catch(() => {});
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2500);
  };

  const dismissBanner = () => {
    sessionStorage.setItem('mbx_id_banner_dismissed', 'true');
    setIdBannerDismissed(true);
  };

  useEffect(() => {
    if (user?.token) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [pRes, hRes, rRes] = await Promise.all([
        axios.get('/api/auth/me', config),
        axios.get('/api/mood', config),
        axios.get('/api/recommendation', config)
      ]);
      setProfile(pRes.data);
      setHistory(hRes.data.entries || []);
      setAiTip(rRes.data.tip);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (mood) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/mood', { emotion: mood, stressLevel: mood === 'Happy' ? 2 : mood === 'Neutral' ? 4 : 8 }, config);
      fetchDashboardData(); // Refresh calendar & streak
    } catch (err) { console.error('Mood save error:', err); }
  };

  const OPTIONS = [
    { label: 'Happy', emoji: '😊', color: '#10B981', icon: Star },
    { label: 'Neutral', emoji: '😐', color: '#67E8F9', icon: Clock },
    { label: 'Sad', emoji: '😔', color: '#F59E0B', icon: Heart },
    { label: 'Stressed', emoji: '😣', color: '#EF4444', icon: Activity },
  ];

  if (loading && !profile) return <div className="page"><span className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── SAVE YOUR ID BANNER ────────────────────────────────── */}
          {user?.userId && !idBannerDismissed && (
            <div className="animate-fade-up" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 24px', marginBottom: 24, borderRadius: 20,
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.3)',
              position: 'relative'
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔐</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#FCD34D', letterSpacing: 0.5, marginBottom: 4 }}>
                  SAVE YOUR ANONYMOUS ID
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 22, fontWeight: 900,
                    letterSpacing: 4, color: 'var(--purple-primary)'
                  }}>
                    {user.userId}
                  </span>
                  <button
                    id="dashboard-copy-id-btn"
                    onClick={handleCopyId}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: idCopied ? 'rgba(52,211,153,0.15)' : 'rgba(199,182,240,0.12)',
                      color: idCopied ? '#34D399' : 'var(--purple-primary)',
                      fontWeight: 700, fontSize: 12, transition: 'all 0.25s'
                    }}
                  >
                    {idCopied ? <CheckCheck size={13} /> : <Copy size={13} />}
                    {idCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    This is the only way to return to your account.
                  </span>
                </div>
              </div>
              <button
                id="dismiss-id-banner-btn"
                onClick={dismissBanner}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Welcome Header */}
          <div className="glass animate-fade-up" style={{ padding: '32px 40px', marginBottom: 28, borderRadius: 24, background: 'linear-gradient(135deg, rgba(199, 182, 240, 0.15), rgba(230, 184, 162, 0.15))', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 32, fontWeight: 900 }}>
                    Hey <span className="gradient-text">{profile?.nickname || 'Anonymous'}</span> 👋
                  </h1>
                  <div style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
                     {profile?.userId}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Zap size={14} color="var(--purple-primary)" /> Day Streak: <strong>{profile?.streakDays || 0}</strong>
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} color="var(--teal-primary)" /> Private Account
                  </p>
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
                 <Heart size={40} color="var(--purple-light)" fill="var(--purple-light)" className="animate-float" />
              </div>
            </div>
            {/* Subtle background decoration */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'var(--purple-glow)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5 }} />
          </div>

          {/* AI Tip Banner */}
          <div className="glass" style={{ padding: '20px 24px', borderRadius: 20, background: 'rgba(156, 198, 179, 0.05)', borderLeft: '4px solid var(--teal-primary)', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Zap size={16} color="var(--teal-primary)" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--teal-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>AI Recommendation</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {aiTip}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* Quick Check-in */}
              <div className="glass" style={{ padding: 24, borderRadius: 24 }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Quick Check-in</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>How are you feeling right now?</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {OPTIONS.map(opt => (
                    <button 
                      key={opt.label}
                      onClick={() => handleCheckIn(opt.label)}
                      className="glass"
                      style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 12px', 
                        border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', borderRadius: 20,
                        transition: 'all 0.2s', cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Restorative Tools */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Restorative Tools</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div onClick={() => navigate('/stress-relief')} className="glass" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(156, 198, 179, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wind size={20} color="var(--teal-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Box Breathing</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>4-4-4-4 to center yourself</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                  <div onClick={() => navigate('/mood')} className="glass" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(199, 182, 240, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color="var(--purple-primary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>Journal</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Log detailed reflections</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              </div>

            </div>

            <div>
              {/* Emoji Streak Calendar */}
              <EmojiStreakCalendar moodHistory={history} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
