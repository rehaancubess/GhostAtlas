import { StoryCard } from './StoryCard';
import { StoryGrid } from './StoryGrid';
import type { Encounter } from '@/types/api';

/**
 * Demo component to showcase story components
 * This can be used for visual testing and development
 */
export function StoriesDemo() {
  // Mock encounter data
  const mockEncounters: Encounter[] = [
    {
      id: '1',
      authorName: 'Sarah Mitchell',
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: 'Central Park, New York, NY',
      },
      originalStory: 'I saw a ghostly figure near the lake at midnight...',
      enhancedStory:
        'The moon hung low over Central Park as Sarah approached the still waters of the lake. A chill ran down her spine as a translucent figure materialized before her eyes, hovering just above the water\'s surface. The apparition seemed to beckon her closer, its ethereal form shimmering in the pale moonlight...',
      encounterTime: '2024-01-15T00:30:00Z',
      imageUrls: ['https://via.placeholder.com/400x300/0a0a0a/00ff41?text=Ghost+Sighting'],
      illustrationUrl: 'https://via.placeholder.com/800x600/0a0a0a/00ff41?text=AI+Illustration',
      narrationUrl: 'https://example.com/narration1.mp3',
      rating: 4.5,
      ratingCount: 23,
      verificationCount: 5,
      status: 'approved',
      createdAt: '2024-01-15T01:00:00Z',
      updatedAt: '2024-01-15T02:00:00Z',
    },
    {
      id: '2',
      authorName: 'John Doe',
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        address: 'Hollywood Sign, Los Angeles, CA',
      },
      originalStory: 'Strange lights appeared near the Hollywood sign...',
      enhancedStory:
        'As darkness fell over Los Angeles, John witnessed an inexplicable phenomenon. Brilliant green lights danced around the iconic Hollywood sign, pulsing with an otherworldly energy. The air grew thick with an eerie presence, and the temperature dropped dramatically...',
      encounterTime: '2024-02-20T22:15:00Z',
      imageUrls: ['https://via.placeholder.com/400x300/0a0a0a/00ff41?text=Strange+Lights'],
      rating: 4.8,
      ratingCount: 45,
      verificationCount: 12,
      status: 'approved',
      createdAt: '2024-02-20T23:00:00Z',
      updatedAt: '2024-02-21T00:00:00Z',
    },
    {
      id: '3',
      authorName: 'Emily Chen',
      location: {
        latitude: 51.5074,
        longitude: -0.1278,
        address: 'Tower of London, London, UK',
      },
      originalStory: 'I heard footsteps in the empty corridor...',
      enhancedStory:
        'The ancient stones of the Tower of London echoed with phantom footsteps as Emily explored the dimly lit corridors. Each step seemed to be followed by another, unseen presence. The air grew cold, and whispers in an archaic tongue filled her ears...',
      encounterTime: '2024-03-10T19:45:00Z',
      imageUrls: [],
      rating: 3.9,
      ratingCount: 18,
      verificationCount: 3,
      status: 'approved',
      createdAt: '2024-03-10T20:30:00Z',
      updatedAt: '2024-03-10T21:00:00Z',
    },
  ];

  return (
    <div className="space-y-12 py-8">
      {/* Single Card Demo */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-6 text-glow">
          Single Story Card
        </h2>
        <div className="max-w-md">
          <StoryCard encounter={mockEncounters[0]} />
        </div>
      </section>

      {/* Grid Demo */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-6 text-glow">
          Story Grid
        </h2>
        <StoryGrid encounters={mockEncounters} isLoading={false} hasMore={false} />
      </section>

      {/* Loading State Demo */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-6 text-glow">
          Loading State
        </h2>
        <StoryGrid encounters={[]} isLoading={true} hasMore={false} />
      </section>

      {/* Empty State Demo */}
      <section>
        <h2 className="font-creepster text-3xl text-ghost-green mb-6 text-glow">
          Empty State
        </h2>
        <StoryGrid encounters={[]} isLoading={false} hasMore={false} />
      </section>
    </div>
  );
}
