import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  setLocation: (location: { latitude: number; longitude: number; accuracy?: number }) => void;
  setError: (error: string) => void;
  setLoading: (isLoading: boolean) => void;
  clearLocation: () => void;
  requestLocation: () => Promise<void>;
}

/**
 * Location store for managing user's current geolocation
 * Uses browser Geolocation API
 */
export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  error: null,
  isLoading: false,
  currentLocation: null,

  setLocation: ({ latitude, longitude, accuracy }) => {
    set({
      latitude,
      longitude,
      accuracy: accuracy ?? null,
      currentLocation: { latitude, longitude },
      error: null,
      isLoading: false,
    });
  },

  setError: (error) => {
    set({
      error,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  clearLocation: () => {
    set({
      latitude: null,
      longitude: null,
      accuracy: null,
      currentLocation: null,
      error: null,
      isLoading: false,
    });
  },

  requestLocation: async () => {
    if (!navigator.geolocation) {
      set({
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      set({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        currentLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    } catch (error) {
      let errorMessage = 'Failed to get location';

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
      }

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },
}));
