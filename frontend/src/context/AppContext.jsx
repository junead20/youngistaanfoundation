import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [moodData, setMoodData] = useState(null); // Pre-login mood
  const [user, setUser] = useState(null);          // { userId, token, nickname, role }
  const [volunteer, setVolunteer] = useState(null);// Volunteer session
  const [stressLevel, setStressLevel] = useState(null); // 'Low' | 'Medium' | 'High'

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
