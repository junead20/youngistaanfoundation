import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import PreLoginMood from './pages/PreLoginMood';
import UserLogin from './pages/UserLogin';
import VolunteerLogin from './pages/VolunteerLogin';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import MoodTracker from './pages/MoodTracker';
import NGODirectory from './pages/NGODirectory';
import Community from './pages/Community';
import VolunteerDashboard from './pages/VolunteerDashboard';
import MentorChat from './pages/MentorChat';
import NGODashboard from './pages/NGODashboard';
import StressRelief from './pages/StressRelief';
import MenteeAnalysis from './pages/MenteeAnalysis';
import VolunteerDirectory from './pages/VolunteerDirectory';

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

function NgoRoute({ children }) {
  const { volunteer } = useApp();
  if (!volunteer || volunteer.role !== 'ngo') return <Navigate to="/volunteer-login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PreLoginMood />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/volunteer-login" element={<VolunteerLogin />} />
      <Route path="/chat" element={<Chatbot />} />
      <Route path="/mood" element={<MoodTracker />} />
      <Route path="/stress-relief" element={<StressRelief />} />

      {/* User Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ngo" element={<ProtectedRoute><NGODirectory /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/mentor-chat" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />

      {/* Volunteer Protected */}
      <Route path="/volunteer-dashboard" element={<VolunteerRoute><VolunteerDashboard /></VolunteerRoute>} />
      <Route path="/mentee-analysis" element={<VolunteerRoute><MenteeAnalysis /></VolunteerRoute>} />
      <Route path="/volunteer-directory" element={<VolunteerRoute><VolunteerDirectory /></VolunteerRoute>} />

      {/* NGO Protected */}
      <Route path="/ngo-dashboard" element={<NgoRoute><NGODashboard /></NgoRoute>} />
      <Route path="/volunteer-dashboard" element={<NgoRoute><VolunteerDashboard /></NgoRoute>} />
      <Route path="/mentee-analysis" element={<NgoRoute><MenteeAnalysis /></NgoRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
