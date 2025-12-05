import React, { useState } from 'react';
import type { Encounter } from '@/types/api';
import { useApproveEncounter, useRejectEncounter } from '@/hooks/useAdmin';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

export interface PendingEncounterCardProps {
  encounter: Encounter;
}

/**
 * PendingEncounterCard - Displays full encounter preview for admin review
 * Shows all encounter details including images
 * Provides approve and reject actions with confirmation dialogs
 */
export const PendingEncounterCard: React.FC<PendingEncounterCardProps> = ({ encounter }) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useApproveEncounter(encounter.id);
  const rejectMutation = useRejectEncounter(encounter.id);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      setShowApproveModal(false);
    } catch (error) {
      console.error('Failed to approve encounter:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync(
        rejectReason ? { reason: rejectReason } : undefined
      );
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject encounter:', error);
    }
  };

  return (
    <>
      <article className="bg-ghost-near-black border border-ghost-green/30 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-ghost-green/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-creepster text-ghost-green mb-2">
                {encounter.authorName}'s Encounter
              </h2>
              <div className="flex items-center space-x-4 text-sm text-ghost-gray">
                <span className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-ghost-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
                  <span>
                    {encounter.location.address ||
                      `${encounter.location.latitude.toFixed(4)}, ${encounter.location.longitude.toFixed(4)}`}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-ghost-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <time dateTime={encounter.encounterTime}>
                    {formatDate(encounter.encounterTime)}
                  </time>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 text-xs font-medium rounded-full">
                {encounter.status}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-ghost-gray/70 mb-1">Submitted</p>
              <p className="text-ghost-white">{formatDate(encounter.createdAt)}</p>
            </div>
            <div>
              <p className="text-ghost-gray/70 mb-1">Images</p>
              <p className="text-ghost-white">{encounter.imageUrls.length}</p>
            </div>
            <div>
              <p className="text-ghost-gray/70 mb-1">Rating</p>
              <p className="text-ghost-white">
                {encounter.rating.toFixed(1)} ({encounter.ratingCount})
              </p>
            </div>
            <div>
              <p className="text-ghost-gray/70 mb-1">Verifications</p>
              <p className="text-ghost-white">{encounter.verificationCount}</p>
            </div>
          </div>
        </div>

        {/* Images */}
        {encounter.imageUrls.length > 0 && (
          <div className="p-6 border-b border-ghost-green/20">
            <h3 className="text-lg font-semibold text-ghost-green mb-4">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {encounter.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-ghost-dark-gray border border-ghost-green/20"
                >
                  <img
                    src={url}
                    alt={`Encounter image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Story Content */}
        <div className="p-6 border-b border-ghost-green/20">
          <h3 className="text-lg font-semibold text-ghost-green mb-4">Original Story</h3>
          <div className="prose prose-invert max-w-none">
            <p className="text-ghost-gray leading-relaxed whitespace-pre-wrap">
              {encounter.originalStory}
            </p>
          </div>
        </div>

        {/* Enhanced Content (if available) */}
        {encounter.enhancedStory && (
          <div className="p-6 border-b border-ghost-green/20">
            <h3 className="text-lg font-semibold text-ghost-green mb-4">Enhanced Story</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-ghost-gray leading-relaxed whitespace-pre-wrap">
                {encounter.enhancedStory}
              </p>
            </div>
          </div>
        )}

        {/* AI Generated Content */}
        {(encounter.illustrationUrl || encounter.narrationUrl) && (
          <div className="p-6 border-b border-ghost-green/20">
            <h3 className="text-lg font-semibold text-ghost-green mb-4">AI Generated Content</h3>
            <div className="space-y-4">
              {encounter.illustrationUrl && (
                <div>
                  <p className="text-sm text-ghost-gray mb-2">Illustration</p>
                  <div className="relative w-full max-w-md rounded-lg overflow-hidden bg-ghost-dark-gray border border-ghost-green/20">
                    <img
                      src={encounter.illustrationUrl}
                      alt="AI generated illustration"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
              {encounter.narrationUrl && (
                <div>
                  <p className="text-sm text-ghost-gray mb-2">Narration</p>
                  <audio
                    controls
                    src={encounter.narrationUrl}
                    className="w-full max-w-md"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 bg-ghost-dark-gray/30">
          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={rejectMutation.isPending || approveMutation.isPending}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowApproveModal(true)}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Approve
            </Button>
          </div>
        </div>
      </article>

      {/* Approve Confirmation Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Encounter"
      >
        <div className="space-y-4">
          <p className="text-ghost-gray">
            Are you sure you want to approve this encounter? It will be published and visible to all
            users.
          </p>
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowApproveModal(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={approveMutation.isPending}
            >
              Approve
            </Button>
          </div>
          {approveMutation.isError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded text-sm text-red-400">
              {approveMutation.error?.message || 'Failed to approve encounter'}
            </div>
          )}
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Encounter"
      >
        <div className="space-y-4">
          <p className="text-ghost-gray">
            Are you sure you want to reject this encounter? This action cannot be undone.
          </p>
          <div>
            <label htmlFor="reject-reason" className="block text-sm text-ghost-gray mb-2">
              Reason (optional)
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-ghost-dark-gray border border-ghost-green/30 rounded-md text-ghost-white placeholder-ghost-gray/50 focus:outline-none focus:ring-2 focus:ring-ghost-green focus:border-transparent"
              rows={3}
              placeholder="Enter reason for rejection..."
            />
          </div>
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </div>
          {rejectMutation.isError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded text-sm text-red-400">
              {rejectMutation.error?.message || 'Failed to reject encounter'}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
