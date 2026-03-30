import React from 'react';

export default function MessageBubble({ message, isOwn }) {
  const formatTime = (iso) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      width: '100%'
    }}>
      {!isOwn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, marginLeft: 4 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #06B6D4, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
            {message.sender[0]}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{message.sender}</span>
        </div>
      )}
      
      <div className={`chat-bubble ${isOwn ? 'chat-bubble-user' : 'chat-bubble-ai'}`} style={{
        maxWidth: '75%',
        padding: '10px 14px',
        borderRadius: isOwn ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        background: isOwn ? 'linear-gradient(135deg, var(--purple-primary), var(--purple-light))' : 'rgba(255,255,255,0.05)',
        border: isOwn ? 'none' : '1px solid var(--border)'
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: isOwn ? 'white' : 'var(--text-primary)' }}>
          {message.content}
        </div>
        <div style={{
          fontSize: 10,
          marginTop: 4,
          textAlign: 'right',
          color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)'
        }}>
          {formatTime(message.timestamp || new Date())}
        </div>
      </div>
    </div>
  );
}
