import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { VerificationForm } from './VerificationForm';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { useVerifyLocation } from '@/hooks/useEncounters';
import type { Location } from '@/types/api';
import {
  getCurrentPosition,
  checkVerificationEligibility,
  formatDistance,
} from '@/utils/geolocation';

export interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  encounterId: string;
  encounterLocation: Location;
  onSuccess?: (data: { isTimeMatched: boolean; distanceMeters: number }) => void;
}

type VerificationState =
  | { status: 'idle' }
  | { status: 'checking-location' }
  | { status: 'location-error'; error: string }
  | { status: 'too-far'; distance: number }
  | { status: 'eligible'; userLocation: Location; distance: number }
  | { status: 'submitting' }
  | { status: 'success'; isTimeMatched: boolean; distanceMeters: number }
  | { status: 'error'; error: string };

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  encounterId,
  encounterLocation,
  onSuccess,
}) => {
  const [state, setState] = useState<VerificationState>({ status: 'idle' });
  const verifyLocationMutation = useVerifyLocation(encounterId);

  // Check location when modal opens
  useEffect(() => {
    if (isOpen && state.status === 'idle') {
      checkUserLocation();
    }
  }, [isOpen]);

  const checkUserLocation = async () => {
    setState({ status: 'checking-location' });

    try {
      const userLocation = await getCurrentPosition();
      const { isEligible, distance } = checkVerificationEligibility(
        userLocation,
        encounterLocation
      );

      if (isEligible) {
        setState({
          status: 'eligible',
          userLocation,
          distance,
        });
      } else {
        setState({
          status: 'too-far',
          distance,
        });
      }
    } catch (error) {
      setState({
        status: 'location-error',
        error: error instanceof Error ? error.message : 'Failed to get your location',
      });
    }
  };

  const handleSubmit = async (data: { spookinessScore: number; notes?: string }) => {
    if (state.status !== 'eligible') return;

    setState({ status: 'submitting' });

    try {
      const result = await verifyLocationMutation.mutateAsync({
        location: state.userLocation,
        spookinessScore: data.spookinessScore,
        notes: data.notes,
      });

      setState({
        status: 'success',
        isTimeMatched: result.isTimeMatched,
        distanceMeters: result.distanceMeters,
      });

      // Call success callback after a brief delay to show success message
      setTimeout(() => {
        onSuccess?.(result);
        onClose();
      }, 2000);
    } catch (error) {
      setState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to submit verification',
      });
    }
  };

  const handleRetry = () => {
    setState({ status: 'idle' });
    checkUserLocation();
  };

  const handleClose = () => {
    // Reset state when closing
    setState({ status: 'idle' });
    onClose();
  };

  const renderContent = () => {
    switch (state.status) {
      case 'idle':
      case 'checking-location':
        return (
          <div className="py-12">
            <LoadingIndicator message="Checking your location..." />
          </div>
        );

      case 'location-error':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-red-300 font-semibold mb-1">Location Access Required</h3>
                  <p className="text-red-200 text-sm">{state.error}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-ghost-green text-ghost-black font-semibold rounded-lg
                  hover:bg-ghost-green/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-ghost-dark-gray text-ghost-light-gray rounded-lg
                  hover:bg-ghost-dark-gray/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'too-far':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-yellow-300 font-semibold mb-1">Too Far Away</h3>
                  <p className="text-yellow-200 text-sm mb-2">
                    You must be within 50 meters of the encounter location to verify.
                  </p>
                  <p className="text-yellow-200 text-sm">
                    Your distance: <span className="font-bold">{formatDistance(state.distance)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ghost-dark-gray/50 p-4 rounded-lg border border-ghost-green/20">
              <p className="text-ghost-light-gray text-sm">
                <span className="text-ghost-green font-semibold">Tip:</span> Visit the exact location
                where the encounter occurred to submit your verification.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-ghost-dark-gray text-ghost-light-gray rounded-lg
                hover:bg-ghost-dark-gray/80 transition-colors"
            >
              Close
            </button>
          </div>
        );

      case 'eligible':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-ghost-green/10 border border-ghost-green/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-ghost-green flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-ghost-green font-semibold mb-1">Location Verified</h3>
                  <p className="text-ghost-light-gray text-sm">
                    You are {formatDistance(state.distance)} from the encounter location.
                  </p>
                </div>
              </div>
            </div>

            <VerificationForm
              onSubmit={handleSubmit}
              isLoading={false}
              isDisabled={false}
            />
          </div>
        );

      case 'submitting':
        return (
          <div className="py-12">
            <LoadingIndicator message="Submitting your verification..." />
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ghost-green/20 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-ghost-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-creepster text-ghost-green mb-2 text-glow">
                Verification Submitted!
              </h3>
              
              <p className="text-ghost-light-gray mb-4">
                Thank you for verifying this haunted location.
              </p>

              {state.isTimeMatched && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-ghost-green/20 border border-ghost-green/50 rounded-lg">
                  <svg className="w-5 h-5 text-ghost-green" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-ghost-green font-semibold text-sm">
                    Time-Matched Verification
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-red-300 font-semibold mb-1">Submission Failed</h3>
                  <p className="text-red-200 text-sm">{state.error}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-ghost-green text-ghost-black font-semibold rounded-lg
                  hover:bg-ghost-green/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-ghost-dark-gray text-ghost-light-gray rounded-lg
                  hover:bg-ghost-dark-gray/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verify Location"
    >
      {renderContent()}
    </Modal>
  );
};
