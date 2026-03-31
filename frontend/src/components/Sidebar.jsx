import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Brain, MessageCircle, Heart, Users, Building2,
  Globe, LayoutDashboard, LogOut, Zap, Star, Activity, Wind,
  Shield, Copy, CheckCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', role: 'user' },
  { path: '/volunteer-dashboard', icon: Shield, label: 'Volunteer Panel', role: 'volunteer' },
  { path: '/community', icon: Globe, label: 'Community' },
  { path: '/chat', icon: MessageCircle, label: 'AI Chat', isPublic: true },
  { path: '/stress-relief', icon: Wind, label: 'Stress Relief', isPublic: true },
  { path: '/mood', icon: Heart, label: 'Mood Tracker', isPublic: true },
  { path: '/mentor-chat', icon: Users, label: 'Talk to Mentor', role: 'user' },
  { path: '/ngo', icon: Building2, label: 'NGO Directory' },
];

export default function Sidebar() {
  const { user, volunteer, logout } = useApp();
  const navigate = useNavigate();
  const [idCopied, setIdCopied] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.userId || '').catch(() => {});
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  const navItems = NAV_ITEMS.filter(item => {
    if (item.isPublic) return true;
    if (volunteer && item.role === 'volunteer') return true;
    if (user && item.role === 'user') return true;
    if (!item.role && (user || volunteer)) return true;
    return false;
  });

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--purple-primary), var(--teal-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Plus Jakarta Sans' }} className="gradient-text">Manobandhu</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 42 }}>Empathetic AI Support</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {navItems.map((item) => (
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
              {volunteer ? (volunteer.name?.[0] || 'V') : (user?.nickname?.[0] || 'U')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {volunteer ? volunteer.name : (user?.nickname || 'Anonymous')}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {volunteer ? 'Volunteer' : user?.userId}
              </div>
            </div>
          </div>

          {/* Copy ID button — only for anonymous users */}
          {user && !volunteer && (
            <button
              id="sidebar-copy-id-btn"
              onClick={handleCopyId}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
                background: idCopied ? 'rgba(52,211,153,0.08)' : 'rgba(199,182,240,0.06)',
                color: idCopied ? '#34D399' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                marginBottom: 8
              }}
            >
              {idCopied ? <CheckCheck size={12} /> : <Copy size={12} />}
              {idCopied ? 'ID Copied!' : `Copy My ID`}
            </button>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#FCD34D' }}>
              <Zap size={12} fill="#FCD34D" />
              <span>{user?.streakDays || 0} Day Streak</span>
            </div>
          )}
        </div>

        {(user || volunteer) && (
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'flex-start', gap: 10, color: '#FCA5A5' }}>
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}

