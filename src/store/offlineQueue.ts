import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PendingAction } from '../services/types';

interface OfflineQueueState {
  queue: PendingAction[];
  add: (item: PendingAction) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      add: (item) => set((state) => ({ queue: [...state.queue, item] })),
      remove: (id) => set((state) => ({ queue: state.queue.filter((q) => q.id !== id) })),
      clear: () => set({ queue: [] })
    }),
    {
      name: 'offline-queue',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
