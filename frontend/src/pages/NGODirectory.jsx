import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { 
  Building2, Phone, Globe, ExternalLink, 
  Search, Filter, ShieldCheck, MapPin,
  Clock, Heart
} from 'lucide-react';

const MOCK_NGOS = [
  { name: 'AASRA', description: 'Crisis intervention for people in emotional distress', phone: '9820466627', website: 'http://www.aasra.info', tags: ['Suicide Prevention', 'Crisis'], isHelpline: true, available24x7: true },
  { name: 'Vandrevala Foundation', description: 'Mental health support and counseling service', phone: '1860-2662-345', website: 'https://vandrevalafoundation.com', tags: ['Counseling', 'Crisis'], isHelpline: true, available24x7: true },
  { name: 'iCall (TISS)', description: 'Psychosocial helpline for people in distress', phone: '9152987821', website: 'https://icallhelpline.org', tags: ['Psychological', 'Counseling'], isHelpline: true, available24x7: false },
  { name: 'Fortis Helpline', description: 'National helpline for mental health', phone: '8376804102', website: 'https://fortishealthcare.com', tags: ['General'], isHelpline: true, available24x7: true },
  { name: 'Sangath', description: 'Community-based mental health services', phone: '011-41196200', website: 'https://sangath.in', tags: ['Community', 'Clinical'], isHelpline: false, available24x7: false },
];

export default function NGODirectory() {
  const [ngos, setNgos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/ngo')
      .then(res => setNgos(res.data.ngos || MOCK_NGOS))
      .catch(() => setNgos(MOCK_NGOS))
      .finally(() => setLoading(false));
  }, []);

  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Helpline' ? ngo.isHelpline : !ngo.isHelpline);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title"><Building2 size={22} style={{ display: 'inline', marginRight: 10, color: '#B85C5C' }} />Resources & Helplines</h1>
          <p className="section-subtitle">Verified organizations and 24/7 care for professional support.</p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }} className="animate-fade-up">
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, tags, or description..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input" 
              style={{ paddingLeft: 48, height: 48, borderRadius: 12 }} 
            />
          </div>
          <select 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input" 
            style={{ width: 140, height: 48, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer' }}
          >
            <option value="All">All types</option>
            <option value="Helpline">Helplines</option>
            <option value="Clinic">Clinical NGOs</option>
          </select>
        </div>

        {/* Helpline Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, marginBottom: 40 }}>
          {filteredNgos.map((ngo, i) => (
            <div key={i} className="glass animate-fade-up" style={{ padding: 24, transition: 'transform 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, background: ngo.isHelpline ? 'rgba(255,224,224,0.3)' : 'rgba(209,242,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ngo.isHelpline ? <Phone size={20} color="#B85C5C" /> : <Building2 size={20} color="#7ABCD4" />}
                   </div>
                   <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{ngo.name}</h3>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                         {ngo.available24x7 && <span className="badge badge-green" style={{ fontSize: 10 }}><Clock size={10} /> 24x7</span>}
                         <span className="badge badge-purple" style={{ fontSize: 10 }}><ShieldCheck size={10} /> Verified</span>
                      </div>
                   </div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{ngo.description}</p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                 {ngo.tags.map(tag => <span key={tag} className="badge badge-teal" style={{ fontSize: 11 }}>{tag}</span>)}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                 <a href={`tel:${ngo.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>
                    <Phone size={14} /> Call Now
                 </a>
                 <a href={ngo.website} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                    <ExternalLink size={14} /> Site
                 </a>
              </div>
            </div>
          ))}
        </div>

        <div className="glass" style={{ padding: 24, textAlign: 'center', background: 'rgba(209,242,255,0.1)', border: '1px solid rgba(209,242,255,0.3)' }}>
            <Heart size={24} color="#7ABCD4" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Need more specialized help?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Our mentors are available to talk to you for a more personalized support experience. Use our global chat or join a community group.</p>
        </div>
      </main>
    </div>
  );
}
