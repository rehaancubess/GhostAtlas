/**
 * API Usage Examples
 * 
 * This file demonstrates how to use the API hooks in components.
 * These are examples only and not meant to be used in production.
 */

import { useEncounters, useEncounter, useSubmitEncounter, useRateEncounter } from '@/hooks';

// Example 1: Fetching encounters near a location
export function EncountersList() {
  const { data, isLoading, error } = useEncounters({
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 50,
    limit: 100,
  });

  if (isLoading) return <div>Loading encounters...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Found {data?.count} encounters</h2>
      <ul>
        {data?.encounters.map((encounter) => (
          <li key={encounter.id}>
            {encounter.authorName} - {encounter.location.address}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example 2: Fetching a single encounter
export function EncounterDetail({ id }: { id: string }) {
  const { data, isLoading, error } = useEncounter(id);

  if (isLoading) return <div>Loading encounter...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.authorName}</h2>
      <p>{data.enhancedStory}</p>
      <p>Rating: {data.rating} ({data.ratingCount} ratings)</p>
      <p>Verifications: {data.verificationCount}</p>
    </div>
  );
}

// Example 3: Submitting a new encounter
export function SubmitEncounterForm() {
  const { mutate, isPending, error } = useSubmitEncounter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    mutate({
      authorName: 'John Doe',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
      },
      originalStory: 'I saw a ghost in the old mansion...',
      encounterTime: new Date().toISOString(),
      imageCount: 2,
    }, {
      onSuccess: (data) => {
        console.log('Encounter submitted:', data.encounterId);
        console.log('Upload URLs:', data.uploadUrls);
        // Now upload images to the presigned URLs
      },
      onError: (error) => {
        console.error('Submission failed:', error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Encounter'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  );
}

// Example 4: Rating an encounter
export function RatingButton({ encounterId }: { encounterId: string }) {
  const { mutate, isPending } = useRateEncounter(encounterId);

  const handleRate = (rating: number) => {
    // Get device ID from localStorage or generate one
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);

    mutate({
      deviceId,
      rating,
    }, {
      onSuccess: (data) => {
        console.log('New average rating:', data.averageRating);
        console.log('Total ratings:', data.ratingCount);
      },
      onError: (error) => {
        if (error.errorCode === 'CONFLICT') {
          console.log('You have already rated this encounter');
        } else {
          console.error('Rating failed:', error.message);
        }
      },
    });
  };

  return (
    <div>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => handleRate(rating)}
          disabled={isPending}
        >
          {rating} ⭐
        </button>
      ))}
    </div>
  );
}

// Example 5: Admin - Approving encounters
export function AdminApproveButton({ encounterId }: { encounterId: string }) {
  const { mutate, isPending } = useApproveEncounter(encounterId);

  const handleApprove = () => {
    mutate(undefined, {
      onSuccess: () => {
        console.log('Encounter approved');
      },
      onError: (error) => {
        console.error('Approval failed:', error.message);
      },
    });
  };

  return (
    <button onClick={handleApprove} disabled={isPending}>
      {isPending ? 'Approving...' : 'Approve'}
    </button>
  );
}

// Example 6: Using multiple hooks together
export function EncounterDetailWithRating({ id }: { id: string }) {
  const { data: encounter, isLoading } = useEncounter(id);
  const { mutate: rate, isPending: isRating } = useRateEncounter(id);

  if (isLoading) return <div>Loading...</div>;
  if (!encounter) return null;

  const handleRate = (rating: number) => {
    const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
    
    rate({ deviceId, rating });
  };

  return (
    <div>
      <h2>{encounter.authorName}</h2>
      <p>{encounter.enhancedStory}</p>
      <div>
        <p>Current Rating: {encounter.rating} ({encounter.ratingCount} ratings)</p>
        <div>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              disabled={isRating}
            >
              {rating} ⭐
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Note: Import these hooks in your components
import { useApproveEncounter } from '@/hooks';
