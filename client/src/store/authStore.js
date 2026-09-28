import { create } from 'zustand';
import { api } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  token: localStorage.getItem('annsarthi_access_token') || null,
  isAuthenticated: false,
  isLoading: true,

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      set({
        user: data.data.user,
        profile: data.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
      return data.data.user;
    } catch (err) {
      localStorage.removeItem('annsarthi_access_token');
      set({ user: null, profile: null, token: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user } = data.data;
    localStorage.setItem('annsarthi_access_token', accessToken);
    set({ token: accessToken, user, isAuthenticated: true });
    await get().fetchCurrentUser();
    return user;
  },

  demoLogin: async (role) => {
    const { data } = await api.post('/auth/demo-login', { role });
    const { accessToken, user } = data.data;
    localStorage.setItem('annsarthi_access_token', accessToken);
    set({ token: accessToken, user, isAuthenticated: true });
    await get().fetchCurrentUser();
    return user;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const { accessToken, user } = data.data;
    localStorage.setItem('annsarthi_access_token', accessToken);
    set({ token: accessToken, user, isAuthenticated: true });
    await get().fetchCurrentUser();
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('annsarthi_access_token');
    set({ user: null, profile: null, token: null, isAuthenticated: false });
  },
}));
