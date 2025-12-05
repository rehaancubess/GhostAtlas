import { useMemo, useState } from 'react';
import { StoryGrid } from '@/components/stories/StoryGrid';
import { Button } from '@/components/common/Button';
import { useAllEncounters } from '@/hooks/useEncounters';

/**
 * StoriesPage component displays all stories in a simple feed
 * Shows all approved/enhanced encounters by default
 * No location filtering - just a clean story browsing experience
 */
export function StoriesPage() {
  const [showAll, setShowAll] = useState(false);
  
  // Fetch all encounters without location filtering
  const { data, isLoading, error } = useAllEncounters({
    limit: 100,
  });

  // Sort by rating (highest first) and filter by status
  const sortedEncounters = useMemo(() => {
    if (!data?.encounters) return [];

    const encounters = [...data.encounters];
    
    // Filter to show approved and enhanced encounters only
    const approved = encounters.filter((encounter) => 
      encounter.status === 'approved' || encounter.status === 'enhanced'
    );

    // Sort by rating descending (highest first)
    return approved.sort((a, b) => b.rating - a.rating);
  }, [data?.encounters]);

  // Separate unread and read stories (for future implementation)
  // For now, just show all stories
  const displayedEncounters = showAll ? sortedEncounters : sortedEncounters;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 text-center px-4">
        <h1 className="font-creepster text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">
          <span className="text-ghost-green text-glow-lg animate-glow-pulse">Ghost</span>
          <span className="text-ghost-red text-glow-red-lg">Atlas</span>
        </h1>
        <p className="text-ghost-gray text-base sm:text-lg max-w-3xl mx-auto px-4">
          Explore real <span className="text-ghost-red font-semibold">paranormal encounters</span> from around the world. Each story has been verified
          and enhanced by our community.
        </p>
      </div>

      {/* Stats and Controls */}
      {!isLoading && !error && data && (
        <div className="mb-6 text-center px-4">
          <p className="text-ghost-gray text-sm">
            <span className="text-ghost-green font-bold text-glow">{displayedEncounters.length}</span>{' '}
            <span className="text-ghost-red">haunted</span> encounters found
          </p>
        </div>
      )}

      {/* Error State */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-ghost-red/10 border-2 border-ghost-red/50 rounded-lg p-6 mb-8 shadow-red-glow">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-ghost-red flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-ghost-red font-medium mb-1 text-glow-red">
                  The spirits are restless...
                </h3>
                <p className="text-ghost-gray text-sm">
                  {error.message || 'Failed to load encounters. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Story Grid */}
        <StoryGrid
          encounters={displayedEncounters}
          isLoading={isLoading}
          hasMore={false}
          onLoadMore={undefined}
        />
      </div>
    </div>
  );
}
