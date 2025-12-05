import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Verification } from '@/types/api';

export interface VerificationListProps {
  verifications: Verification[];
  isLoading?: boolean;
}

/**
 * VerificationList component displays user's location verifications
 * Shows spookiness scores with star rating
 * Displays location names and dates
 * Links to verified encounters
 * Requirements: 9.4
 */
export const VerificationList: React.FC<VerificationListProps> = ({
  verifications,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const handleVerificationClick = (encounterId: string) => {
    navigate(`/encounter/${encounterId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= score ? 'text-ghost-green fill-current' : 'text-ghost-gray/30'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 w-48 bg-ghost-dark-gray rounded mb-2" />
                <div className="h-4 w-32 bg-ghost-dark-gray rounded" />
              </div>
              <div className="h-6 w-32 bg-ghost-dark-gray rounded" />
            </div>
            <div className="h-12 bg-ghost-dark-gray rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-12 text-center">
        <div className="text-ghost-gray mb-4">
          <svg
            className="w-16 h-16 mx-auto opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-ghost-gray mb-2">No verifications yet</h3>
        <p className="text-ghost-gray/70 text-sm mb-6">
          Visit haunted locations to verify encounters and contribute to the community.
        </p>
        <a
          href="/stories"
          className="inline-flex items-center justify-center px-6 py-3 bg-ghost-green text-ghost-black font-medium rounded-md hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all duration-200"
        >
          Find Locations to Verify
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <article
          key={verification.id}
          onClick={() => handleVerificationClick(verification.encounterId)}
          className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-ghost-green hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleVerificationClick(verification.encounterId);
            }
          }}
          aria-label={`View encounter verified on ${formatDate(verification.verifiedAt)}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              {/* Verification Icon and Date */}
              <div className="flex items-center space-x-2 mb-2">
                <svg
                  className="w-5 h-5 text-ghost-green flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <time className="text-ghost-gray text-sm" dateTime={verification.verifiedAt}>
                  Verified {formatDate(verification.verifiedAt)}
                </time>
              </div>

              {/* Distance */}
              <div className="flex items-center space-x-2 text-xs text-ghost-gray/70">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{verification.distanceMeters.toFixed(0)}m from encounter location</span>
              </div>
            </div>

            {/* Time Matched Badge */}
            {verification.isTimeMatched && (
              <div className="ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-ghost-green/10 border border-ghost-green/50 text-ghost-green">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Time Matched
                </span>
              </div>
            )}
          </div>

          {/* Spookiness Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ghost-gray">Spookiness Score</span>
              <span className="text-lg font-bold text-ghost-green">
                {verification.spookinessScore}/5
              </span>
            </div>
            {renderStars(verification.spookinessScore)}
          </div>

          {/* Notes */}
          {verification.notes && (
            <div className="mb-4 p-4 bg-ghost-black/50 rounded-md border border-ghost-green/20">
              <p className="text-ghost-gray text-sm italic">"{verification.notes}"</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-ghost-green/20">
            <div className="text-xs text-ghost-gray">
              Encounter ID: <span className="font-mono">{verification.encounterId.slice(0, 8)}...</span>
            </div>
            <div className="text-ghost-green text-sm font-medium flex items-center space-x-1">
              <span>View Encounter</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};
