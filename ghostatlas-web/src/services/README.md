# API Service Layer

This directory contains the API client and service layer for the GhostAtlas Web Application.

## Overview

The API service layer provides a centralized interface for communicating with the GhostAtlas AWS Backend. It includes:

- **API Client**: Axios-based HTTP client with interceptors for logging, error handling, and retry logic
- **React Query Hooks**: Type-safe hooks for data fetching, caching, and mutations
- **TypeScript Types**: Complete type definitions for all API requests and responses

## Architecture

```
services/
├── apiClient.ts          # Axios client with interceptors and retry logic
└── README.md            # This file

hooks/
├── useEncounters.ts     # Hooks for encounter endpoints
├── useAdmin.ts          # Hooks for admin endpoints
└── index.ts             # Barrel export

types/
└── api.ts               # TypeScript interfaces for API data models

providers/
└── QueryProvider.tsx    # React Query provider setup
```

## API Client (`apiClient.ts`)

### Features

- **Base URL Configuration**: Reads from `VITE_API_BASE_URL` environment variable
- **Request Interceptor**: Adds headers and logs requests in development
- **Response Interceptor**: Handles errors and transforms responses
- **Exponential Backoff**: Automatically retries failed requests (500, 503) with exponential backoff
- **Error Transformation**: Converts API errors to a consistent format

### Configuration

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [500, 503],
};
```

### Usage

```typescript
import apiClient from '@/services/apiClient';

// GET request
const response = await apiClient.get('/encounters', { params: { latitude: 40.7128, longitude: -74.0060 } });

// POST request
const response = await apiClient.post('/encounters', { authorName: 'John', ... });

// PUT request
const response = await apiClient.put('/encounters/123/approve');
```

## React Query Hooks

### Encounter Hooks (`useEncounters.ts`)

#### `useEncounters(params, options?)`

Fetch encounters near a location with geospatial query.

```typescript
const { data, isLoading, error } = useEncounters({
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 50, // km
  limit: 100,
});
```

**Cache Strategy**: 5 min stale time, 10 min cache time

#### `useEncounter(id, options?)`

Fetch a single encounter by ID.

```typescript
const { data, isLoading, error } = useEncounter('01HQXYZ123');
```

**Cache Strategy**: 10 min stale time, 30 min cache time

#### `useSubmitEncounter()`

Submit a new encounter.

```typescript
const { mutate, isPending, error } = useSubmitEncounter();

mutate({
  authorName: 'John Doe',
  location: { latitude: 40.7128, longitude: -74.0060 },
  originalStory: 'I saw a ghost...',
  encounterTime: '2024-01-15T22:30:00Z',
  imageCount: 2,
}, {
  onSuccess: (data) => {
    console.log('Encounter submitted:', data.encounterId);
    console.log('Upload URLs:', data.uploadUrls);
  },
});
```

**Cache Invalidation**: Invalidates encounter lists on success

#### `useTriggerEnhancement(id)`

Trigger AI enhancement pipeline after image uploads.

```typescript
const { mutate, isPending } = useTriggerEnhancement('01HQXYZ123');

mutate(undefined, {
  onSuccess: () => {
    console.log('Enhancement triggered');
  },
});
```

**Cache Invalidation**: Invalidates specific encounter detail

#### `useRateEncounter(id)`

Submit a rating for an encounter.

```typescript
const { mutate, isPending } = useRateEncounter('01HQXYZ123');

mutate({
  deviceId: '550e8400-e29b-41d4-a716-446655440000',
  rating: 5,
}, {
  onSuccess: (data) => {
    console.log('New rating:', data.averageRating);
  },
});
```

**Cache Update**: Optimistically updates encounter detail cache

#### `useVerifyLocation(id)`

Submit a location verification.

```typescript
const { mutate, isPending } = useVerifyLocation('01HQXYZ123');

mutate({
  location: { latitude: 40.7128, longitude: -74.0060 },
  spookinessScore: 4,
  notes: 'Very spooky!',
}, {
  onSuccess: (data) => {
    console.log('Verification ID:', data.verificationId);
    console.log('Time matched:', data.isTimeMatched);
  },
});
```

**Cache Invalidation**: Invalidates encounter detail to refetch verification count

### Admin Hooks (`useAdmin.ts`)

#### `usePendingEncounters(params?, options?)`

Fetch pending encounters for admin review.

```typescript
const { data, isLoading } = usePendingEncounters({
  limit: 20,
  nextToken: undefined,
});
```

**Cache Strategy**: 1 min stale time, 5 min cache time (shorter for admin data)

#### `useApproveEncounter(id)`

Approve a pending encounter.

```typescript
const { mutate, isPending } = useApproveEncounter('01HQXYZ123');

