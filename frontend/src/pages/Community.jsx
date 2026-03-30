import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CommunityList from '../components/community/CommunityList';
import ChatWindow from '../components/community/ChatWindow';
import { useApp } from '../context/AppContext';

const INITIAL_GROUPS = [
  { id: 'g1', name: 'Music Therapy', icon: '🎵', lastMsg: 'I love this song!', unread: 2 },
  { id: 'g2', name: 'Gaming Hub', icon: '🎮', lastMsg: 'Anyone up for a match?', unread: 0 },
  { id: 'g3', name: 'Reading Nook', icon: '📚', lastMsg: 'The character arc was incredible!', unread: 5 },
  { id: 'g4', name: 'Sports Talk', icon: '⚽', lastMsg: 'Did you see that goal?', unread: 1 },
  { id: 'g5', name: 'Art & Sketch', icon: '🎨', lastMsg: 'Check out my new sketch!', unread: 0 },
  { id: 'g6', name: 'Support Group', icon: '🤝', lastMsg: 'You are doing great!', unread: 3 },
  { id: 'g7', name: 'Anxiety Support', icon: '🌿', lastMsg: 'Take a deep breath.', unread: 0 },
  { id: 'g8', name: 'Family & Life', icon: '🏠', lastMsg: 'Dinner was great tonight.', unread: 0 },
  { id: 'g9', name: 'Positivity Zone', icon: '✨', lastMsg: 'Stay positive everyone!', unread: 8 },
];

const MOCK_MESSAGES = {
  g1: [
    { sender: 'Priya', role: 'other', content: 'Has anyone heard the new Lofi girl track?', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { sender: 'Rahul', role: 'other', content: 'It is amazing for focus and relax.', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { sender: 'System', role: 'other', content: 'Welcome to Music Therapy! Share your favorite tunes.', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ],
  g2: [
    { sender: 'Sandeep', role: 'other', content: 'Valorant anyone?', timestamp: new Date(Date.now() - 3600000).toISOString() },
  ],
  g7: [
    { sender: 'Ananya', role: 'other', content: 'I am feeling a bit anxious about the exams tomorrow.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { sender: 'Priya', role: 'other', content: 'Do not worry Ananya, you worked hard. Just do your best!', timestamp: new Date(Date.now() - 1800000).toISOString() },
  ]
};

export default function Community() {
  const { user } = useApp();
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [activeGroup, setActiveGroup] = useState(INITIAL_GROUPS[0]);
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES);

  const handleSendMessage = (content) => {
    const newMessage = {
      sender: user?.nickname || 'You',
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setAllMessages(prev => ({
      ...prev,
      [activeGroup.id]: [...(prev[activeGroup.id] || []), newMessage]
    }));

    // Update last message in the group list
    setGroups(prev => prev.map(g => 
      g.id === activeGroup.id ? { ...g, lastMsg: content } : g
    ));
  };

  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    // Clear unread count
    setGroups(prev => prev.map(g => 
      g.id === group.id ? { ...g, unread: 0 } : g
    ));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0 }}>
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
          <CommunityList 
            groups={groups} 
            activeGroup={activeGroup} 
            onSelectGroup={handleSelectGroup} 
          />
          <ChatWindow 
            group={activeGroup} 
            messages={allMessages[activeGroup.id] || []} 
            onSendMessage={handleSendMessage} 
          />
        </div>
      </main>
    </div>
  );
}
