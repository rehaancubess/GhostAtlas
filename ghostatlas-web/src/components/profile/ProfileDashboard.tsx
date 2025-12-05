import React from 'react';
import type { Encounter, Verification } from '@/types/api';

export interface ProfileDashboardProps {
  submissions: Encounter[];
  verifications: Verification[];
  deviceId: string;
  isLoading?: boolean;
}

/**
 * ProfileDashboard component displays user statistics
 * Shows submission count, verification count, and rating count
 * Styled with horror theme (dark cards, green borders)
 * Requirements: 9.1, 9.2
 */
export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  submissions,
  verifications,
  deviceId,
  isLoading = false,
}) => {
  // Calculate statistics
  const submissionCount = submissions.length;
  const verificationCount = verifications.length;
  
  // Count ratings given (would need to track this separately in a real implementation)
  // For now, we'll show 0 as we don't have a way to track this
  const ratingCount = 0;

  // Calculate approval rate
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const approvalRate = submissionCount > 0 ? (approvedCount / submissionCount) * 100 : 0;

  const stats = [
    {
      label: 'Submissions',
      value: submissionCount,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      description: 'Stories shared',
    },
    {
      label: 'Verifications',
      value: verificationCount,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: 'Locations verified',
    },
    {
      label: 'Ratings Given',
      value: ratingCount,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      description: 'Stories rated',
    },
    {
      label: 'Approval Rate',
      value: `${approvalRate.toFixed(0)}%`,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      description: 'Stories approved',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6 animate-pulse"
          >
            <div className="h-8 w-8 bg-ghost-dark-gray rounded mb-4" />
            <div className="h-8 w-16 bg-ghost-dark-gray rounded mb-2" />
            <div className="h-4 w-24 bg-ghost-dark-gray rounded mb-1" />
            <div className="h-3 w-32 bg-ghost-dark-gray rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Device ID Display */}
      <div className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-ghost-gray mb-1">Device ID</h3>
            <p className="text-xs text-ghost-green font-mono break-all">{deviceId}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(deviceId);
            }}
            className="text-ghost-green hover:text-ghost-green/80 transition-colors"
            title="Copy Device ID"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6 transition-all duration-300 hover:border-ghost-green hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]"
          >
            {/* Icon */}
            <div className="text-ghost-green mb-4">{stat.icon}</div>

            {/* Value */}
            <div className="text-3xl font-bold text-ghost-green mb-2">{stat.value}</div>

            {/* Label */}
            <div className="text-sm font-medium text-ghost-gray mb-1">{stat.label}</div>

            {/* Description */}
            <div className="text-xs text-ghost-gray/70">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      {submissionCount === 0 && verificationCount === 0 && (
        <div className="bg-ghost-near-black border border-ghost-green/30 rounded-lg p-8 text-center">
          <div className="text-ghost-green mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-creepster text-ghost-green mb-2">
            Welcome to GhostAtlas
          </h3>
          <p className="text-ghost-gray mb-6">
            Start your paranormal journey by submitting your first encounter or verifying a
            haunted location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/submit"
              className="inline-flex items-center justify-center px-6 py-3 bg-ghost-green text-ghost-black font-medium rounded-md hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all duration-200"
            >
              Submit Encounter
            </a>
            <a
              href="/stories"
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-ghost-green border border-ghost-green font-medium rounded-md hover:bg-ghost-green hover:text-ghost-black transition-all duration-200"
            >
              Browse Stories
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
