import { useState, useEffect } from 'react';
import { Users, Upload, Send, Eye, FileText, AlertTriangle } from 'lucide-react';
import { getVolunteerObs, addVolunteerObs, getVolunteerStats, uploadOfflineSheet } from '../services/api';

const obsTypeLabels = {
  withdrawn: '😶 Withdrawn',
  not_interacting: '🤐 Not Interacting',
  exam_stress: '📝 Exam Stress',
  bullying: '👊 Bullying',
  low_confidence: '📉 Low Confidence',
  anxiety: '😰 Anxiety',
  positive_change: '✨ Positive Change',
  other: '📋 Other'
};

export default function VolunteerPortal() {
  const [tab, setTab] = useState('submit');
  const [observations, setObservations] = useState([]);
  const [volStats, setVolStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  // Form states
  const [form, setForm] = useState({
    volunteer_name: '', child_name: '', age_group: '6-12',
    program: 'Bright Spark', city: 'Hyderabad', observation: '',
    observation_type: 'withdrawn', mood_score: 3,
    confidence_level: 'moderate', session_type: 'online', severity: 'low'
  });

  // Offline form
  const [offlineEntries, setOfflineEntries] = useState([{
    volunteer_name: '', child_name: '', age_group: '6-12',
    program: 'Bright Spark', city: 'Hyderabad',
    observation: '', observation_type: 'other', mood_score: 3,
    confidence_level: 'moderate',
    offline_scores: { emotional_wellbeing: 5, social_interaction: 5, academic_engagement: 5, self_confidence: 5, overall: 5 }
  }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [obs, stats] = await Promise.all([getVolunteerObs(), getVolunteerStats()]);
      setObservations(obs);
      setVolStats(stats);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addVolunteerObs(form);
      setSubmitStatus({ type: 'success', msg: 'Observation submitted successfully! ✅' });
      setForm(prev => ({ ...prev, observation: '', child_name: '' }));
      loadData();
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: 'Error submitting observation' });
    }
  };

  const handleOfflineUpload = async () => {
    try {
      const res = await uploadOfflineSheet(offlineEntries.map(e => ({
        ...e,
        session_type: 'offline'
      })));
      setSubmitStatus({ type: 'success', msg: `${res.uploaded} offline entries uploaded! ✅` });
      loadData();
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: 'Error uploading offline data' });
    }
  };

  const addOfflineEntry = () => {
    setOfflineEntries(prev => [...prev, {
      volunteer_name: '', child_name: '', age_group: '6-12',
      program: 'Bright Spark', city: 'Hyderabad',
      observation: '', observation_type: 'other', mood_score: 3,
      confidence_level: 'moderate',
      offline_scores: { emotional_wellbeing: 5, social_interaction: 5, academic_engagement: 5, self_confidence: 5, overall: 5 }
    }]);
  };

  const updateOfflineEntry = (index, field, value) => {
    setOfflineEntries(prev => {
      const updated = [...prev];
      if (field.startsWith('offline_scores.')) {
        const key = field.split('.')[1];
        updated[index] = { ...updated[index], offline_scores: { ...updated[index].offline_scores, [key]: parseInt(value) || 0 } };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>👥 Volunteer Admin</h1>
        <p>Share what you noticed, manage offline digital sheets, and track 1-on-1 connections.</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'submit' ? 'active' : ''}`} onClick={() => setTab('submit')}>
          <Send size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Share What You Noticed
        </button>
        <button className={`tab ${tab === 'offline' ? 'active' : ''}`} onClick={() => setTab('offline')}>
          <Upload size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Offline Mood Sheet
        </button>
        <button className={`tab ${tab === 'view' ? 'active' : ''}`} onClick={() => setTab('view')}>
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> View Shared Notes
        </button>
        <button className={`tab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>
          <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Stats
        </button>
      </div>

      {/* Toast */}
      {submitStatus && (
        <div className="toast-container">
          <div className={`toast ${submitStatus.type}`}>
            <span className="toast-message">{submitStatus.msg}</span>
          </div>
        </div>
      )}

      {/* Submit Tab */}
      {tab === 'submit' && (
        <div className="volunteer-grid">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 20 }}>📝 Share What You Noticed</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Volunteer Name</label>
                  <input className="form-input" value={form.volunteer_name}
                    onChange={e => setForm({ ...form, volunteer_name: e.target.value })}
                    placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Child / Student Name</label>
                  <input className="form-input" value={form.child_name}
                    onChange={e => setForm({ ...form, child_name: e.target.value })}
                    placeholder="Student name" required />
                </div>
              </div>
              <div className="form-row three">
                <div className="form-group">
                  <label className="form-label">Age Group</label>
                  <select className="form-select" value={form.age_group}
                    onChange={e => setForm({ ...form, age_group: e.target.value })}>
                    <option value="6-12">Children (6-12)</option>
                    <option value="13-19">Teens (13-19)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Program</label>
                  <select className="form-select" value={form.program}
                    onChange={e => setForm({ ...form, program: e.target.value })}>
                    <option>Bright Spark</option>
                    <option>Gender Equality</option>
                    <option>Youth Mentoring</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select className="form-select" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}>
                    {["Hyderabad", "Bangalore", "Delhi", "Mumbai", "Chennai"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Observation Type</label>
                  <select className="form-select" value={form.observation_type}
                    onChange={e => setForm({ ...form, observation_type: e.target.value })}>
                    {Object.entries(obsTypeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <select className="form-select" value={form.session_type}
                    onChange={e => setForm({ ...form, session_type: e.target.value })}>
                    <option value="online">🟢 Online</option>
                    <option value="offline">🔵 Offline</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mood Score (1-5)</label>
                  <div className="score-input-group">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button"
                        className={`score-btn ${form.mood_score === s ? 'selected' : ''}`}
                        onClick={() => setForm({ ...form, mood_score: s })}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select className="form-select" value={form.severity}
                    onChange={e => setForm({ ...form, severity: e.target.value })}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Notes</label>
                <textarea className="form-textarea" value={form.observation}
                  onChange={e => setForm({ ...form, observation: e.target.value })}
                  placeholder="Describe what you noticed and how we can support..."
                  required />
              </div>
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Share Notes
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 16 }}>📊 Quick Stats</h3>
            {volStats ? (
              <>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 20 }}>
                  <div className="stat-card">
                    <div className="stat-card-value">{volStats.total}</div>
                    <div className="stat-card-label">Total Observations</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-value">{volStats.followUpNeeded}</div>
                    <div className="stat-card-label">Need Follow-up</div>
                  </div>
                </div>

                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Observation Types</h4>
                {Object.entries(volStats.obsTypeDistribution || {}).map(([type, count]) => (
                  <div key={type} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{obsTypeLabels[type] || type}</span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className={`progress-fill ${type === 'positive_change' ? 'green' : count > 10 ? 'red' : 'yellow'}`}
                        style={{ width: `${Math.min((count / volStats.total) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}

                {volStats.recentCritical && volStats.recentCritical.length > 0 && (
                  <>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 12 }}>
                      🚨 Priority Connects
                    </h4>
                    {volStats.recentCritical.map((o, i) => (
                      <div key={i} className="observation-card">
                        <div className="observation-avatar">
                          {(o.child_name || 'U')[0]}
                        </div>
                        <div className="observation-content">
                          <h4>{o.child_name || o.child_id}</h4>
                          <p>{o.observation}</p>
                          <div className="observation-meta">
                            <span className={`badge ${o.severity}`}>{o.severity}</span>
                            <span className="badge" style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--primary-light)' }}>{o.program}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="loading-container"><div className="loading-spinner" /></div>
            )}
          </div>
        </div>
      )}

      {/* Offline Upload Tab */}
      {tab === 'offline' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">📋 1-on-1 Offline Digital Sheet</h3>
              <p className="card-subtitle">Convert your offline connect sessions into actionable data</p>
            </div>
          </div>

          {offlineEntries.map((entry, idx) => (
            <div key={idx} style={{
              padding: 20, marginBottom: 16,
              background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600 }}>Student #{idx + 1}</h4>
                {offlineEntries.length > 1 && (
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => setOfflineEntries(prev => prev.filter((_, i) => i !== idx))}>
                    Remove
                  </button>
                )}
              </div>
              <div className="form-row three">
                <div className="form-group">
                  <label className="form-label">Volunteer Name</label>
                  <input className="form-input" value={entry.volunteer_name}
                    onChange={e => updateOfflineEntry(idx, 'volunteer_name', e.target.value)}
                    placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input className="form-input" value={entry.child_name}
                    onChange={e => updateOfflineEntry(idx, 'child_name', e.target.value)}
                    placeholder="Student name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Program</label>
                  <select className="form-select" value={entry.program}
                    onChange={e => updateOfflineEntry(idx, 'program', e.target.value)}>
                    <option>Bright Spark</option>
                    <option>Gender Equality</option>
                    <option>Youth Mentoring</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <select className="form-select" value={entry.city}
                    onChange={e => updateOfflineEntry(idx, 'city', e.target.value)}>
                    {["Hyderabad", "Bangalore", "Delhi", "Mumbai", "Chennai"].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Age Group</label>
                  <select className="form-select" value={entry.age_group}
                    onChange={e => updateOfflineEntry(idx, 'age_group', e.target.value)}>
                    <option value="6-12">Children (6-12)</option>
                    <option value="13-19">Teens (13-19)</option>
                  </select>
                </div>
              </div>

              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, marginTop: 8 }}>
                📊 Offline Evaluation Scores (1-10)
              </h4>
              <div className="form-row three" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[
                  { key: 'emotional_wellbeing', label: 'Emotional' },
                  { key: 'social_interaction', label: 'Social' },
                  { key: 'academic_engagement', label: 'Academic' },
                  { key: 'self_confidence', label: 'Confidence' },
                  { key: 'overall', label: 'Overall' },
                ].map(({ key, label }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type="number" min="1" max="10"
                      value={entry.offline_scores[key]}
                      onChange={e => updateOfflineEntry(idx, `offline_scores.${key}`, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Observations</label>
                <textarea className="form-textarea" value={entry.observation}
                  onChange={e => updateOfflineEntry(idx, 'observation', e.target.value)}
                  placeholder="Notes from offline assessment..." style={{ minHeight: 60 }} />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={addOfflineEntry}>
              + Add Another Student
            </button>
            <button className="btn btn-primary" onClick={handleOfflineUpload}>
              <Upload size={16} /> Upload All Responses
            </button>
          </div>
        </div>
      )}

      {/* View Observations Tab */}
      {tab === 'view' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">All Volunteer Observations</h3>
              <p className="card-subtitle">{observations.length} observations recorded</p>
            </div>
          </div>
          {loading ? (
            <div className="loading-container"><div className="loading-spinner" /></div>
          ) : observations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No Observations Yet</h3>
              <p>Submit your first observation or seed demo data.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Student</th>
                  <th>Type</th>
                  <th>Program</th>
                  <th>City</th>
                  <th>Severity</th>
                  <th>Session</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {observations.slice(0, 30).map((o, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.volunteer_name || '—'}</td>
                    <td>{o.child_name || o.child_id || '—'}</td>
                    <td>{obsTypeLabels[o.observation_type] || o.observation_type}</td>
                    <td>{o.program}</td>
                    <td>{o.city}</td>
                    <td><span className={`badge ${o.severity}`}>{o.severity}</span></td>
                    <td><span className={`badge ${o.session_type}`}>{o.session_type}</span></td>
                    <td>{new Date(o.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && volStats && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon purple"><Users size={22} /></div>
              <div className="stat-card-value">{volStats.total}</div>
              <div className="stat-card-label">Total Observations</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
              <div className="stat-card-value">{volStats.followUpNeeded}</div>
              <div className="stat-card-label">Follow-up Needed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon orange"><Eye size={22} /></div>
              <div className="stat-card-value">{volStats.severityDistribution?.high || 0}</div>
              <div className="stat-card-label">High Severity</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon teal"><FileText size={22} /></div>
              <div className="stat-card-value">{volStats.severityDistribution?.critical || 0}</div>
              <div className="stat-card-label">Critical Cases</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Severity Distribution</h3>
              {Object.entries(volStats.severityDistribution || {}).map(([level, count]) => (
                <div key={level} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span className={`badge ${level}`}>{level.toUpperCase()}</span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${level === 'low' ? 'green' : level === 'medium' ? 'yellow' : 'red'}`}
                      style={{ width: `${(count / volStats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 16 }}>Program Breakdown</h3>
              {Object.entries(volStats.programObs || {}).map(([prog, data]) => (
                <div key={prog} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prog}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{data.count} observations</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill purple"
                      style={{ width: `${(data.count / volStats.total) * 100}%` }} />
                  </div>
                  {data.highSeverity > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                      ⚠️ {data.highSeverity} high severity cases
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
