import React, { useState, useRef, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { config } from '@/utils/config';

export interface SearchBarProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  placeholder?: string;
  className?: string;
}

/**
 * SearchBar component with Google Places Autocomplete
 * Allows users to search for locations and updates encounter query
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  placeholder = 'Search location...',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    const initAutocomplete = async () => {
      if (!inputRef.current || !config.googleMapsApiKey) {
        console.warn('Google Maps API key not configured');
        return;
      }

      try {
        setIsLoading(true);
        
        const loader = new Loader({
          apiKey: config.googleMapsApiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        await loader.load();

        // Create autocomplete instance
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'name'],
        });

        // Listen for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();

          if (place?.geometry?.location) {
            const location = {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
              address: place.formatted_address || place.name || '',
            };

            setInputValue(location.address);
            onLocationSelect(location);
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize Google Places Autocomplete:', error);
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationSelect]);

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full px-4 py-2 pl-10 pr-10 bg-ghost-dark-gray border border-ghost-green/30 rounded-md text-ghost-gray placeholder-ghost-gray/50 focus:outline-none focus:border-ghost-green focus:ring-1 focus:ring-ghost-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-ghost-gray/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Clear Button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-ghost-gray/50 hover:text-ghost-green transition-colors duration-200"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="animate-spin h-5 w-5 text-ghost-green"
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
          </div>
        )}
      </div>
    </div>
  );
};
