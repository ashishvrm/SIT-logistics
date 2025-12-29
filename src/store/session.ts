import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Org, Role, Branch } from '../services/types';

interface SessionState {
  loggedIn: boolean;
  org?: Org;
  branch?: Branch;
  role?: Role;
  offlineMode: boolean;
  setLoggedIn: (value: boolean) => void;
  setOrg: (org: Org) => void;
  setBranch: (branch: Branch) => void;
  setRole: (role: Role) => void;
  toggleOffline: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      loggedIn: false,
      offlineMode: false,
      setLoggedIn: (value) => set({ loggedIn: value }),
      setOrg: (org) => set({ org }),
      setBranch: (branch) => set({ branch }),
      setRole: (role) => set({ role }),
      toggleOffline: () => set((state) => ({ offlineMode: !state.offlineMode })),
      reset: () => set({ loggedIn: false, org: undefined, branch: undefined, role: undefined })
    }),
    {
      name: 'session-store',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
