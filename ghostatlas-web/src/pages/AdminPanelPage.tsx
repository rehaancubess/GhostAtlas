import React, { useState } from 'react';
import { usePendingEncounters } from '@/hooks/useAdmin';
import { PendingEncounterCard } from '@/components/admin';

/**
 * AdminPanelPage - Protected admin interface for reviewing pending encounters
 * Accessible at /admin/panel
 * Fetches and displays pending encounters for approval/rejection
 */
export const AdminPanelPage: React.FC = () => {
  const [limit] = useState(20);
  const { data, isLoading, isError, error } = usePendingEncounters({ limit });

  if (isLoading) {
    return (
      <div className="py-8">
        <h1 className="font-creepster text-4xl text-ghost-green mb-8 text-glow">
          Admin Panel
        </h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-ghost-green border-t-transparent rounded-full animate-spin" />
            <p className="text-ghost-gray">Loading pending encounters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8">
        <h1 className="font-creepster text-4xl text-ghost-green mb-8 text-glow">
          Admin Panel
        </h1>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Encounters</h2>
          <p className="text-ghost-gray">{error?.message || 'Failed to load pending encounters'}</p>
        </div>
      </div>
    );
  }

  const encounters = data?.encounters || [];

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="font-creepster text-4xl text-ghost-green mb-2 text-glow">
          Admin Panel
        </h1>
        <p className="text-ghost-gray">
          Review and moderate pending ghost encounters
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 p-4 bg-ghost-near-black border border-ghost-green/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ghost-gray">Pending Encounters</p>
            <p className="text-2xl font-bold text-ghost-green">{encounters.length}</p>
          </div>
          {data?.nextToken && (
            <div className="text-sm text-ghost-gray">
              More encounters available
            </div>
          )}
        </div>
      </div>

      {/* Pending Encounters List */}
      {encounters.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-ghost-green opacity-50"
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
          <h2 className="text-xl font-creepster text-ghost-green mb-2">
            All Clear
          </h2>
          <p className="text-ghost-gray">
            No pending encounters to review at this time
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {encounters.map((encounter) => (
            <PendingEncounterCard key={encounter.id} encounter={encounter} />
          ))}
        </div>
      )}
    </div>
  );
};
