import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  MessageCircle, Users, Heart,
  TrendingUp, Zap, Sparkles,
  ArrowRight, BookOpen, Wind, Activity,
  PlayCircle, Headphones, AlertTriangle, CheckCircle,
  Sun, Cloud, CloudRain, Star
} from 'lucide-react';

function DailyCheckIn() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitted'
  const [selected, setSelected] = useState(null);
  const [streakData, setStreakData] = useState([]);

  const OPTIONS = [
    { label: 'Amazing', emoji: '✨', color: '#10B981', icon: Star },
    { label: 'Good', emoji: '😊', color: '#67E8F9', icon: Sun },
    { label: 'Okay', emoji: '😐', color: '#F59E0B', icon: Cloud },
    { label: 'Tough', emoji: '😔', color: '#EF4444', icon: CloudRain },
  ];

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('mb_streak_data')) || [];
    setStreakData(data);
    const today = new Date().toISOString().split('T')[0];
    if (data.includes(today)) {
      setStatus('submitted');
      setSelected(OPTIONS[0]);
    }
  }, []);

  const handleCheckIn = (opt) => {
    setSelected(opt);
    setStatus('submitted');
    
    // Save to local storage for "Snap Streak" feature
    const today = new Date().toISOString().split('T')[0];
    const newData = [...new Set([...streakData, today])];
    setStreakData(newData);
    localStorage.setItem('mb_streak_data', JSON.stringify(newData));
  };

  // Compute Current Streak
  let streakCount = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayData = new Date();
  yesterdayData.setDate(yesterdayData.getDate() - 1);
  const yesterdayStr = yesterdayData.toISOString().split('T')[0];
  
  // Quick continuous streak calculation backwards from today/yesterday
  let checkDate = new Date();
  if (!streakData.includes(todayStr) && !streakData.includes(yesterdayStr)) {
     streakCount = 0;
  } else {
     if (!streakData.includes(todayStr)) checkDate.setDate(checkDate.getDate() - 1); // Start counting from yesterday
     
     while (streakData.includes(checkDate.toISOString().split('T')[0])) {
       streakCount++;
       checkDate.setDate(checkDate.getDate() - 1);
       if (streakCount > 365) break; // safety
     }
  }

  // Generate full month calendar grid
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  // Padding for the start of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      date: i,
      completed: streakData.includes(dStr),
      isToday: dStr === todayStr
    });
  }

  return (
    <div className="glass animate-fade-up" style={{ padding: 24, borderRadius: 20, marginBottom: 28, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: status === 'submitted' ? 0 : 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="var(--purple-light)" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Daily Check-in</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>How was your day so far?</p>
          </div>
        </div>

        {/* Snap Streak Counter! */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: streakCount > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${streakCount > 0 ? 'rgba(245,158,11,0.3)' : 'var(--border)'}` }}>
          <span style={{ fontSize: 16 }}>{streakCount > 0 ? '🔥' : '🧊'}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: streakCount > 0 ? '#F59E0B' : 'var(--text-muted)' }}>
            {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.label}
              className="glass hover-glow"
              onClick={() => handleCheckIn(opt)}
              style={{ flex: 1, minWidth: 100, padding: '16px 12px', border: '1px solid var(--border)', borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' }}
            >
              <opt.icon size={28} color={opt.color} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{opt.label}</div>
            </button>
          ))}
        </div>
      )}

      {status === 'submitted' && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>You checked in today! ✅</h4>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Come back tomorrow to keep your streak alive.</p>
        </div>
      )}

      {/* Full Month Calendar Grid */}
      <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              {day}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px' }}>
          {calendarDays.map((day, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              {day ? (
                <div style={{ 
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: day.completed ? 'rgba(245,158,11,0.2)' : (day.isToday ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)'),
                  border: `2px solid ${day.completed ? '#F59E0B' : (day.isToday ? 'var(--text-primary)' : 'transparent')}`,
                  color: day.completed ? '#FCD34D' : (day.isToday ? 'var(--text-primary)' : 'var(--text-muted)'),
                  fontWeight: day.isToday ? 900 : 700, fontSize: 13, transition: 'all 0.3s',
                  boxShadow: day.completed ? '0 0 10px rgba(245,158,11,0.3)' : 'none'
                }}>
                  {day.completed ? '🔥' : day.date}
                </div>
              ) : (
                <div style={{ width: 32, height: 32 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, moodData, stressLevel } = useApp();
  const [recentMood, setRecentMood] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const level = stressLevel || (moodData?.stressLevel <= 3 ? 'Low' : moodData?.stressLevel <= 6 ? 'Medium' : 'High') || 'Low';

  useEffect(() => {
    if (user?.token) {
      axios.get('/api/mood', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => setRecentMood(r.data.entries?.[0]))
        .catch(() => {});
    }
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const COMMUNITY_HIGHLIGHTS = [
    { id: 1, title: 'Music Group', members: 124, lastMsg: 'I love this song!', icon: Headphones, color: '#A78BFA' },
    { id: 2, title: 'Gaming Hub', members: 89, lastMsg: 'Anyone up for a match?', icon: PlayCircle, color: '#06B6D4' },
  ];

  const RECOMMENDED_ACTIVITIES = [
    { title: 'Box Breathing', desc: '4-4-4-4 to center yourself', icon: Wind, color: '#10B981', path: '/stress-relief' },
    { title: 'Gratitude Journal', desc: 'Write 3 things you love', icon: BookOpen, color: '#EC4899', path: '/mood' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        
        {/* Welcome Back Card */}
        <div className="glass animate-fade-up" style={{ padding: 32, marginBottom: 28, borderRadius: 20, background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
                {greeting()}, <span className="gradient-text">{user?.nickname || user?.userId} 👋</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 24 }}>
                It's great to have you back in your safe space.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['😊', '😐', '😔', '😣', '✨'].map(emoji => (
                  <button key={emoji} onClick={() => setSelectedEmoji(emoji)} style={{ fontSize: 24, padding: '12px 16px', borderRadius: 12, background: selectedEmoji === emoji ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${selectedEmoji === emoji ? 'rgba(255,255,255,0.2)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.2s' }}>{emoji}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}>
               <Heart size={32} color="var(--purple-light)" fill="var(--purple-light)" />
            </div>
          </div>
        </div>

        {/* Daily Check-in */}
        <DailyCheckIn />

        {/* AI Recommendation Banner */}
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 28 }} className="animate-fade-up delay-100">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Zap size={16} color="#A78BFA" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Recommendation</span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
             ✨ Connect with the community or explore tools like **Box Breathing** to keep your peace.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          {/* Community Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Trending Groups</h3>
            {COMMUNITY_HIGHLIGHTS.map(group => (
              <div key={group.id} className="glass" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => navigate('/community')}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${group.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <group.icon size={20} color={group.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{group.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{group.members} online</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>

          {/* Recommended Activities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Restorative Tools</h3>
            {RECOMMENDED_ACTIVITIES.map((act, i) => (
              <div key={i} className="glass" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(act.path)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <act.icon size={18} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{act.desc}</div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
