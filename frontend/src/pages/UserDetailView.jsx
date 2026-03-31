import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, AlertTriangle, CheckCircle, Clock, ShieldCheck, UserCircle } from 'lucide-react';

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [resolved, setResolved] = useState(false);

  const [userData, setUserData] = useState(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/volunteers/user-chat/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setUserData(data.user);
        setChats(data.recentChats);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-center h-screen bg-vibrant">
        <div className="loading-spinner-sm" />
        <p style={{ marginTop: 20 }}>Decrypting user session data... 🛡️</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60, position: 'relative' }}>


      <div style={{ marginBottom: 32 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
           <ArrowLeft size={16} /> Back to Dashboard
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

      <div className="page-header" style={{ marginBottom: 40, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
         <div style={{ background: 'var(--bg-tertiary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-active)', fontSize: 24 }}>👤</div>
         <div>
            <h1 style={{ margin: 0 }}>User: {userData?.name} (<span style={{opacity:0.6}}>{id.substring(id.length - 4)}</span>)</h1>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
               {resolved ? (
                  <span className="badge success">STATUS: SAFELY RESOLVED</span>
               ) : (
                  <span className="badge critical">RISK: PRIORITY CONNECT</span>
               )}
               <span className="badge yellow">MOOD: {userData?.mood_history?.[userData.mood_history.length - 1]?.score || 'N/A'}/10</span>
               <span className="badge low">AGE: {userData?.age_group || '13-19'}</span>
            </div>
         </div>
         <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {!resolved && (
               <button className="btn btn-primary btn-sm" onClick={() => {
                  setToast('Secure connection protocol initiated. Awaiting user approval.');
                  setTimeout(() => setToast(''), 4000);
               }}>Connect Now</button>
            )}
            <button className={`btn btn-sm ${resolved ? 'btn-primary' : 'btn-secondary'}`} onClick={() => {
               setResolved(!resolved);
               setToast(!resolved ? 'User status marked as safely resolved.' : '');
               setTimeout(() => setToast(''), 4000);
            }} style={{ ...(resolved ? { background: 'var(--success)', color: '#000' } : {}) }}>
               {resolved ? 'Resolved' : 'Mark Resolved'}
            </button>
         </div>
      </div>

      <div className="volunteer-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
         
         {/* CHAT HISTORY */}
         <div className="card">
            <h3 className="card-title" style={{ marginBottom: 24 }}>
               <MessageSquare size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> AI Chat Session History
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {chats.length === 0 ? (
                 <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>No chat history found for this user.</div>
               ) : (
                 chats[0].conversation.map((msg, i) => (
                   <div key={i} className="observation-card" style={{ background: msg.is_milo ? 'var(--bg-glass)' : 'var(--bg-tertiary)', border: 'none', alignSelf: msg.is_milo ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                      <p style={{ fontSize: 13, margin: '8px 0 0' }}><b>{msg.is_milo ? 'Milo' : 'User'}:</b> "{msg.text}"</p>
                   </div>
                 ))
               )}
               <div style={{ textAlign: 'center', opacity: 0.3, fontSize: 11, fontStyle: 'italic', margin: '20px 0' }}>--- Session ID: {chats[0]?._id || 'N/A'} ---</div>
            </div>
            
            <div style={{ marginTop: 24, padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)' }}>
               <Clock size={10} style={{ marginRight: 4 }} /> Session started: 23m ago | Last activity: 2m ago
            </div>
         </div>

         {/* RISK INDICATORS & ACTION LOG */}
         <div className="card">
            <h3 className="card-title" style={{ marginBottom: 24 }}>
               <AlertTriangle size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Risk Analysis
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               <div className="card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: 16 }}>
                  <p style={{ fontSize: 12, margin: 0 }}>Latest Mood reported: <b>{userData?.mood_history?.[userData.mood_history.length - 1]?.score || 'N/A'}/10</b></p>
               </div>
               <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-active)', padding: 16 }}>
                  <p style={{ fontSize: 12, margin: 0 }}>Trigger Log: <b>{userData?.mood_history?.[userData.mood_history.length - 1]?.description || 'No triggers identified'}</b></p>
               </div>
               
               <div style={{ marginTop: 32 }}>
                  <h4 style={{ fontSize: 13, marginBottom: 16 }}>Internal Action Log</h4>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle size={12} color="var(--success)" /> 
                        <span>Milo suggested Breathing Exercise (2m ago)</span>
                     </div>
                     <div style={{ display: 'flex', gap: 8 }}>
                        <CheckCircle size={12} color="var(--success)" />
                        <span>Escalation Protocol Triggered (5m ago)</span>
                     </div>
                  </div>
               </div>
               
               <div style={{ marginTop: 40, background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                  <ShieldCheck size={24} color="var(--palette-purple)" style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Professional identity release is only permitted if user's safety is at high risk.</p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
