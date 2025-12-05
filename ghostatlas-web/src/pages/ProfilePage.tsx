import { useState, useEffect } from 'react';
import { ProfileDashboard } from '@/components/profile/ProfileDashboard';
import { SubmissionList } from '@/components/profile/SubmissionList';
import { VerificationList } from '@/components/profile/VerificationList';
import { useProfile } from '@/hooks/useProfile';
import { useDeviceStore } from '@/stores/deviceStore';

type TabType = 'dashboard' | 'submissions' | 'verifications';

/**
 * ProfilePage displays user activity and statistics
 * Shows submissions, verifications, and ratings
 * Uses device ID to track user activity
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { deviceId, initializeDeviceId } = useDeviceStore();
  const { data, isLoading, error } = useProfile();

  // Initialize device ID on mount
  useEffect(() => {
    initializeDeviceId();
  }, [initializeDeviceId]);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'submissions' as TabType, label: 'My Submissions', icon: '📝' },
    { id: 'verifications' as TabType, label: 'My Verifications', icon: '✓' },
  ];

  return (
    <div className="py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-creepster text-4xl md:text-5xl text-ghost-green mb-4 text-glow">
          My Profile
        </h1>
        <p className="text-ghost-gray text-lg">
          Track your paranormal investigations and contributions to the GhostAtlas community.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-red-400 font-medium mb-1">Failed to Load Profile</h3>
              <p className="text-red-300/80 text-sm">
                {error.message || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-ghost-green/30">
          <nav className="flex space-x-8" aria-label="Profile tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-ghost-green text-ghost-green'
                    : 'border-transparent text-ghost-gray hover:text-ghost-green hover:border-ghost-green/50'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'dashboard' && (
          <ProfileDashboard
            submissions={data?.submissions || []}
            verifications={data?.verifications || []}
            deviceId={deviceId || 'Not initialized'}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'submissions' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-creepster text-ghost-green mb-2">My Submissions</h2>
              <p className="text-ghost-gray text-sm">
                View all your submitted encounters and their approval status.
              </p>
            </div>
            <SubmissionList submissions={data?.submissions || []} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'verifications' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-creepster text-ghost-green mb-2">My Verifications</h2>
              <p className="text-ghost-gray text-sm">
                View all locations you've verified and your spookiness ratings.
              </p>
            </div>
            <VerificationList verifications={data?.verifications || []} isLoading={isLoading} />
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-12 bg-ghost-near-black border border-ghost-green/30 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="text-ghost-green flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-ghost-green font-medium mb-2">About Your Profile</h3>
            <p className="text-ghost-gray text-sm leading-relaxed">
              Your profile is tied to your device ID, which is stored locally in your browser. This
              allows you to track your submissions, verifications, and ratings without creating an
              account. If you clear your browser data, you may lose access to your profile history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
