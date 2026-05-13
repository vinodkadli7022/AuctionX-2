import { create } from 'zustand';
import { franchiseApi } from '../api/index.js';

export const useFranchiseStore = create((set, get) => ({
  franchises: [],
  isLoading: false,

  fetchFranchises: async () => {
    set({ isLoading: true });
    try {
      const res = await franchiseApi.getAll();
      set({ franchises: res.data, isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  updateFranchisePurse: ({ franchiseId, purseRemaining, squadCount, overseasCount }) => {
    set((s) => ({
      franchises: s.franchises.map((f) =>
        f.id === franchiseId ? { ...f, purse_remaining: purseRemaining, squad_count: squadCount, overseas_count: overseasCount } : f
      ),
    }));
  },

  // Sorted by purse spent (most spent first)
  get standingsSorted() {
    return [...get().franchises].sort((a, b) =>
      (b.purse_total - b.purse_remaining) - (a.purse_total - a.purse_remaining)
    );
  },
}));
