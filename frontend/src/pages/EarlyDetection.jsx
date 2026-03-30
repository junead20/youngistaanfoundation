import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Search, Users } from 'lucide-react';
import { getEntries, getEarlyWarning } from '../services/api';

export default function EarlyDetection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [warnings, setWarnings] = useState(null);
  const [warningLoading, setWarningLoading] = useState(false);
  const [filter, setFilter] = useState({ age_group: '', risk_level: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEntries();
        setEntries(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const checkWarning = async (userId) => {
    setSelectedUser(userId);
    setWarningLoading(true);
    try {
      const data = await getEarlyWarning(userId);
      setWarnings(data);
    } catch (err) {
      console.error(err);
    }
    setWarningLoading(false);
  };

  // Filter and group entries
  let filtered = entries;
  if (filter.age_group) filtered = filtered.filter(e => e.age_group === filter.age_group);
  if (filter.risk_level) filtered = filtered.filter(e => e.risk_level === filter.risk_level);

  // Group by user
  const userGroups = {};
  filtered.forEach(e => {
    const uid = e.user_id;
    if (!userGroups[uid]) {
      userGroups[uid] = {
        user_id: uid,
        name: e.user_name || uid,
        entries: [],
        latestMood: 0,
        avgMood: 0,
        latestRisk: 'LOW',
        program: e.program,
        city: e.city,
        age_group: e.age_group
      };
    }
    userGroups[uid].entries.push(e);
  });

  // Calculate user-level stats
  const userList = Object.values(userGroups).map(u => {
    u.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    u.latestMood = u.entries[0]?.mood_score || 0;
    u.latestRisk = u.entries[0]?.risk_level || 'LOW';
    u.avgMood = (u.entries.reduce((s, e) => s + e.mood_score, 0) / u.entries.length).toFixed(1);
    u.helpCount = u.entries.filter(e => e.help_flag).length;

    // Detect declining trend
    if (u.entries.length >= 3) {
      const recent = u.entries.slice(0, 3);
      u.declining = recent.every((e, i) => i === 0 || e.mood_score >= recent[i - 1].mood_score);
    }

    return u;
  }).sort((a, b) => {
    const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (riskOrder[a.latestRisk] || 3) - (riskOrder[b.latestRisk] || 3);
  });

  const highRiskCount = userList.filter(u => u.latestRisk === 'HIGH' || u.latestRisk === 'CRITICAL').length;
  const decliningCount = userList.filter(u => u.declining).length;

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p className="loading-text">Scanning for early warnings...</p></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🛡️ Early Detection System</h1>
        <p>Detect potential mental health concerns early through pattern analysis of daily responses</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon purple"><Users size={22} /></div>
          <div className="stat-card-value">{userList.length}</div>
          <div className="stat-card-label">Users Monitored</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon red"><AlertTriangle size={22} /></div>
          <div className="stat-card-value">{highRiskCount}</div>
          <div className="stat-card-label">Priority Connects</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon orange"><TrendingDown size={22} /></div>
          <div className="stat-card-value">{decliningCount}</div>
          <div className="stat-card-label">Declining Trend</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><Shield size={22} /></div>
          <div className="stat-card-value">{userList.length - highRiskCount}</div>
          <div className="stat-card-label">Stable Users</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-select" value={filter.age_group}
          onChange={e => setFilter({ ...filter, age_group: e.target.value })}>
          <option value="">All Age Groups</option>
          <option value="6-12">Children (6-12)</option>
          <option value="13-19">Teens (13-19)</option>
        </select>
        <select className="form-select" value={filter.risk_level}
          onChange={e => setFilter({ ...filter, risk_level: e.target.value })}>
          <option value="">All Wellbeing Levels</option>
          <option value="CRITICAL">Needs Immediate Connect</option>
          <option value="HIGH">High Priority</option>
          <option value="MEDIUM">Check-in Suggested</option>
          <option value="LOW">Doing Well</option>
        </select>
      </div>

      <div className="volunteer-grid">
        {/* User List */}
        <div className="card" style={{ maxHeight: 700, overflowY: 'auto' }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>🔍 User Risk Profiles</h3>
          {userList.length === 0 ? (
            <div className="empty-state"><p>No matching users found</p></div>
          ) : (
            userList.map((u) => (
              <div key={u.user_id}
                className="observation-card"
                onClick={() => checkWarning(u.user_id)}
                style={{ cursor: 'pointer', border: selectedUser === u.user_id ? '1px solid var(--primary)' : undefined }}>
                <div className="observation-avatar"
                  style={{
                    background: u.latestRisk === 'CRITICAL' ? 'linear-gradient(135deg, #FF6B6B, #EE5A24)' :
                      u.latestRisk === 'HIGH' ? 'linear-gradient(135deg, #E17055, #FDCB6E)' :
                        'linear-gradient(135deg, var(--primary), var(--accent))'
                  }}>
                  {u.name[0]}
                </div>
                <div className="observation-content" style={{ flex: 1 }}>
                  <h4>{u.name}</h4>
                  <p style={{ fontSize: 12 }}>{u.program} • {u.city} • {u.age_group}</p>
                  <div className="observation-meta">
                    <span className={`badge ${u.latestRisk.toLowerCase()}`}>
                      {u.latestRisk === 'CRITICAL' ? 'PRIORITY' : u.latestRisk === 'HIGH' ? 'CHECK-IN' : u.latestRisk}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      Mood: {u.avgMood}/5 • {u.entries.length} entries
                      {u.helpCount > 0 && ` • 🆘 ${u.helpCount} help requests`}
                    </span>
                  </div>
                  {u.declining && (
                    <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, fontWeight: 600 }}>
                      📉 Declining mood trend detected
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Warning Details */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: 16 }}>⚠️ Early Warning Analysis</h3>
          {!selectedUser ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>Select a User</h3>
              <p>Click on a user from the list to see early warning analysis</p>
            </div>
          ) : warningLoading ? (
            <div className="loading-container"><div className="loading-spinner" /></div>
          ) : (
            <>
              <div style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  User: <strong style={{ color: 'var(--text-primary)' }}>{selectedUser}</strong> •
                  Entries analyzed: <strong>{warnings?.entriesAnalyzed || 0}</strong>
                </p>
              </div>

              {warnings?.warnings?.length > 0 ? (
                <div className="insights-container">
                  {warnings.warnings.map((w, i) => (
                    <div key={i} className="insight-card">
                      <div className={`insight-icon ${w.severity === 'critical' ? 'critical' : 'warning'}`}>
                        {w.severity === 'critical' ? '🚨' : '⚠️'}
                      </div>
                      <div className="insight-text">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {w.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          <span className={`badge ${w.severity}`}>{w.severity}</span>
                        </h4>
                        <p>{w.message}</p>
                      </div>
                    </div>
                  ))}

                  <div style={{
                    marginTop: 16, padding: 20, background: 'rgba(255, 107, 107, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.2)', borderRadius: 'var(--radius-md)'
                  }}>
                    <h4 style={{ fontSize: 14, color: 'var(--danger)', marginBottom: 8 }}>
                      🆘 Recommended Actions
                    </h4>
                    <ul style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 20 }}>
                      <li>Schedule a one-on-one check-in with this student</li>
                      <li>Notify the program coordinator for their city</li>
                      <li>Ensure the student knows about available support resources</li>
                      <li>Consider involving a professional counselor if patterns persist</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="insight-card">
                  <div className="insight-icon info">✅</div>
                  <div className="insight-text">
                    <h4>No Early Warnings</h4>
                    <p>This user's patterns do not currently indicate any concerning trends. Continue regular monitoring.</p>
                  </div>
                </div>
              )}

              {/* Mood History */}
              {userGroups[selectedUser] && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📊 Recent Mood History</h4>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {userGroups[selectedUser].entries.slice(0, 10).map((e, i) => (
                      <div key={i} style={{
                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-glass)', border: '1px solid var(--border)',
                        textAlign: 'center', minWidth: 70
                      }}>
                        <div style={{
                          fontSize: 18, fontWeight: 700, fontFamily: 'Outfit',
                          color: e.mood_score >= 4 ? 'var(--success)' :
                            e.mood_score >= 3 ? 'var(--warning)' : 'var(--danger)'
                        }}>
                          {e.mood_score}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
