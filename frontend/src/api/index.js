import { api } from './client.js';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
};

export const playerApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== ''))).toString();
    return api.get(`/players${q ? '?' + q : ''}`);
  },
  getById: (id) => api.get(`/players/${id}`),
  getUpcoming: () => api.get('/players/upcoming'),
  getSoldHistory: () => api.get('/players/sold-history'),
  create: (formData) => api.postForm('/players', formData),
  bulkUpload: (formData) => api.postForm('/players/bulk-upload', formData),
};

export const franchiseApi = {
  getAll: () => api.get('/franchises'),
  getById: (id) => api.get(`/franchises/${id}`),
  getSquad: (id) => api.get(`/franchises/${id}/squad`),
  getStandings: () => api.get('/franchises/standings'),
};

export const auctionApi = {
  getSession: () => api.get('/auction/session'),
  getHistory: () => api.get('/auction/history'),
  startSession: (name) => api.post('/auction/session/start', { name }),
  endSession: () => api.post('/auction/session/end'),
  nominate: (playerId) => api.post(`/auction/nominate/${playerId}`),
  sold: () => api.post('/auction/sold'),
  unsold: () => api.post('/auction/unsold'),
  pause: () => api.post('/auction/pause'),
  resume: () => api.post('/auction/resume'),
};

export const adminApi = {
  getBidsForPlayer: (playerId, sessionId) =>
    api.get(`/admin/bids/${playerId}${sessionId ? '?sessionId=' + sessionId : ''}`),
  getStats: () => api.get('/admin/stats'),
};
