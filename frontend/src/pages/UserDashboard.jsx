import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, Star, Activity, Clock, Cookie, Wind, Users } from 'lucide-react';

const scoreToEmoji = (score) => {
  if (score <= 2) return '😢';
  if (score <= 4) return '😔';
  if (score <= 5) return '😐';
  if (score <= 6) return '🙂';
  if (score <= 7) return '😊';
  if (score <= 8) return '😄';
  if (score <= 9) return '🤩';
  return '💖';
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [moodHistory, setMoodHistory] = useState([]);
  const [randomActivities, setRandomActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('name') || 'Friend';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [moodRes, actRes] = await Promise.all([
          fetch('/api/mood/history', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/activities')
        ]);
        
        let moodData = await moodRes.json();
        const actData = await actRes.json();
        
        // Ensure moodData is an array
        if (!Array.isArray(moodData)) moodData = [];

        setMoodHistory(moodData.slice(-14)); // Show up to last 14 days
        
        // GET 3 RANDOM ACTIVITIES
        if (Array.isArray(actData)) {
          setRandomActivities(actData.sort(() => 0.5 - Math.random()).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60, position: 'relative' }}>

      <div className="page-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h1 style={{ fontSize: 32, margin: 0 }}>Hey, {userName} 🧸</h1>
           <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: 13 }}>Your journey matters. One small step at a time.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-sm" style={{ background: 'var(--palette-mint)', color: '#000', border: 'none', fontWeight: 600 }} onClick={() => navigate('/breathe')}>
              <Wind size={16} style={{ marginRight: 6 }} /> Breathe Zone
           </button>
           <button className="btn btn-secondary btn-sm" onClick={() => navigate('/milo')}>
              <MessageSquare size={16} style={{ marginRight: 6 }} /> Chat with Milo
           </button>
           <button className="btn btn-primary btn-sm" onClick={() => navigate('/activities')}>
              Explore Fun <Star size={16} style={{ marginLeft: 6 }} />
           </button>
        </div>
      </div>

      <div className="volunteer-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* MOOD TREND SECTION */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
             <Calendar size={18} color="var(--primary)" /> Mood Progress Calendar
          </h3>
          <div style={{ width: '100%', minHeight: 200 }}>
            {moodHistory.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 16 }}>
                 {moodHistory.map((h, i) => (
                    <motion.div 
                      key={i} 
                      className="calendar-day" 
                      style={{ textAlign: 'center' }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                       <div style={{ fontSize: 11, marginBottom: 8, color: 'var(--text-tertiary)' }}>
                         {new Date(h.timestamp).toLocaleDateString(undefined, { weekday: 'short' })}
                       </div>
                       <div 
                          title={h.description}
                          style={{ 
                            width: 56, height: 56, borderRadius: 16, margin: '0 auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            fontSize: 32,
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'help'
                          }}
                       >
                          {scoreToEmoji(h.score)}
                       </div>
                    </motion.div>
                 ))}
               </div>
            ) : (
               <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🧸</div>
                  <p>Not enough data yet. Complete your first mood check!</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/mood-check')}>
                     Start Check-In
                  </button>
               </div>
            )}
          </div>
          
          {moodHistory.length > 0 && (
            <div style={{ marginTop: 32, padding: '24px 0 0', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{moodHistory.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Entries Logged</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>Active</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Status</div>
              </div>
            </div>
          )}
        </div>

        {/* DAILY 3 ACTIVITIES */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
             <Activity size={18} color="var(--accent)" /> Your Daily 3
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {randomActivities.length > 0 ? randomActivities.map((act, i) => (
              <div key={i} className="observation-card" style={{ padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge small" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>{act.category}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}><Clock size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {act.duration}</span>
                 </div>
                 <h4 style={{ margin: '0 0 6px', fontSize: 14 }}>{act.title}</h4>
                 <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{act.description}</p>
                 <button className="btn btn-secondary btn-sm w-full" style={{ marginTop: 16, fontSize: 11, fontWeight: 600 }} onClick={() => navigate('/activities')}>
                    Try It <Activity size={12} style={{ marginLeft: 6 }} />
                 </button>
              </div>
            )) : (
               <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>No activities found.</div>
            )}
          </div>
        </div>
      </div>

      {/* PREDEFINED COMMUNITIES AND QUICK STATUS CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32 }}>
         <div className="card">
            <h3 className="card-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
               <Users size={18} color="var(--palette-purple)" /> Your Support Circles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div className="observation-card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate('/communities')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                     <h4 style={{ margin: 0 }}>Exam Stress Haven</h4>
                     <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>28 Online</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>A safe space to vent about school pressure.</p>
               </div>
               <div className="observation-card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate('/communities')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                     <h4 style={{ margin: 0 }}>Late Night Thinkers</h4>
                     <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>42 Online</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>For when you can't sleep and need comfort.</p>
               </div>
            </div>
         </div>

         <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--bg-secondary))', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
               <div style={{ fontSize: 48 }}>💡</div>
               <div>
                  <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>Did you know?</h3>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)' }}>
                     Taking just 10 minutes for yourself today can improve your focus by 30%. 
                     Pick an activity from your Daily 3 and give it a try.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
