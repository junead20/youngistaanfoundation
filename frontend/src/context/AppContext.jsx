import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [moodData, setMoodData] = useState(() => {
    const saved = sessionStorage.getItem('mb_mood');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mb_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [volunteer, setVolunteer] = useState(() => {
    const saved = localStorage.getItem('mb_volunteer');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [stressLevel, setStressLevel] = useState(() => {
    const savedMood = sessionStorage.getItem('mb_mood');
    if (savedMood) {
      const data = JSON.parse(savedMood);
      if (data.stressLevel) {
        if (data.stressLevel <= 3) return 'Low';
        if (data.stressLevel <= 6) return 'Medium';
        return 'High';
      }
    }
    return null;
  });

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

  return (
    <AppContext.Provider value={{
      moodData, saveMood,
      user, loginUser,
      volunteer, loginVolunteer,
      stressLevel, setStressLevel,
      logout
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
