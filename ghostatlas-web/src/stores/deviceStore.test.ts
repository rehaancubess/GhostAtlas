import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from './deviceStore';

describe('deviceStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDeviceStore.setState({ deviceId: null });
    localStorage.clear();
  });

  it('should initialize with null deviceId', () => {
    const { deviceId } = useDeviceStore.getState();
    expect(deviceId).toBeNull();
  });

  it('should generate deviceId on initialization', () => {
    const { initializeDeviceId } = useDeviceStore.getState();
    initializeDeviceId();

    const { deviceId } = useDeviceStore.getState();
    expect(deviceId).toBeTruthy();
    expect(typeof deviceId).toBe('string');
    expect(deviceId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it('should not regenerate deviceId if already exists', () => {
    const { initializeDeviceId } = useDeviceStore.getState();
    
    initializeDeviceId();
    const firstId = useDeviceStore.getState().deviceId;

    initializeDeviceId();
    const secondId = useDeviceStore.getState().deviceId;

    expect(firstId).toBe(secondId);
  });
});
