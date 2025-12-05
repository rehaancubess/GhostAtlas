import React, { useState, useEffect, useMemo } from 'react';
import { HauntedMap } from '@/components/map';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { SearchBar } from '@/components/common/SearchBar';
import { FilterPanel } from '@/components/common/FilterPanel';
import { useEncounters } from '@/hooks/useEncounters';
import { useFilterState } from '@/hooks/useFilterState';
import { useLocationStore } from '@/stores/locationStore';
import type { Encounter } from '@/types/api';

export const MapPage: React.FC = () => {
  const { currentLocation } = useLocationStore();
  const { filters, updateFilters, clearFilters, setSearchLocation } = useFilterState({
    radius: 100,
    sortBy: 'rating',
  });
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default: San Francisco

  // Get user's location on mount
  useEffect(() => {
    if (currentLocation) {
      setMapCenter({ lat: currentLocation.latitude, lng: currentLocation.longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          useLocationStore.getState().setLocation(location);
          setMapCenter({ lat: location.latitude, lng: location.longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Keep default center if geolocation fails
        }
      );
    }
  }, [currentLocation]);

  // Update map center when search location changes
  useEffect(() => {
    if (filters.searchLocation) {
      setMapCenter({
        lat: filters.searchLocation.latitude,
        lng: filters.searchLocation.longitude,
      });
    }
  }, [filters.searchLocation]);

  // Use search location if available, otherwise use current location or default
  const queryLocation = filters.searchLocation || currentLocation || {
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
  };

  // Fetch encounters near the map center
  const { data, isLoading, error } = useEncounters({
    latitude: queryLocation.latitude,
    longitude: queryLocation.longitude,
    radius: filters.radius,
    limit: 500,
  });

  // Sort and filter encounters
  const sortedEncounters = useMemo(() => {
    if (!data?.encounters) return [];

    const approved = data.encounters.filter((e) => e.status === 'approved');

    if (filters.sortBy === 'rating') {
      return approved.sort((a, b) => b.rating - a.rating);
    } else {
      return approved.sort(
        (a, b) => new Date(b.encounterTime).getTime() - new Date(a.encounterTime).getTime()
      );
    }
  }, [data?.encounters, filters.sortBy]);

  const handleMarkerClick = (encounter: Encounter) => {
    console.log('Marker clicked:', encounter);
    // Navigation is handled by the info window link
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-creepster text-ghost-green mb-3 sm:mb-4 text-glow-lg animate-glow-pulse">
            Haunted Map
          </h1>
          <p className="text-ghost-gray text-base sm:text-lg max-w-2xl mx-auto">
            Explore <span className="text-ghost-red text-glow-red font-semibold">paranormal encounters</span> from around the world. Click on markers to view details.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar - Search and Filter Controls */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Location Search */}
              <div className="space-y-3 bg-ghost-dark-gray/50 p-4 rounded-lg border border-ghost-green/30 hover:border-ghost-red/50 transition-all duration-300">
                <label className="block text-sm font-medium text-ghost-green text-glow">
                  📍 Location
                </label>
                <SearchBar
                  onLocationSelect={setSearchLocation}
                  placeholder="Search location..."
                />
                {filters.searchLocation && (
                  <p className="text-xs text-ghost-red text-glow-red">
                    📌 Searching near: {filters.searchLocation.address}
                  </p>
                )}
              </div>

              {/* Filter Panel */}
              <div className="bg-ghost-dark-gray/50 p-4 rounded-lg border border-ghost-green/30 hover:border-ghost-red/50 transition-all duration-300">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                  resultsCount={sortedEncounters.length}
                />
              </div>
            </div>
          </aside>

          {/* Map Container */}
          <div className="flex-1 min-w-0">
            <div className="bg-ghost-black rounded-lg border-2 border-ghost-green/40 overflow-hidden shadow-glow-lg hover:border-ghost-red/40 hover:shadow-glow-red-lg transition-all duration-500">
              {error && (
                <div className="p-8 text-center">
                  <p className="text-ghost-red text-lg mb-2 text-glow-red-lg animate-glow-pulse-red">
                    The spirits are restless... Failed to load encounters.
                  </p>
                  <p className="text-ghost-gray text-sm">{error.message}</p>
                </div>
              )}

              {isLoading && (
                <div className="h-[600px] flex items-center justify-center">
                  <LoadingIndicator message="Summoning haunted locations..." />
                </div>
              )}

              {!isLoading && !error && data && (
                <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px]">
                  <HauntedMap
                    encounters={sortedEncounters}
                    center={mapCenter}
                    zoom={currentLocation ? 12 : 10}
                    onMarkerClick={handleMarkerClick}
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            {data && (
              <div className="mt-6 text-center">
                <p className="text-ghost-gray text-sm">
                  Displaying <span className="text-ghost-green font-bold text-glow">{sortedEncounters.length}</span>{' '}
                  <span className="text-ghost-red">haunted</span> locations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
