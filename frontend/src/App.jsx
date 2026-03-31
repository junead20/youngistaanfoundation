import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import PreLoginMood from './pages/PreLoginMood';
import UserLogin from './pages/UserLogin';
import VolunteerLogin from './pages/VolunteerLogin';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import MiloChatbot from './pages/MiloChatbot';
import MoodTracker from './pages/MoodTracker';
import NGODirectory from './pages/NGODirectory';
import Community from './pages/Community';
import VolunteerDashboard from './pages/VolunteerDashboard';
import MentorChat from './pages/MentorChat';
import NGODashboard from './pages/NGODashboard';
import StressRelief from './pages/StressRelief';

function ProtectedRoute({ children }) {
  const { user, volunteer } = useApp();
  if (!user && !volunteer) return <Navigate to="/" replace />;
  return children;
}

function VolunteerRoute({ children }) {
  const { volunteer } = useApp();
  if (!volunteer) return <Navigate to="/volunteer-login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PreLoginMood />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/volunteer-login" element={<VolunteerLogin />} />

      {/* User Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
      <Route path="/milo" element={<ProtectedRoute><MiloChatbot /></ProtectedRoute>} />
      <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
      <Route path="/ngo" element={<ProtectedRoute><NGODirectory /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/mentor-chat" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
      <Route path="/stress-relief" element={<ProtectedRoute><StressRelief /></ProtectedRoute>} />

      {/* Volunteer Protected */}
      <Route path="/volunteer-dashboard" element={<VolunteerRoute><VolunteerDashboard /></VolunteerRoute>} />
      <Route path="/ngo-dashboard" element={<ProtectedRoute><NGODashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
