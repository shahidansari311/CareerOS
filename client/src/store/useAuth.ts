import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  onboardingStatus: string;
  profile?: {
    firstName: string;
    lastName: string;
    graduationYear?: number;
    collegeName?: string;
    branch?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/auth/me');
      set({ user: response.data.data.user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ user: null, isAuthenticated: false });
      window.location.href = '/auth/login';
    }
  }
}));
