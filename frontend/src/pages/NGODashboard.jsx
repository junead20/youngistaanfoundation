import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Building2, Users, PieChart, TrendingUp,
  Globe, MessageSquare, ShieldCheck
} from 'lucide-react';

export default function NGODashboard() {
  const { user } = useApp();
  const [stats, setStats] = useState({
    callsHandled: 421,
    activePatients: 12,
    impactScore: 8.9,
    volunteers: 5
  });

  const [recentInteractions, setRecentInteractions] = useState([
    { id: 1, user: 'MBX4821', type: 'Crisis Call', status: 'Resolved', time: '1h ago' },
    { id: 2, user: 'MBX2193', type: 'Counseling', status: 'Ongoing', time: '3h ago' },
    { id: 3, user: 'MBX9056', type: 'Chat Support', status: 'Pending', time: '5h ago' },
  ]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title">
            <Building2 size={22} style={{ display: 'inline', marginRight: 10, color: '#06B6D4' }} />
            NGO Administrative Dashboard
          </h1>
          <p className="section-subtitle">Track community impact and manage mental health support resources.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Calls Handled', value: stats.callsHandled, color: '#A78BFA', icon: Globe },
            { label: 'Active Support', value: stats.activePatients, color: '#F59E0B', icon: Users },
            { label: 'Impact Score', value: stats.impactScore, color: '#10B981', icon: ShieldCheck },
            { label: 'Volunteers', value: stats.volunteers, color: '#67E8F9', icon: PieChart },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</span>
                <s.icon size={16} color={s.color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Interaction Log */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <TrendingUp size={18} color="#A78BFA" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Interactions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentInteractions.map(item => (
                <div key={item.id} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.user}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: 11, 
                      padding: '2px 8px', 
                      borderRadius: 99, 
                      background: item.status === 'Resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: item.status === 'Resolved' ? '#10B981' : '#F59E0B',
                      border: `1px solid ${item.status === 'Resolved' ? '#10B981' : '#F59E0B'}30`,
                      marginBottom: 4
                    }}>
                      {item.status}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Status */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Users size={18} color="#06B6D4" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Active Volunteers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Priya S.', 'Rahul M.', 'Ananya K.'].map((name, i) => (
                <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{name[0]}</div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>● Online</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mood Trends & Engagement Calendar */}
        <div className="glass" style={{ marginTop: 24, padding: 32, borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
             <TrendingUp size={24} color="#06B6D4" />
             <div>
               <h3 style={{ fontSize: 18, fontWeight: 800 }}>Community Mood Trends & Engagement</h3>
               <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Anonymized aggregate data of daily check-ins and AI interactions</p>
             </div>
          </div>
          
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* 30-day mini heatmap */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>{d}</div>)}
                {Array.from({ length: 30 }).map((_, i) => {
                  const stress = Math.floor(Math.random() * 10) + 1;
                  const noData = Math.random() > 0.8;
                  const color = noData ? 'rgba(255,255,255,0.03)' : stress >= 7 ? 'rgba(239,68,68,0.4)' : stress >= 4 ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)';
                  return (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: color, border: '1px solid rgba(255,255,255,0.05)' }} title={noData ? 'No data' : `Avg Stress: ${stress}/10`} />
                  );
                })}
              </div>
            </div>

            {/* Top Insights */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>AI Insights (Last 30 Days)</h4>
              
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={16} color="#EF4444" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FCA5A5' }}>High Stress Alert</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>14% increase in 'exam-related' anxiety reported in the last week. Consider scheduling a group stress-relief session.</p>
              </div>

              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <MessageSquare size={16} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6EE7B7' }}>Persona Preference</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>62% of users in distress prefer the <strong>Caring Parent</strong> persona for initial stabilization, followed by <strong>Supportive Friend</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
