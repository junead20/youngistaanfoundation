const API_BASE = 'http://localhost:5000/api';

async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// Entries
export const getEntries = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return request(`/entries${params ? `?${params}` : ''}`);
};

export const addEntry = (data) => request('/entries', { method: 'POST', body: JSON.stringify(data) });

export const getStats = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return request(`/entries/stats${params ? `?${params}` : ''}`);
};

export const getEarlyWarning = (userId) => request(`/entries/early-warning/${userId}`);

// Volunteers
export const getVolunteerObs = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return request(`/volunteers${params ? `?${params}` : ''}`);
};

export const addVolunteerObs = (data) => request('/volunteers', { method: 'POST', body: JSON.stringify(data) });

export const getVolunteerStats = () => request('/volunteers/stats');

export const uploadOfflineSheet = (entries) => request('/volunteers/offline-upload', { method: 'POST', body: JSON.stringify({ entries }) });

// Workshops
export const getWorkshops = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return request(`/workshops${params ? `?${params}` : ''}`);
};

export const addWorkshop = (data) => request('/workshops', { method: 'POST', body: JSON.stringify(data) });

export const getImpactStats = () => request('/workshops/impact');

// Milo (Chatbot)
export const chatWithMilo = (data) => request('/chatbot/chat', { method: 'POST', body: JSON.stringify(data) });
export const saveMiloChat = (data) => request('/chatbot/save', { method: 'POST', body: JSON.stringify(data) });

// Communities
export const getCommunities = () => request('/communities');

// Activities
export const getActivities = () => request('/activities');

// Offline Sessions
export const getOfflineSessions = () => request('/offline-sessions');
export const addOfflineSession = (data) => request('/offline-sessions', { method: 'POST', body: JSON.stringify(data) });

// Seed
export const seedDatabase = () => request('/seed', { method: 'POST' });
