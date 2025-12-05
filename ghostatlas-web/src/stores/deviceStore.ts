import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DeviceState {
  deviceId: string | null;
  initializeDeviceId: () => void;
}

/**
 * Generate a unique device ID using crypto API
 */
const generateDeviceId = (): string => {
  return crypto.randomUUID();
};

/**
 * Device ID store with localStorage persistence
 * Used for tracking ratings and preventing duplicates
 */
export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      deviceId: null,

      initializeDeviceId: () => {
        const currentId = get().deviceId;
        if (!currentId) {
          const newId = generateDeviceId();
          set({ deviceId: newId });
        }
      },
    }),
    {
      name: 'ghostatlas-device',
    }
  )
);
