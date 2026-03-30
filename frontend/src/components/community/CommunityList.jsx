import React from 'react';
import { Search } from 'lucide-react';

export default function CommunityList({ groups, activeGroup, onSelectGroup }) {
  return (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border)' }}>
      {/* Search Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Communities</h2>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search groups..." 
            className="input"
            style={{ width: '100%', paddingLeft: 38, paddingRight: 12, fontSize: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}
          />
        </div>
      </div>

      {/* Group List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.map((group) => (
          <div 
            key={group.id}
            onClick={() => onSelectGroup(group)}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              background: activeGroup?.id === group.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderLeft: `3px solid ${activeGroup?.id === group.id ? 'var(--purple-primary)' : 'transparent'}`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = activeGroup?.id === group.id ? 'rgba(255,255,255,0.05)' : 'transparent'}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--purple-primary), var(--teal-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white' }}>
              {group.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.lastMsg || 'No messages yet'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>12:45</div>
              {group.unread > 0 && (
                <div style={{ display: 'inline-flex', padding: '2px 6px', borderRadius: 10, background: 'var(--purple-primary)', fontSize: 10, fontWeight: 700, color: 'white' }}>
                  {group.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
