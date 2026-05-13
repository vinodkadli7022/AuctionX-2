import { create } from 'zustand';
import { playerApi } from '../api/index.js';

export const usePlayerStore = create((set, get) => ({
  players: [],
  total: 0,
  page: 1,
  limit: 20,
  filters: { role: '', nationality: '', status: '', search: '' },
  isLoading: false,
  upcomingPlayers: [],

  fetchPlayers: async (overrideFilters = {}) => {
    const { filters, page, limit } = get();
    const merged = { ...filters, ...overrideFilters, page, limit };
    set({ isLoading: true });
    try {
      const res = await playerApi.getAll(merged);
      set({ players: res.data.players, total: res.data.total, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  fetchUpcoming: async () => {
    try {
      const res = await playerApi.getUpcoming();
      set({ upcomingPlayers: res.data });
    } catch {}
  },

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value }, page: 1 }));
  },

  setPage: (page) => set({ page }),
  resetFilters: () => set({ filters: { role: '', nationality: '', status: '', search: '' }, page: 1 }),
}));
