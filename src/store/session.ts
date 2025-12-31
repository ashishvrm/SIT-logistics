import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Org, Role, Branch } from '../services/types';

interface SessionState {
  loggedIn: boolean;
  userId: string | null;
  phoneNumber: string | null;
  authExpiry: number | null;
  org?: Org;
  branch?: Branch;
  role?: Role;
  offlineMode: boolean;
  setLoggedIn: (value: boolean) => void;
  setUserId: (userId: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setAuthExpiry: (expiry: number) => void;
  isSessionExpired: () => boolean;
  setOrg: (org: Org) => void;
  setBranch: (branch: Branch) => void;
  setRole: (role: Role) => void;
  toggleOffline: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      loggedIn: false,
      userId: null,
      phoneNumber: null,
      authExpiry: null,
      offlineMode: false,
      setLoggedIn: (value) => set({ loggedIn: value }),
      setUserId: (userId) => set({ userId }),
      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
      setAuthExpiry: (expiry) => set({ authExpiry: expiry }),
      isSessionExpired: () => {
        const { authExpiry } = get();
        if (!authExpiry) return true;
        return Date.now() >= authExpiry;
      },
      setOrg: (org) => set({ org }),
      setBranch: (branch) => set({ branch }),
      setRole: (role) => set({ role }),
      toggleOffline: () => set((state) => ({ offlineMode: !state.offlineMode })),
      reset: () => set({ 
        loggedIn: false, 
        userId: null,
        phoneNumber: null,
        authExpiry: null,
        org: undefined, 
        branch: undefined, 
        role: undefined 
      })
    }),
    {
      name: 'session-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
