import React from 'react';
import { Marker } from '@react-google-maps/api';
import type { Encounter } from '@/types/api';

export interface MapMarkerProps {
  encounter: Encounter;
  isHotspot?: boolean;
  onClick?: (encounter: Encounter) => void;
  clusterer?: any;
}

// Custom ghost SVG icon path
const GHOST_ICON_PATH =
  'M12 2C8.13 2 5 5.13 5 9v7l-2 2v2h18v-2l-2-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v7.17l1 1V19H6v-.83l1-1V9c0-2.76 2.24-5 5-5z M9 11c-.83 0-1.5-.67-1.5-1.5S8.17 8 9 8s1.5.67 1.5 1.5S9.83 11 9 11zm6 0c-.83 0-1.5-.67-1.5-1.5S14.17 8 15 8s1.5.67 1.5 1.5S15.83 11 15 11z';

export const MapMarker: React.FC<MapMarkerProps> = ({
  encounter,
  isHotspot = false,
  onClick,
  clusterer,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(encounter);
    }
  };

  // Create custom icon with green glow effect
  const icon: google.maps.Symbol = {
    path: GHOST_ICON_PATH,
    fillColor: '#00ff41',
    fillOpacity: isHotspot ? 1 : 0.8,
    strokeColor: '#00ff41',
    strokeWeight: isHotspot ? 3 : 2,
    scale: isHotspot ? 2 : 1.5,
    anchor: new google.maps.Point(12, 24),
  };

  // Add pulsing animation for hotspots
  const animation = isHotspot ? google.maps.Animation.BOUNCE : undefined;

  return (
    <Marker
      position={{
        lat: encounter.location.latitude,
        lng: encounter.location.longitude,
      }}
      onClick={handleClick}
      icon={icon}
      animation={animation}
      clusterer={clusterer}
      title={encounter.location.address || `Encounter by ${encounter.authorName}`}
    />
  );
};
