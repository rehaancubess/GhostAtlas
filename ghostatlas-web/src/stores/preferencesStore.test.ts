import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferencesStore } from './preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePreferencesStore.setState({ audioVolume: 0.7 });
    localStorage.clear();
  });

  it('should initialize with default volume', () => {
    const { audioVolume } = usePreferencesStore.getState();
    expect(audioVolume).toBe(0.7);
  });

  it('should set audio volume correctly', () => {
    const { setAudioVolume } = usePreferencesStore.getState();
    setAudioVolume(0.5);

    const { audioVolume } = usePreferencesStore.getState();
    expect(audioVolume).toBe(0.5);
  });

  it('should clamp volume to minimum 0', () => {
    const { setAudioVolume } = usePreferencesStore.getState();
    setAudioVolume(-0.5);

    const { audioVolume } = usePreferencesStore.getState();
    expect(audioVolume).toBe(0);
  });

  it('should clamp volume to maximum 1', () => {
    const { setAudioVolume } = usePreferencesStore.getState();
    setAudioVolume(1.5);

    const { audioVolume } = usePreferencesStore.getState();
    expect(audioVolume).toBe(1);
  });
});