mutate(undefined, {
  onSuccess: () => {
    console.log('Encounter approved');
  },
});
```

**Cache Invalidation**: Invalidates pending list and encounter lists

#### `useRejectEncounter(id)`

Reject a pending encounter.

```typescript
const { mutate, isPending } = useRejectEncounter('01HQXYZ123');

mutate({
  reason: 'Inappropriate content',
}, {
  onSuccess: () => {
    console.log('Encounter rejected');
  },
});
```

**Cache Invalidation**: Invalidates pending list

## TypeScript Types (`types/api.ts`)

All API data models and request/response types are defined with full TypeScript support.

### Core Models

- `Location`: Geographic coordinates with optional address
- `Verification`: Location verification data
- `Encounter`: Complete encounter data model
- `UserProfile`: User activity and statistics

### Request/Response Types

Each endpoint has corresponding request and response types:

- `SubmitEncounterRequest` / `SubmitEncounterResponse`
- `GetEncountersParams` / `GetEncountersResponse`
- `RateEncounterRequest` / `RateEncounterResponse`
- `VerifyLocationRequest` / `VerifyLocationResponse`
- And more...

## Query Provider Setup

The `QueryProvider` wraps the application and provides React Query context.

```typescript
// main.tsx
import { QueryProvider } from './providers/QueryProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>
);
```

### Default Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});
```

## Error Handling

All API errors are transformed to a consistent format:

```typescript
interface ApiError {
  message: string;
  errorCode: string;
  status?: number;
  requestId?: string;
  timestamp: string;
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data (400)
- `NOT_FOUND`: Resource not found (404)
- `FORBIDDEN`: Access denied (403)
- `CONFLICT`: Resource conflict, e.g., duplicate rating (409)
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)

### Handling Errors in Components

```typescript
const { data, error } = useEncounters(params);

if (error) {
  console.error('Error code:', error.errorCode);
  console.error('Message:', error.message);
  console.error('Request ID:', error.requestId);
}
```

## Cache Management

### Query Keys

Query keys are organized hierarchically for efficient cache invalidation:

```typescript
// Encounter keys
encounterKeys.all                    // ['encounters']
encounterKeys.lists()                // ['encounters', 'list']
encounterKeys.list(params)           // ['encounters', 'list', params]
encounterKeys.details()              // ['encounters', 'detail']
encounterKeys.detail(id)             // ['encounters', 'detail', id]

// Admin keys
adminKeys.all                        // ['admin']
adminKeys.pending()                  // ['admin', 'pending']
adminKeys.pendingList(params)        // ['admin', 'pending', params]
```

### Manual Cache Invalidation

```typescript
import { queryClient } from '@/providers/QueryProvider';
import { encounterKeys } from '@/hooks';

// Invalidate all encounters
queryClient.invalidateQueries({ queryKey: encounterKeys.all });

// Invalidate specific encounter
queryClient.invalidateQueries({ queryKey: encounterKeys.detail('01HQXYZ123') });
```

## Environment Variables

Required environment variables:

```env
# .env.development
VITE_API_BASE_URL=https://dev-api.ghostatlas.com/api

# .env.production
VITE_API_BASE_URL=https://api.ghostatlas.com/api
```

## Testing

The API service layer can be tested using Mock Service Worker (MSW):

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/encounters', (req, res, ctx) => {
    return res(ctx.json({ encounters: [], count: 0 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Best Practices

1. **Always use hooks**: Don't call `apiClient` directly in components
2. **Handle loading states**: Check `isLoading` and `isPending` flags
3. **Handle errors**: Always handle the `error` state
4. **Optimistic updates**: Use `onMutate` for instant UI feedback
5. **Cache invalidation**: Invalidate related queries after mutations
6. **Type safety**: Use TypeScript types for all API calls

## Related Documentation

- [Backend API Endpoints](../../../ghostatlas-backend/API_ENDPOINTS.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)
