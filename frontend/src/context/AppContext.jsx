import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [moodData, setMoodData] = useState(null); // Pre-login mood
  const [user, setUser] = useState(null);          // { userId, token, nickname, role }
  const [volunteer, setVolunteer] = useState(null);// Volunteer session
  const [stressLevel, setStressLevel] = useState(null); // 'Low' | 'Medium' | 'High'
  const [safetyPlan, setSafetyPlan] = useState(() => JSON.parse(localStorage.getItem('mb_safety_plan')) || null);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mb_user');
    const savedVolunteer = localStorage.getItem('mb_volunteer');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedVolunteer) setVolunteer(JSON.parse(savedVolunteer));

    // Restore pre-login mood from sessionStorage
    const savedMood = sessionStorage.getItem('mb_mood');
    if (savedMood) {
      const data = JSON.parse(savedMood);
      setMoodData(data);
      if (data.stressLevel) {
        if (data.stressLevel <= 3) setStressLevel('Low');
        else if (data.stressLevel <= 6) setStressLevel('Medium');
        else setStressLevel('High');
      }
    }
  }, []);

  const saveMood = (data) => {
    setMoodData(data);
    sessionStorage.setItem('mb_mood', JSON.stringify(data));
    // Compute stress category
    const level = data.stressLevel;
    if (level) {
      if (level <= 3) setStressLevel('Low');
      else if (level <= 6) setStressLevel('Medium');
      else setStressLevel('High');
    }
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('mb_user', JSON.stringify(userData));
  };

  const loginVolunteer = (volunteerData) => {
    setVolunteer(volunteerData);
    localStorage.setItem('mb_volunteer', JSON.stringify(volunteerData));
  };

  const logout = () => {
    setUser(null);
    setVolunteer(null);
    setMoodData(null);
    setStressLevel(null);
    localStorage.removeItem('mb_user');
    localStorage.removeItem('mb_volunteer');
    sessionStorage.removeItem('mb_mood');
  };

  const guestLogin = (age = null) => {
    const guestUser = {
      userId: `ANON-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      nickname: 'Anonymous User',
      age: age,
      token: btoa(`anon-${Date.now()}`),
      role: 'user',
      isGuest: true
    };
    setUser(guestUser);
    localStorage.setItem('mb_user', JSON.stringify(guestUser));
    return guestUser;
  };

  const emergencyGuestLogin = (initialTranscript = '') => {
    const guestUser = {
      userId: `SOS-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      nickname: 'Guest in Crisis',
      token: btoa(`guest-${Date.now()}`),
      role: 'user',
      isGuest: true
    };
    
    setUser(guestUser);
    localStorage.setItem('mb_user', JSON.stringify(guestUser));
    
    // Save immediate crisis mood
    saveMood({ 
      label: 'Crisis', 
      emoji: '🆘', 
      stressLevel: 10, 
      lastNote: initialTranscript ? `VOICE_SOS: "${initialTranscript}"` : 'VOICE_EMERGENCY_DETECTED' 
    });
    
    return guestUser;
  };

  return (
    <AppContext.Provider value={{
      moodData, saveMood,
      user, loginUser, guestLogin,
      volunteer, loginVolunteer,
      stressLevel, setStressLevel,
      logout, emergencyGuestLogin
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
