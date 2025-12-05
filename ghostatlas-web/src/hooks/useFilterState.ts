import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SortOption } from '@/components/common/FilterPanel';

export interface FilterState {
  radius: number;
  sortBy: SortOption;
  searchLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const DEFAULT_FILTERS: FilterState = {
  radius: 50,
  sortBy: 'rating',
};

/**
 * Custom hook for managing filter state with URL query params
 * Syncs filter state with URL for shareable filtered views
 */
export function useFilterState(initialFilters: Partial<FilterState> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    const radiusParam = searchParams.get('radius');
    const sortByParam = searchParams.get('sortBy');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const addressParam = searchParams.get('address');

    const urlFilters: Partial<FilterState> = {};

    if (radiusParam) {
      const radius = Number(radiusParam);
      if (!isNaN(radius) && radius >= 1 && radius <= 100) {
        urlFilters.radius = radius;
      }
    }

    if (sortByParam === 'rating' || sortByParam === 'date') {
      urlFilters.sortBy = sortByParam;
    }

    if (latParam && lngParam) {
      const lat = Number(latParam);
      const lng = Number(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        urlFilters.searchLocation = {
          latitude: lat,
          longitude: lng,
          address: addressParam || '',
        };
      }
    }

    return {
      ...DEFAULT_FILTERS,
      ...initialFilters,
      ...urlFilters,
    };
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.radius !== DEFAULT_FILTERS.radius) {
      params.set('radius', filters.radius.toString());
    }

    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
      params.set('sortBy', filters.sortBy);
    }

    if (filters.searchLocation) {
      params.set('lat', filters.searchLocation.latitude.toString());
      params.set('lng', filters.searchLocation.longitude.toString());
      if (filters.searchLocation.address) {
        params.set('address', filters.searchLocation.address);
      }
    }

    // Only update if params changed
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      searchLocation: filters.searchLocation, // Keep search location
    });
  }, [filters.searchLocation]);

  const setSearchLocation = useCallback(
    (location: { latitude: number; longitude: number; address: string }) => {
      setFilters((prev) => ({
        ...prev,
        searchLocation: location,
      }));
    },
    []
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    setSearchLocation,
  };
}
