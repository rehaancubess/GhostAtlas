import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/common/Button';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useLocationStore } from '@/stores/locationStore';
import { config } from '@/utils/config';
import type { Location } from '@/types/api';

export interface LocationPickerProps {
  location: Location | null;
  onLocationChange: (location: Location) => void;
}

const libraries: ('places')[] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#1a1a1a' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#000000' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#00FF41' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0a0a0a' }],
    },
  ],
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onLocationChange,
}) => {
  const [manualLat, setManualLat] = useState<string>(location?.latitude.toString() || '');
  const [manualLng, setManualLng] = useState<string>(location?.longitude.toString() || '');
  const [addressSearch, setAddressSearch] = useState<string>(location?.address || '');
  const [searchError, setSearchError] = useState<string>('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const locationStore = useLocationStore();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: config.googleMapsApiKey,
    libraries,
  });

  // Update manual inputs when location prop changes
  useEffect(() => {
    if (location) {
      setManualLat(location.latitude.toString());
      setManualLng(location.longitude.toString());
      if (location.address) {
        setAddressSearch(location.address);
      }
    }
  }, [location]);

  // Initialize autocomplete
  useEffect(() => {
    if (isLoaded && !autocomplete) {
      const input = document.getElementById('address-search') as HTMLInputElement;
      if (input) {
        const ac = new google.maps.places.Autocomplete(input, {
          types: ['geocode'],
        });

        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            onLocationChange({
              latitude: lat,
              longitude: lng,
              address: place.formatted_address,
            });
            setSearchError('');
          }
        });

        setAutocomplete(ac);
      }
    }
  }, [isLoaded, autocomplete, onLocationChange]);

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setSearchError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90) {
      setSearchError('Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setSearchError('Longitude must be between -180 and 180');
      return;
    }

    onLocationChange({
      latitude: lat,
      longitude: lng,
    });
    setSearchError('');
  };

  const handleUseCurrentLocation = async () => {
    await locationStore.requestLocation();

    if (locationStore.error) {
      setSearchError(locationStore.error);
      return;
    }

    if (locationStore.latitude && locationStore.longitude) {
      onLocationChange({
        latitude: locationStore.latitude,
        longitude: locationStore.longitude,
      });
      setSearchError('');
    }
  };

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationChange({
          latitude: lat,
          longitude: lng,
        });
      }
    },
    [onLocationChange]
  );

  if (loadError) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-500">Error loading maps: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <LoadingIndicator message="Loading map..." />;
  }

  const center = location
    ? { lat: location.latitude, lng: location.longitude }
    : defaultCenter;

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div>
        <label htmlFor="address-search" className="block text-ghost-green text-sm font-medium mb-2">
          Search Address
        </label>
        <input
          id="address-search"
          type="text"
          value={addressSearch}
          onChange={(e) => setAddressSearch(e.target.value)}
          placeholder="Enter an address or place name"
          className="w-full px-4 py-2 bg-ghost-dark-gray border border-ghost-green/50 rounded-lg text-ghost-white placeholder-ghost-gray focus:outline-none focus:border-ghost-green focus:ring-1 focus:ring-ghost-green transition-colors"
        />
        <p className="text-ghost-gray text-xs mt-1">
          Start typing to see suggestions
        </p>
      </div>

      {/* Current Location Button */}
      <Button
        variant="secondary"
        onClick={handleUseCurrentLocation}
        loading={locationStore.isLoading}
        className="w-full"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Use Current Location
      </Button>

      {/* Manual Coordinate Entry */}
      <div className="border border-ghost-green/30 rounded-lg p-3 sm:p-4 space-y-3">
        <h3 className="text-ghost-green text-sm font-medium">Manual Coordinates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="manual-lat" className="block text-ghost-gray text-xs mb-1">
              Latitude
            </label>
            <input
              id="manual-lat"
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="40.7128"
              className="w-full px-3 py-2 bg-ghost-dark-gray border border-ghost-green/50 rounded text-ghost-white text-sm placeholder-ghost-gray focus:outline-none focus:border-ghost-green focus:ring-1 focus:ring-ghost-green transition-colors"
            />
          </div>
          <div>
            <label htmlFor="manual-lng" className="block text-ghost-gray text-xs mb-1">
              Longitude
            </label>
            <input
              id="manual-lng"
              type="number"
              step="any"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="-74.0060"
              className="w-full px-3 py-2 bg-ghost-dark-gray border border-ghost-green/50 rounded text-ghost-white text-sm placeholder-ghost-gray focus:outline-none focus:border-ghost-green focus:ring-1 focus:ring-ghost-green transition-colors"
            />
          </div>
        </div>
        <Button variant="ghost" size="small" onClick={handleManualSubmit} className="w-full">
          Set Coordinates
        </Button>
      </div>

      {/* Error Display */}
      {searchError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
          <p className="text-red-500 text-sm">{searchError}</p>
        </div>
      )}

      {/* Map Preview */}
      <div className="border border-ghost-green/50 rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={location ? 15 : 10}
          options={mapOptions}
          onClick={handleMapClick}
        >
          {location && (
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#00FF41',
                fillOpacity: 1,
                strokeColor: '#00FF41',
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>
        <div className="bg-ghost-dark-gray px-4 py-2 text-xs text-ghost-gray">
          {location ? (
            <span>
              Selected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              {location.address && ` • ${location.address}`}
            </span>
          ) : (
            <span>Click on the map to select a location</span>
          )}
        </div>
      </div>
    </div>
  );
};
