import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import type {
  GetPendingEncountersParams,
  GetPendingEncountersResponse,
  ApproveEncounterResponse,
  RejectEncounterRequest,
  RejectEncounterResponse,
  ApiError,
} from '@/types/api';
import { encounterKeys } from './useEncounters';

// Query keys for admin cache management
export const adminKeys = {
  all: ['admin'] as const,
  pending: () => [...adminKeys.all, 'pending'] as const,
  pendingList: (params: GetPendingEncountersParams) => [...adminKeys.pending(), params] as const,
};

// ============================================
// GET /admin/encounters - List Pending Encounters
// ============================================

export function usePendingEncounters(
  params: GetPendingEncountersParams = {},
  options?: Omit<UseQueryOptions<GetPendingEncountersResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetPendingEncountersResponse, ApiError>({
    queryKey: adminKeys.pendingList(params),
    queryFn: async () => {
      const response = await apiClient.get<GetPendingEncountersResponse>('/admin/encounters', {
        params,
      });
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (shorter for admin data)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ============================================
// PUT /admin/encounters/:id/approve - Approve Encounter
// ============================================

export function useApproveEncounter(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ApproveEncounterResponse, ApiError, void>({
    mutationFn: async () => {
      const response = await apiClient.put<ApproveEncounterResponse>(
        `/admin/encounters/${id}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate pending encounters list to remove approved encounter
      queryClient.invalidateQueries({ queryKey: adminKeys.pending() });
      
      // Invalidate encounters list to include newly approved encounter
      queryClient.invalidateQueries({ queryKey: encounterKeys.lists() });
      
      // Invalidate the specific encounter detail
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(id) });
    },
  });
}

// ============================================
// PUT /admin/encounters/:id/reject - Reject Encounter
// ============================================

export function useRejectEncounter(id: string) {
  const queryClient = useQueryClient();

  return useMutation<RejectEncounterResponse, ApiError, RejectEncounterRequest | undefined>({
    mutationFn: async (data?: RejectEncounterRequest) => {
      const response = await apiClient.put<RejectEncounterResponse>(
        `/admin/encounters/${id}/reject`,
        data || {}
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate pending encounters list to remove rejected encounter
      queryClient.invalidateQueries({ queryKey: adminKeys.pending() });
      
      // Invalidate the specific encounter detail
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(id) });
    },
  });
}
