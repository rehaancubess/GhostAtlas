import React from 'react';
import { HauntedMap } from './HauntedMap';
import type { Encounter } from '@/types/api';

// Mock encounter data for testing
const mockEncounters: Encounter[] = [
  {
    id: '1',
    authorName: 'John Doe',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA',
    },
    originalStory: 'I saw a ghostly figure in the fog...',
    enhancedStory: 'In the depths of the San Francisco fog, a spectral presence emerged...',
    encounterTime: '2024-01-15T22:30:00Z',
    imageUrls: [],
    illustrationUrl: '',
    narrationUrl: '',
    rating: 4.5,
    ratingCount: 12,
    verificationCount: 3,
    status: 'approved',
    createdAt: '2024-01-15T22:30:00Z',
    updatedAt: '2024-01-15T22:30:00Z',
  },
  {
    id: '2',
    authorName: 'Jane Smith',
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'Nob Hill, San Francisco',
    },
    originalStory: 'Strange sounds in the old mansion...',
    enhancedStory: 'The ancient walls echoed with whispers from beyond...',
    encounterTime: '2024-01-20T01:15:00Z',
    imageUrls: [],
    rating: 4.8,
    ratingCount: 25,
    verificationCount: 7,
    status: 'approved',
    createdAt: '2024-01-20T01:15:00Z',
    updatedAt: '2024-01-20T01:15:00Z',
  },
  {
    id: '3',
    authorName: 'Mike Johnson',
    location: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: 'Golden Gate Park',
    },
    originalStory: 'A shadow moved through the trees...',
    enhancedStory: 'Among the ancient redwoods, darkness took form...',
    encounterTime: '2024-02-01T20:00:00Z',
    imageUrls: [],
    rating: 3.9,
    ratingCount: 8,
    verificationCount: 2,
    status: 'approved',
    createdAt: '2024-02-01T20:00:00Z',
    updatedAt: '2024-02-01T20:00:00Z',
  },
];

export const MapDemo: React.FC = () => {
  const handleMarkerClick = (encounter: Encounter) => {
    console.log('Marker clicked:', encounter);
  };

  return (
    <div className="min-h-screen bg-ghost-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-creepster text-ghost-green mb-4 text-glow text-center">
          Haunted Map Demo
        </h1>
        <p className="text-ghost-gray text-center mb-8">
          Testing the map components with mock data
        </p>

        <div className="bg-ghost-black rounded-lg border-2 border-ghost-green/30 overflow-hidden shadow-glow">
          <div className="h-[700px]">
            <HauntedMap
              encounters={mockEncounters}
              center={{ lat: 37.7749, lng: -122.4194 }}
              zoom={12}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-ghost-gray text-sm">
            Displaying <span className="text-ghost-green font-bold">{mockEncounters.length}</span>{' '}
            test encounters
          </p>
        </div>
      </div>
    </div>
  );
};
