import { describe, it, expect, beforeEach } from 'vitest';
import { useLocationStore } from './locationStore';

describe('locationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useLocationStore.setState({
      latitude: null,
      longitude: null,
      accuracy: null,
      currentLocation: null,
      error: null,
      isLoading: false,
    });
  });

  it('should initialize with null location', () => {
    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.accuracy).toBeNull();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should set location correctly', () => {
    const { setLocation } = useLocationStore.getState();
    setLocation({ latitude: 40.7128, longitude: -74.006, accuracy: 10 });

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.accuracy).toBe(10);
    expect(state.currentLocation).toEqual({ latitude: 40.7128, longitude: -74.006 });
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should set error correctly', () => {
    const { setError } = useLocationStore.getState();
    setError('Location permission denied');

    const state = useLocationStore.getState();
    expect(state.error).toBe('Location permission denied');
    expect(state.isLoading).toBe(false);
  });

  it('should set loading state', () => {
    const { setLoading } = useLocationStore.getState();
    setLoading(true);

    const state = useLocationStore.getState();
    expect(state.isLoading).toBe(true);
  });

  it('should clear location', () => {
    const { setLocation, clearLocation } = useLocationStore.getState();
    
    // Set location first
    setLocation({ latitude: 40.7128, longitude: -74.006, accuracy: 10 });
    
    // Then clear it
    clearLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.accuracy).toBeNull();
    expect(state.currentLocation).toBeNull();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});
