import { create } from 'zustand';
import { api } from '../api/client.js';
import { authApi } from '../api/index.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  get isAuthenticated() { return !!get().accessToken; },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      const { user, accessToken } = res.data;
      api.setToken(accessToken);
      set({ user, accessToken, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    api.clearToken();
    set({ user: null, accessToken: null });
  },

  refreshToken: async () => {
    try {
      const res = await authApi.refresh();
      if (res?.data?.accessToken) {
        api.setToken(res.data.accessToken);
        set({ accessToken: res.data.accessToken });
        return true;
      }
    } catch { return false; }
    return false;
  },

  setUser: (user, accessToken) => {
    api.setToken(accessToken);
    set({ user, accessToken });
  },

  clearError: () => set({ error: null }),
}));
