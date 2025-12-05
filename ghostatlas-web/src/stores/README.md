# GhostAtlas State Management

This directory contains Zustand stores for managing client-side state in the GhostAtlas web application.

## Stores

### Device Store (`deviceStore.ts`)

Manages the unique device ID for the user's browser. The device ID is persisted in localStorage and used for:
- Tracking user ratings
- Preventing duplicate ratings
- Associating submissions and verifications with the user

**Usage:**

```typescript
import { useDeviceStore } from '@/stores';

function MyComponent() {
  const deviceId = useDeviceStore((state) => state.deviceId);
  const initializeDeviceId = useDeviceStore((state) => state.initializeDeviceId);

  // Device ID is automatically initialized on app load via useInitializeApp hook
  // But you can manually initialize if needed
  useEffect(() => {
    initializeDeviceId();
  }, []);

  return <div>Device ID: {deviceId}</div>;
}
```

### Location Store (`locationStore.ts`)

Manages the user's current geolocation using the browser's Geolocation API. Used for:
- Verification features (checking if user is within 50m of encounter)
- Filtering encounters by distance
- Submitting encounters with current location

**Usage:**

```typescript
import { useLocationStore } from '@/stores';

function LocationComponent() {
  const { latitude, longitude, error, isLoading } = useLocationStore();
  const requestLocation = useLocationStore((state) => state.requestLocation);

  const handleGetLocation = async () => {
    await requestLocation();
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={isLoading}>
        {isLoading ? 'Getting location...' : 'Get My Location'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {latitude && longitude && (
        <p>Location: {latitude}, {longitude}</p>
      )}
    </div>
  );
}
```

### Preferences Store (`preferencesStore.ts`)

Manages user preferences that are persisted in localStorage. Currently includes:
- Audio volume for narration playback

**Usage:**

```typescript
import { usePreferencesStore } from '@/stores';

function AudioPlayer() {
  const audioVolume = usePreferencesStore((state) => state.audioVolume);
  const setAudioVolume = usePreferencesStore((state) => state.setAudioVolume);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setAudioVolume(volume);
  };

  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={audioVolume}
      onChange={handleVolumeChange}
    />
  );
}
```

## Initialization

The app automatically initializes required stores on mount using the `useInitializeApp` hook in `App.tsx`. This ensures:
- Device ID is generated on first visit
- Persisted preferences are loaded from localStorage

## Testing

Each store has corresponding unit tests that verify:
- Initial state
- State updates
- Persistence (for stores using localStorage)
- Edge cases (e.g., volume clamping, duplicate device ID prevention)

Run tests with:
```bash
npm test
```

## Architecture Notes

- **Zustand** is used for state management due to its simplicity and minimal boilerplate
- **Persist middleware** is used for stores that need localStorage persistence (device ID, preferences)
- **No persist** for location store since geolocation should be requested fresh each time
- Stores are kept minimal and focused on a single concern
- Complex business logic should be in hooks or services, not in stores
