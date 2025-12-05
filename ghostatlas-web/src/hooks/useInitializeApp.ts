import { useEffect } from 'react';
import { useDeviceStore } from '../stores';

/**
 * Hook to initialize app-level state on mount
 * Ensures device ID is generated on first visit
 */
export const useInitializeApp = () => {
  const initializeDeviceId = useDeviceStore(
    (state) => state.initializeDeviceId
  );

  useEffect(() => {
    // Initialize device ID on first app load
    initializeDeviceId();
  }, [initializeDeviceId]);
};
