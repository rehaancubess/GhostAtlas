import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Encounter } from '@/types/api';

export interface SubmissionListProps {
  submissions: Encounter[];
  isLoading?: boolean;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'enhancing';

/**
 * SubmissionList component displays user's submitted encounters
 * Shows status badges for each submission
 * Allows filtering by status (pending, approved, rejected)
 * Handles click to view encounter details
 * Requirements: 9.3
 */
export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter submissions based on selected status
  const filteredSubmissions = useMemo(() => {
    if (statusFilter === 'all') {
      return submissions;
    }
    return submissions.filter((submission) => submission.status === statusFilter);
  }, [submissions, statusFilter]);

  // Count submissions by status
  const statusCounts = useMemo(() => {
    return {
      all: submissions.length,
      pending: submissions.filter((s) => s.status === 'pending').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
      enhancing: submissions.filter((s) => s.status === 'enhancing').length,
    };
  }, [submissions]);

  const handleSubmissionClick = (encounterId: string, status: string) => {
    // Only navigate to detail page if approved
    if (status === 'approved') {
      navigate(`/encounter/${encounterId}`);
    }
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        label: 'Pending Review',
      },
      approved: {
        bg: 'bg-ghost-green/10',
        border: 'border-ghost-green/50',
        text: 'text-ghost-green',
        label: 'Approved',
      },
      rejected: {
        bg: 'bg-red-900/30',
        border: 'border-red-500/50',
        text: 'text-red-400',
        label: 'Rejected',
      },
      enhancing: {
        bg: 'bg-blue-900/30',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        label: 'Enhancing',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.border} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'enhancing', label: 'Enhancing' },
  ];

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
              <div className="h-6 w-24 bg-ghost-dark-gray rounded" />
            </div>
            <div className="h-16 bg-ghost-dark-gray rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map((button) => (
          <button
            key={button.value}
            onClick={() => setStatusFilter(button.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              statusFilter === button.value
                ? 'bg-ghost-green text-ghost-black shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                : 'bg-ghost-near-black text-ghost-gray border border-ghost-green/30 hover:border-ghost-green/50'
            }`}
          >
            {button.label}
            {statusCounts[button.value] > 0 && (
              <span className="ml-2 opacity-70">({statusCounts[button.value]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-ghost-gray mb-2">
            No {statusFilter !== 'all' ? statusFilter : ''} submissions
          </h3>
          <p className="text-ghost-gray/70 text-sm">
            {statusFilter === 'all'
              ? 'You haven\'t submitted any encounters yet.'
              : `You don't have any ${statusFilter} submissions.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <article
              key={submission.id}
              onClick={() => handleSubmissionClick(submission.id, submission.status)}
              className={`bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6 transition-all duration-300 ${
                submission.status === 'approved'
                  ? 'cursor-pointer hover:border-ghost-green hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                  : 'cursor-default'
              }`}
              role={submission.status === 'approved' ? 'button' : 'article'}
              tabIndex={submission.status === 'approved' ? 0 : undefined}
              onKeyDown={(e) => {
                if (
                  submission.status === 'approved' &&
                  (e.key === 'Enter' || e.key === ' ')
                ) {
                  e.preventDefault();
                  handleSubmissionClick(submission.id, submission.status);
                }
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {/* Location */}
                  <div className="flex items-center space-x-2 mb-2">
                    <svg
                      className="w-4 h-4 text-ghost-green flex-shrink-0"
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
                    <span className="text-ghost-gray text-sm truncate">
                      {submission.location.address ||
                        `${submission.location.latitude.toFixed(4)}, ${submission.location.longitude.toFixed(4)}`}
                    </span>
                  </div>

                  {/* Date */}
                  <time className="text-xs text-ghost-gray/70" dateTime={submission.createdAt}>
                    Submitted {formatDate(submission.createdAt)}
                  </time>
                </div>

                {/* Status Badge */}
                <div className="ml-4">{getStatusBadge(submission.status)}</div>
              </div>

              {/* Story Preview */}
              <p className="text-ghost-gray text-sm line-clamp-3 mb-4">
                {submission.originalStory}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-ghost-green/20">
                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-ghost-gray">
                  {submission.status === 'approved' && (
                    <>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>
                          {submission.rating.toFixed(1)} ({submission.ratingCount})
                        </span>
                      </div>
                      {submission.verificationCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4"
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
                          <span>{submission.verificationCount} verified</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* View Link */}
                {submission.status === 'approved' && (
                  <div className="text-ghost-green text-sm font-medium flex items-center space-x-1">
                    <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
