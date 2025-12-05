import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
}

/**
 * Preferences store with localStorage persistence
 * Stores user preferences like audio volume
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      audioVolume: 0.7, // Default volume at 70%

      setAudioVolume: (volume) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ audioVolume: clampedVolume });
      },
    }),
    {
      name: 'ghostatlas-preferences',
    }
  )
);
