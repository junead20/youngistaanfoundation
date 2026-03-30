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
            <Building2 size={22} style={{ display: 'inline', marginRight: 10, color: '#7ABCD4' }} />
            NGO Administrative Dashboard
          </h1>
          <p className="section-subtitle">Track community impact and manage mental health support resources.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Calls Handled', value: stats.callsHandled, color: '#9B8FD8', icon: Globe },
            { label: 'Active Support', value: stats.activePatients, color: '#C4A43D', icon: Users },
            { label: 'Impact Score', value: stats.impactScore, color: '#5cb89c', icon: ShieldCheck },
            { label: 'Volunteers', value: stats.volunteers, color: '#7ABCD4', icon: PieChart },
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
              <TrendingUp size={18} color="#9B8FD8" />
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
                      background: item.status === 'Resolved' ? 'rgba(168,230,207,0.2)' : 'rgba(255,229,160,0.2)',
                      color: item.status === 'Resolved' ? '#3B8B6E' : '#9B7A1E',
                      border: `1px solid ${item.status === 'Resolved' ? '#a8e6cf' : '#ffe5a0'}30`,
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
              <Users size={18} color="#7ABCD4" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Active Volunteers</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Priya S.', 'Rahul M.', 'Ananya K.'].map((name, i) => (
                <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #d1f2ff, #dadaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{name[0]}</div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#5cb89c', fontWeight: 500 }}>● Online</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Map Stub */}
        <div className="glass" style={{ marginTop: 24, padding: 32, textAlign: 'center', height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Globe size={48} color="var(--purple-light)" style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>Regional Impact Analysis</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Data visualization module loading...</p>
        </div>
      </main>
    </div>
  );
}
