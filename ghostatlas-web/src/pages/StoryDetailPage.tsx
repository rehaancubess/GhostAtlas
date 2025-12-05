import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEncounter } from '@/hooks/useEncounters';
import { StoryDetail } from '@/components/stories/StoryDetail';
import { Button } from '@/components/common/Button';
import { VerificationModal } from '@/components/verification';

export const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: encounter, isLoading, isError, error } = useEncounter(id || '');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleVerifyClick = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationSuccess = (data: { isTimeMatched: boolean; distanceMeters: number }) => {
    console.log('Verification successful:', data);
    // The modal will close automatically and the encounter data will be refetched
    // due to cache invalidation in the useVerifyLocation hook
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <svg
            className="w-16 h-16 text-ghost-green animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </div>
        <p className="text-ghost-gray mt-4 text-lg">Loading encounter...</p>
      </div>
    );
  }

  if (isError || !encounter) {
    return (
      <div className="py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="font-creepster text-2xl text-ghost-green mb-2 text-glow">
            Encounter Not Found
          </h2>
          <p className="text-ghost-gray mb-6">
            {error?.message || 'The spirits have hidden this encounter from view...'}
          </p>
          <Button variant="primary" onClick={() => navigate('/stories')}>
            Return to Stories
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      </div>

      <StoryDetail
        encounter={encounter}
        onVerifyClick={handleVerifyClick}
      />

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        encounterId={encounter.id}
        encounterLocation={encounter.location}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};
