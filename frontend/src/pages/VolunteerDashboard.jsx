import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, Activity, ShieldCheck, Eye, ChevronRight, AlertTriangle } from 'lucide-react';

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const volunteerName = localStorage.getItem('name') || 'Volunteer';

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/volunteers/live-users', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60, position: 'relative' }}>


      <div className="page-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h1 style={{ fontSize: 32, margin: 0 }}>Volunteer Portal</h1>
           <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: 13 }}>Authenticated access: {volunteerName} (@youngistaan.org)</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <div className="badge success" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={14} /> SESSION_AUTH: SECURE
           </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
           <Users size={20} color="var(--palette-purple)" /> Priority Active Users
        </h3>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>USER ID</th>
              <th>MOOD TREND</th>
              <th>RISK LEVEL</th>
              <th>LAST ACTIVITY</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{textAlign:'center', padding:20}}>Loading active users...</td></tr> : 
             entries.length === 0 ? <tr><td colSpan="5" style={{textAlign:'center', padding:20}}>No active priority users tracked today.</td></tr> :
             entries.map((u, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: 'var(--palette-purple)' }}>{u.name} (<span style={{opacity:0.6}}>{u.id.substring(u.id.length - 4)}</span>)</td>
                <td style={{ fontSize: 18 }}>{u.mood}</td>
                <td><span className={`badge ${u.color}`}>{u.risk}</span></td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{u.time}</td>
                <td>
                   <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/dashboard/volunteer/user/${u.id}`)}>
                      <Eye size={14} style={{ marginRight: 6 }} /> View Detail
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 24, fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center' }}>
           <ShieldCheck size={10} style={{ marginRight: 4 }} /> All identifiers are masked until professional protocol is triggered.
        </div>
      </div>

      <div className="volunteer-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 40 }}>
         <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>{entries.length}</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Active Tracked Users</p>
         </div>
         <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>{entries.filter(e => e.color === 'critical').length}</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Priority Follow-ups</p>
         </div>
         <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0 }}>{entries.length ? (entries.reduce((a,b)=>a+b.latestScore, 0)/entries.length).toFixed(1) : 'N/A'}</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)' }}>Safety Metric Avg</p>
         </div>
      </div>
    </div>
  );
}
