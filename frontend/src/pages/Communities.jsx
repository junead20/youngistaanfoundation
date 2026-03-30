import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, Heart, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/communities')
      .then(res => res.json())
      .then(data => {
        setCommunities(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60, position: 'relative' }}>


      <div className="page-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h1 style={{ fontSize: 32, margin: 0 }}>Safe Circles 🛡️</h1>
           <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: 13 }}>Find your tribe. Connect with others in a safe, moderated space.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => {
           setToast('Volunteer approval required to start new circles. Request sent!');
           setTimeout(() => setToast(''), 3000);
        }}>
           <Plus size={16} /> Create Circle
        </button>
      </div>

      <AnimatePresence>
         {toast && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               style={{ position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', background: 'var(--success)', color: '#000', padding: '12px 24px', borderRadius: 24, fontWeight: 700, zIndex: 1000, boxShadow: 'var(--shadow-md)' }}
            >
               {toast}
            </motion.div>
         )}
      </AnimatePresence>

      <div className="search-bar-v2" style={{ marginBottom: 40, position: 'relative' }}>
         <Search size={20} className="search-icon" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
         <input 
            className="form-input" 
            placeholder="Search for interests, art, coders, or just a vibe..." 
            style={{ paddingLeft: 48, borderRadius: 20 }}
         />
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 300 }}><div className="loading-spinner-sm" /></div>
      ) : (
        <div className="volunteer-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
           {communities.map((c, i) => (
             <motion.div 
                key={i}
                className="card" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                   <div style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 12, fontSize: 24 }}>{c.name.split(' ').pop()}</div>
                   <div className="badge success" style={{ textTransform: 'uppercase', fontSize: 10 }}>Moderated</div>
                </div>
                <h3 style={{ margin: '0 0 8px' }}>{c.name.split(' ').slice(0, -1).join(' ')}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.5, marginBottom: 20 }}>{c.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      <Users size={14} /> {c.member_count + (joined[i] ? 1 : 0)} Members
                   </div>
                   <button 
                      className={`btn btn-sm ${joined[i] ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ padding: '6px 12px', ...(joined[i] ? { background: 'var(--success)', color: '#000' } : {}) }}
                      onClick={() => setJoined(prev => ({ ...prev, [i]: !prev[i] }))}
                   >
                      {joined[i] ? 'Joined' : 'Join'} <ArrowRight size={14} style={{ marginLeft: 6 }} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 40, background: 'var(--bg-glass)', border: '1px dashed var(--border)', textAlign: 'center', padding: 40 }}>
         <ShieldCheck size={32} color="var(--palette-purple)" style={{ marginBottom: 16 }} />
         <h3>Community Safety First</h3>
         <p style={{ maxWidth: 800, margin: '12px auto 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            All communities are private and overseen by Youngistaan's 14,000+ volunteer network. 
            We ensure every space remains supportive, respectful, and safe for everyone.
         </p>
      </div>
    </div>
  );
}
