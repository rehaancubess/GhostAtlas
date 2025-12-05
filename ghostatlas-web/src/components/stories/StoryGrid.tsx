import React, { useEffect, useRef, useCallback } from 'react';
import { StoryCard } from './StoryCard';
import type { Encounter } from '@/types/api';

export interface StoryGridProps {
  encounters: Encounter[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * StoryGrid component displays encounters in a responsive grid layout
 * Implements infinite scroll with Intersection Observer
 * Shows loading skeletons and empty state
 */
export const StoryGrid: React.FC<StoryGridProps> = ({
  encounters,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className = '',
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px', // Trigger 100px before reaching the bottom
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  // Empty state
  if (!isLoading && encounters.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center space-y-4 max-w-md">
          <svg
            className="w-24 h-24 mx-auto text-ghost-green/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-creepster text-2xl text-ghost-green text-glow">
            No Encounters Found
          </h3>
          <p className="text-ghost-gray">
            The spirits are silent in this area... Try adjusting your search or explore a different location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Grid Layout - Responsive 1-3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {encounters.map((encounter) => (
          <StoryCard key={encounter.id} encounter={encounter} />
        ))}

        {/* Loading Skeletons */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && <div ref={observerTarget} className="h-10" />}

      {/* Loading More Indicator */}
      {isLoading && encounters.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-3 text-ghost-green">
            <svg
              className="animate-spin h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">Summoning more stories...</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Loading skeleton component for story cards
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-ghost-near-black border border-ghost-green/30 rounded-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-ghost-dark-gray loading-skeleton" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Location and date */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-ghost-dark-gray rounded loading-skeleton" />
          <div className="h-4 w-20 bg-ghost-dark-gray rounded loading-skeleton" />
        </div>

        {/* Author */}
        <div className="h-4 w-24 bg-ghost-dark-gray rounded loading-skeleton" />

        {/* Preview text */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-ghost-dark-gray rounded loading-skeleton" />
          <div className="h-3 w-full bg-ghost-dark-gray rounded loading-skeleton" />
          <div className="h-3 w-3/4 bg-ghost-dark-gray rounded loading-skeleton" />
        </div>

        {/* Rating and stats */}
        <div className="flex items-center justify-between pt-2 border-t border-ghost-green/20">
          <div className="h-4 w-24 bg-ghost-dark-gray rounded loading-skeleton" />
          <div className="h-4 w-20 bg-ghost-dark-gray rounded loading-skeleton" />
        </div>
      </div>
    </div>
  );
};
