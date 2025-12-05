import React, { useState, useCallback, useMemo } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  StandaloneSearchBox,
  MarkerClusterer,
} from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';
import { config } from '@/utils/config';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { MapInfoWindow } from './MapInfoWindow';
import type { Encounter } from '@/types/api';

// Google Maps libraries to load
const libraries: Libraries = ['places'];

// Dark theme map styles
const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#00ff41' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f1f0f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0a0a0a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2a2a2a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#000000' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00ff41' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#000000' }],
  },
];

// Map container style - responsive height
const getContainerStyle = () => ({
  width: '100%',
  height: '100%',
  minHeight: window.innerWidth < 768 ? '400px' : '500px', // Shorter on mobile
});

// Default center (San Francisco)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

export interface HauntedMapProps {
  encounters: Encounter[];
  onMarkerClick?: (encounter: Encounter) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

export const HauntedMap: React.FC<HauntedMapProps> = ({
  encounters,
  onMarkerClick,
  center = defaultCenter,
  zoom = 10,
  className = '',
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [containerStyle, setContainerStyle] = useState(getContainerStyle());

  // Update container style on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setContainerStyle(getContainerStyle());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: config.googleMapsApiKey,
    libraries,
  });

  // Map options
  const mapOptions = useMemo(
    () => ({
      styles: darkMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    }),
    []
  );

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle search box load
  const onSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  }, []);

  // Handle place selection from search
  const onPlacesChanged = useCallback(() => {
    if (searchBox && map) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          map.panTo(place.geometry.location);
          map.setZoom(13);
        }
      }
    }
  }, [searchBox, map]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (encounter: Encounter) => {
      setSelectedEncounter(encounter);
      if (onMarkerClick) {
        onMarkerClick(encounter);
      }
    },
    [onMarkerClick]
  );

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedEncounter(null);
  }, []);

  // Group encounters by location for hotspot detection
  const encountersByLocation = useMemo(() => {
    const grouped = new Map<string, Encounter[]>();
    encounters.forEach((encounter) => {
      const key = `${encounter.location.latitude.toFixed(4)},${encounter.location.longitude.toFixed(4)}`;
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, encounter]);
    });
    return grouped;
  }, [encounters]);

  // Determine if clustering should be enabled (>50 markers)
  const shouldCluster = encounters.length > 50;

  // Clusterer options
  const clustererOptions = useMemo(
    () => ({
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      gridSize: 60,
      minimumClusterSize: 2,
      styles: [
        {
          textColor: '#00ff41',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTMiIGhlaWdodD0iNTMiIHZpZXdCb3g9IjAgMCA1MyA1MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyNi41IiBjeT0iMjYuNSIgcj0iMjYuNSIgZmlsbD0iIzAwZmY0MSIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyNi41IiBjeT0iMjYuNSIgcj0iMTgiIGZpbGw9IiMwMGZmNDEiIGZpbGwtb3BhY2l0eT0iMC42Ii8+PC9zdmc+',
          height: 53,
          width: 53,
        },
      ],
    }),
    []
  );

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-ghost-black ${className}`}>
        <div className="text-center p-8">
          <p className="text-ghost-red text-lg mb-4">
            The spirits are restless... Failed to load the map.
          </p>
          <p className="text-ghost-gray text-sm">
            Please check your Google Maps API key configuration.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-ghost-black ${className}`}>
        <LoadingIndicator message="Summoning the haunted map..." />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Box */}
      <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-2 sm:px-4">
        <StandaloneSearchBox onLoad={onSearchBoxLoad} onPlacesChanged={onPlacesChanged}>
          <input
            type="text"
            placeholder="Search location..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-ghost-black border-2 border-ghost-green text-ghost-white placeholder-ghost-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-ghost-green focus:border-transparent text-glow"
          />
        </StandaloneSearchBox>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {shouldCluster ? (
          // Use clustering for performance when >50 markers
          <MarkerClusterer options={clustererOptions}>
            {(clusterer) => (
              <>
                {encounters.map((encounter) => (
                  <Marker
                    key={encounter.id}
                    position={{
                      lat: encounter.location.latitude,
                      lng: encounter.location.longitude,
                    }}
                    onClick={() => handleMarkerClick(encounter)}
                    clusterer={clusterer}
                    icon={{
                      path: 'M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7z',
                      fillColor: '#00ff41',
                      fillOpacity: 0.8,
                      strokeColor: '#00ff41',
                      strokeWeight: 2,
                      scale: 1.5,
                    }}
                  />
                ))}
              </>
            )}
          </MarkerClusterer>
        ) : (
          // Render markers directly when <50
          encounters.map((encounter) => {
            const locationKey = `${encounter.location.latitude.toFixed(4)},${encounter.location.longitude.toFixed(4)}`;
            const encountersAtLocation = encountersByLocation.get(locationKey) || [];
            const isHotspot = encountersAtLocation.length > 1;

            return (
              <Marker
                key={encounter.id}
                position={{
                  lat: encounter.location.latitude,
                  lng: encounter.location.longitude,
                }}
                onClick={() => handleMarkerClick(encounter)}
                icon={{
                  path: 'M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7z',
                  fillColor: '#00ff41',
                  fillOpacity: isHotspot ? 1 : 0.8,
                  strokeColor: '#00ff41',
                  strokeWeight: isHotspot ? 3 : 2,
                  scale: isHotspot ? 2 : 1.5,
                }}
                animation={isHotspot ? google.maps.Animation.BOUNCE : undefined}
              />
            );
          })
        )}

        {/* Info Window */}
        {selectedEncounter && (
          <MapInfoWindow encounter={selectedEncounter} onClose={handleInfoWindowClose} />
        )}
      </GoogleMap>
    </div>
  );
};
