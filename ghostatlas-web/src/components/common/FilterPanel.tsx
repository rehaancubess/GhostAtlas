import React from 'react';
import { Button } from './Button';

export type SortOption = 'rating' | 'date';

export interface FilterState {
  radius: number; // km
  sortBy: SortOption;
}

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  resultsCount?: number;
  className?: string;
}

/**
 * FilterPanel component for search and filter controls
 * Includes distance radius slider and sort options
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  resultsCount,
  className = '',
}) => {
  const handleRadiusChange = (radius: number) => {
    onFiltersChange({ ...filters, radius });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const hasActiveFilters = filters.radius !== 50 || filters.sortBy !== 'rating';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-creepster text-2xl text-ghost-green text-glow">
          Filter Stories
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="small"
            onClick={onClearFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      <p className="text-sm text-ghost-gray">
        Discover paranormal encounters from around the world
      </p>

      {/* Sort Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-ghost-green">
          Sort By
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleSortChange('rating')}
            className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 ${
              filters.sortBy === 'rating'
                ? 'bg-ghost-green text-ghost-black font-medium'
                : 'bg-ghost-dark-gray text-ghost-gray hover:bg-ghost-medium-gray hover:text-ghost-green'
            }`}
            aria-pressed={filters.sortBy === 'rating'}
          >
            <div className="flex items-center justify-between">
              <span>Highest Rated</span>
              {filters.sortBy === 'rating' && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 ${
              filters.sortBy === 'date'
                ? 'bg-ghost-green text-ghost-black font-medium'
                : 'bg-ghost-dark-gray text-ghost-gray hover:bg-ghost-medium-gray hover:text-ghost-green'
            }`}
            aria-pressed={filters.sortBy === 'date'}
          >
            <div className="flex items-center justify-between">
              <span>Most Recent</span>
              {filters.sortBy === 'date' && (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Distance Filter */}
      <div className="space-y-3">
        <label htmlFor="radius-slider" className="block text-sm font-medium text-ghost-green">
          Search Radius: {filters.radius} km
        </label>
        <input
          id="radius-slider"
          type="range"
          min="1"
          max="100"
          value={filters.radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-ghost-dark-gray rounded-lg appearance-none cursor-pointer accent-ghost-green slider-thumb"
          aria-label={`Search radius: ${filters.radius} kilometers`}
        />
        <div className="flex justify-between text-xs text-ghost-gray">
          <span>1 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-ghost-green/20">
          <p className="text-xs text-ghost-gray mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.radius !== 50 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-ghost-green/10 border border-ghost-green/30 rounded text-xs text-ghost-green">
                Radius: {filters.radius}km
                <button
                  onClick={() => handleRadiusChange(50)}
                  className="hover:text-ghost-green/70"
                  aria-label="Remove radius filter"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )}
            {filters.sortBy !== 'rating' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-ghost-green/10 border border-ghost-green/30 rounded text-xs text-ghost-green">
                Sort: {filters.sortBy === 'date' ? 'Most Recent' : 'Highest Rated'}
                <button
                  onClick={() => handleSortChange('rating')}
                  className="hover:text-ghost-green/70"
                  aria-label="Remove sort filter"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {resultsCount !== undefined && (
        <div className="pt-4 border-t border-ghost-green/20">
          <p className="text-sm text-ghost-gray">
            <span className="text-ghost-green font-medium">
              {resultsCount}
            </span>{' '}
            {resultsCount === 1 ? 'encounter' : 'encounters'} found
          </p>
        </div>
      )}
    </div>
  );
};
