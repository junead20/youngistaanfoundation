import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

export default function ChatWindow({ group, messages, onSendMessage }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  if (!group) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Smile size={40} />
      </div>
      <h3>Welcome to MindBridge Community</h3>
      <p>Select a group to start chatting!</p>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', borderRadius: '0 20px 20px 0', overflow: 'hidden', borderLeft: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--purple-primary), var(--teal-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'white' }}>
            {group.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: '#10B981' }}>● {Math.floor(Math.random() * 50) + 10} Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)' }}>
           <Video size={20} style={{ cursor: 'pointer' }} />
           <Phone size={20} style={{ cursor: 'pointer' }} />
           <MoreVertical size={20} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
         {messages.map((m, i) => (
           <MessageBubble key={i} message={m} isOwn={m.role === 'user'} />
         ))}
      </div>

      {/* Input Bar */}
      <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
         <div style={{ display: 'flex', gap: 10, color: 'var(--text-muted)' }}>
           <Smile size={22} style={{ cursor: 'pointer' }} />
           <Paperclip size={22} style={{ cursor: 'pointer' }} />
         </div>
         <input 
           type="text" 
           placeholder="Type a message..." 
           value={input} 
           onChange={e => setInput(e.target.value)}
           onKeyDown={e => e.key === 'Enter' && handleSend()}
           className="input"
           style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 16px', border: '1px solid var(--border)' }}
         />
         <button 
           onClick={handleSend}
           style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--purple-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
         >
           <Send size={20} color="white" />
         </button>
      </div>
    </div>
  );
}
