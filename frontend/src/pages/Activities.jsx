import { useState, useEffect } from 'react';
import { Sparkles, Activity as ActivityIcon, Heart, Shield, Clock } from 'lucide-react';
import { getActivities } from '../services/api';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivities();
        setActivities(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'All' ? activities : activities.filter(a => a.type === filter);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>✨ Time for Yourself</h1>
        <p>Small things to try right now for some quiet time or stress relief.</p>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>
          All Activities
        </button>
        <button className={`tab ${filter === 'Self-Time' ? 'active' : ''}`} onClick={() => setFilter('Self-Time')}>
          👤 Solo Play
        </button>
        <button className={`tab ${filter === 'Interactive' ? 'active' : ''}`} onClick={() => setFilter('Interactive')}>
          🤝 With Friends
        </button>
      </div>

      <div className="volunteer-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filtered.map((act, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div className={`insight-icon ${act.category === 'Mindful' ? 'info' : act.category === 'Creative' ? 'purple' : act.category === 'Physical' ? 'warning' : 'success'}`} style={{ width: 48, height: 48, fontSize: 24, borderRadius: 12 }}>
                {act.category === 'Mindful' ? '🧘' : act.category === 'Creative' ? '🎨' : act.category === 'Physical' ? '🏃' : '💬'}
              </div>
              <span className="badge" style={{ background: 'var(--bg-highlight)' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-top' }}/>
                {act.duration}
              </span>
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{act.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, flex: 1, marginBottom: 20 }}>{act.description}</p>
            
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <span className={`badge ${act.type.toLowerCase().includes('interactive') ? 'orange' : 'teal'}`}>{act.type}</span>
              <span className="badge">{act.category}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No activities found. Try seeding the database!</p>
          </div>
        )}
      </div>
    </div>
  );
}
