import { useState, useEffect } from 'react';
import { Users, Hash, Plus, ChevronRight } from 'lucide-react';
import { getCommunities } from '../services/api';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCommunities();
        setCommunities(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🌐 Communities</h1>
          <p>Find people who share your interests and vibe.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '8px 16px' }}>
          <Plus size={16} /> Create Group
        </button>
      </div>

      <div className="volunteer-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {communities.map((comm, i) => (
          <div key={i} className="card" style={{ display: 'flex', padding: 20 }}>
            <div style={{ marginRight: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--bg-highlight), var(--bg-tertiary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {comm.name.split(' ').pop()}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                {comm.name.replace(/ \p{Emoji}/u, '')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Users size={14} style={{ opacity: 0.7 }} /> {comm.member_count} members
              </p>
              
              <p style={{ color: 'var(--text-tertiary)', fontSize: 14, lineHeight: 1.4, marginBottom: 16, minHeight: 40 }}>
                {comm.description}
              </p>
              
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {comm.tags.map(tag => (
                  <span key={tag} className="badge" style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)' }}>
                    <Hash size={10} style={{ display: 'inline', marginRight: 2 }} />
                    {tag}
                  </span>
                ))}
              </div>
              
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'space-between' }}>
                Join Community <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
        {communities.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No communities found. Try seeding the database!</p>
          </div>
        )}
      </div>
    </div>
  );
}
