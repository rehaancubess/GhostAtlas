import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import type { Encounter } from '@/types/api';

export interface MapInfoWindowProps {
  encounter: Encounter;
  onClose: () => void;
}

export const MapInfoWindow: React.FC<MapInfoWindowProps> = ({ encounter, onClose }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <InfoWindow
      position={{
        lat: encounter.location.latitude,
        lng: encounter.location.longitude,
      }}
      onCloseClick={onClose}
      options={{
        pixelOffset: new google.maps.Size(0, -30),
      }}
    >
      <div className="bg-ghost-black p-4 max-w-sm rounded-lg border border-ghost-green/20">
        {/* Location Header */}
        <div className="mb-3">
          <h3 className="text-ghost-green font-bold text-lg mb-1 text-glow">
            {encounter.location.address || 'Unknown Location'}
          </h3>
          <p className="text-ghost-gray text-xs">
            {formatDate(encounter.encounterTime)}
          </p>
        </div>

        {/* Author */}
        <div className="mb-3">
          <p className="text-ghost-white text-sm font-medium">
            Reported by {encounter.authorName}
          </p>
        </div>

        {/* Story Preview */}
        <div className="mb-4">
          <p className="text-ghost-gray text-sm line-clamp-3 leading-relaxed">
            {encounter.enhancedStory || encounter.originalStory}
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-ghost-green/20">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-ghost-green"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-ghost-white text-sm font-medium">
                {encounter.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-ghost-gray text-xs">
              ({encounter.ratingCount} {encounter.ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          {/* Verifications */}
          {encounter.verificationCount > 0 && (
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-ghost-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-ghost-white text-xs">
                {encounter.verificationCount} verified
              </span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="mt-4">
          <Link
            to={`/encounter/${encounter.id}`}
            className="block w-full text-center px-4 py-2 bg-ghost-green/10 hover:bg-ghost-green/20 border border-ghost-green text-ghost-green font-medium text-sm rounded transition-colors text-glow"
          >
            View Full Story →
          </Link>
        </div>
      </div>
    </InfoWindow>
  );
};
