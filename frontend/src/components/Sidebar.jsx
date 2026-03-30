import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Brain, MessageCircle, Heart, Users, Building2,
  Globe, LayoutDashboard, LogOut, Zap, Star, Activity, Wind
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/community', icon: Globe, label: 'Community' },
  { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { path: '/stress-relief', icon: Wind, label: 'Stress Relief' },
  { path: '/mood', icon: Heart, label: 'Mood Tracker' },
  { path: '/mentor-chat', icon: Users, label: 'Talk to Mentor' },
  { path: '/ngo', icon: Building2, label: 'NGO Directory' },
];

export default function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--purple-primary), var(--teal-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }} className="gradient-text">Reachus</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 42 }}>Empathetic AI Support</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <div className="glass" style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {user?.nickname?.[0] || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.nickname || 'Anonymous'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user?.userId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#C4A43D' }}>
            <Zap size={12} fill="#C4A43D" />
            <span>5 Day Streak</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', gap: 10, color: '#B85C5C' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
