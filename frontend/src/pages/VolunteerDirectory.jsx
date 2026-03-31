import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { Users, Mail, MessageCircle, Shield, Briefcase, Globe, ArrowRight } from 'lucide-react';

export default function VolunteerDirectory() {
  const { volunteer } = useApp();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!volunteer?.token) return;

    axios.get('/api/volunteer/directory', { 
      headers: { Authorization: `Bearer ${volunteer.token}` } 
    })
    .then(res => {
      // Limit to 4 volunteers for now as requested
      setVolunteers(res.data.directory.slice(0, 4));
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [volunteer]);

  const handleConnect = (v) => {
    const subject = encodeURIComponent("Manobhandhu AI: Connection Request from Fellow Mentor");
    const body = encodeURIComponent(`Hi ${v.name},\n\nI'm ${volunteer?.name}, a fellow mentor on the Manobhandhu AI platform. I saw your profile in the directory and would love to connect and share insights on our mentoring experiences!\n\nBest regards,\n${volunteer?.name}`);
    window.location.href = `mailto:${v.email}?subject=${subject}&body=${body}`;
  };

  if (loading) return <div className="page"><span className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-fade-up">
          <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Users size={20} color="var(--teal-primary)" />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal-primary)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Inner Circle</span>
              </div>
              <h1 className="section-title" style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>Co-Volunteer Directory</h1>
              <p className="section-subtitle" style={{ margin: 0, color: 'var(--text-muted)' }}>Collaborate with the elite network of psychological mentors.</p>
            </div>
            
            <div className="glass" style={{ padding: '12px 24px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)' }}>
               <Shield size={18} color="var(--purple-primary)" />
               <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Verified Network</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {volunteers.map(v => (
              <div key={v._id} className="glass hover-lift" style={{ padding: 32, borderRadius: 32, position: 'relative', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, background: 'radial-gradient(circle, rgba(103, 232, 249, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, var(--teal-primary), var(--purple-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, color: 'white', boxShadow: '0 8px 16px rgba(103, 232, 249, 0.2)' }}>
                      {v.name?.[0] || 'V'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{v.name || 'Anonymous Mentor'}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.isAvailable ? '#10B981' : '#EF4444', boxShadow: `0 0 8px ${v.isAvailable ? '#10B981' : '#EF4444'}` }} />
                        <span style={{ color: v.isAvailable ? '#10B981' : '#EF4444' }}>{v.isAvailable ? 'Active Now' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    <Mail size={16} color="var(--teal-primary)" /> {v.email || 'Private Email'}
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Briefcase size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)' }}>Specialization</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(v.expertise && v.expertise.length > 0 ? v.expertise : ['General Support']).map(exp => (
                        <span key={exp} style={{ background: 'rgba(103, 232, 249, 0.08)', border: '1px solid rgba(103, 232, 249, 0.2)', padding: '6px 12px', borderRadius: 10, fontSize: 12, color: 'var(--teal-primary)', fontWeight: 700 }}>
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConnect(v)}
                    className="btn btn-primary" 
                    style={{ 
                      width: '100%', height: 56, borderRadius: 16, background: 'var(--teal-primary)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 800,
                      boxShadow: '0 8px 20px rgba(103, 232, 249, 0.2)'
                    }}
                  >
                    <MessageCircle size={20} />
                    Connect & Collaborate
                  </button>
                </div>
              </div>
            ))}
            
            {volunteers.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 80, textAlign: 'center', className: 'glass', borderRadius: 32 }}>
                <Globe size={48} color="var(--border)" style={{ marginBottom: 24 }} />
                <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Network Syncing...</h3>
                <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>We're currently updating the global mentor directory. Please check back shortly.</p>
              </div>
            )}
          </div>
          
          {volunteers.length > 0 && (
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <button disabled className="btn btn-outline" style={{ opacity: 0.5, cursor: 'not-allowed', gap: 8 }}>
                View Full Network (Restricted) <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
