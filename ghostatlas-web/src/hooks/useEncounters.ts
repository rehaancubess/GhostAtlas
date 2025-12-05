import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import type {
  GetEncountersParams,
  GetEncountersResponse,
  GetEncounterResponse,
  SubmitEncounterRequest,
  SubmitEncounterResponse,
  TriggerEnhancementResponse,
  RateEncounterRequest,
  RateEncounterResponse,
  VerifyLocationRequest,
  VerifyLocationResponse,
  ApiError,
} from '@/types/api';

// Query keys for cache management
export const encounterKeys = {
  all: ['encounters'] as const,
  lists: () => [...encounterKeys.all, 'list'] as const,
  list: (params: GetEncountersParams) => [...encounterKeys.lists(), params] as const,
  details: () => [...encounterKeys.all, 'detail'] as const,
  detail: (id: string) => [...encounterKeys.details(), id] as const,
};

// ============================================
// GET /api/encounters - Geospatial Query
// ============================================

export function useEncounters(
  params: GetEncountersParams,
  options?: Omit<UseQueryOptions<GetEncountersResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetEncountersResponse, ApiError>({
    queryKey: encounterKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<GetEncountersResponse>('/encounters', {
        params,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    ...options,
  });
}

// ============================================
// GET /api/encounters/all - Get All Encounters (no location filter)
// ============================================

export function useAllEncounters(
  params?: { limit?: number },
  options?: Omit<UseQueryOptions<GetEncountersResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetEncountersResponse, ApiError>({
    queryKey: ['encounters', 'all', params?.limit || 100],
    queryFn: async () => {
      const response = await apiClient.get<GetEncountersResponse>('/encounters/all', {
        params: {
          limit: params?.limit || 100,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ============================================
// GET /api/encounters/:id - Get Single Encounter
// ============================================

export function useEncounter(
  id: string,
  options?: Omit<UseQueryOptions<GetEncounterResponse, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<GetEncounterResponse, ApiError>({
    queryKey: encounterKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<GetEncounterResponse>(`/encounters/${id}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id, // Only run if id is provided
    ...options,
  });
}

// ============================================
// POST /api/encounters - Submit Encounter
// ============================================

export function useSubmitEncounter() {
  const queryClient = useQueryClient();

  return useMutation<SubmitEncounterResponse, ApiError, SubmitEncounterRequest>({
    mutationFn: async (data: SubmitEncounterRequest) => {
      const response = await apiClient.post<SubmitEncounterResponse>('/encounters', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate encounters list to refetch with new submission
      queryClient.invalidateQueries({ queryKey: encounterKeys.lists() });
    },
  });
}

// ============================================
// PUT /api/encounters/:id/upload-complete - Trigger Enhancement
// ============================================

export function useTriggerEnhancement(id: string) {
  const queryClient = useQueryClient();

  return useMutation<TriggerEnhancementResponse, ApiError, void>({
    mutationFn: async () => {
      const response = await apiClient.put<TriggerEnhancementResponse>(
        `/encounters/${id}/upload-complete`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the specific encounter to refetch updated status
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(id) });
    },
  });
}

// ============================================
// POST /api/encounters/:id/rate - Rate Encounter
// ============================================

export function useRateEncounter(id: string) {
  const queryClient = useQueryClient();

  return useMutation<RateEncounterResponse, ApiError, RateEncounterRequest>({
    mutationFn: async (data: RateEncounterRequest) => {
      const response = await apiClient.post<RateEncounterResponse>(
        `/encounters/${id}/rate`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update the encounter detail cache with new rating
      queryClient.setQueryData<GetEncounterResponse>(
        encounterKeys.detail(id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rating: data.averageRating,
            ratingCount: data.ratingCount,
          };
        }
      );

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(id) });
    },
  });
}

// ============================================
// POST /api/encounters/:id/verify - Verify Location
// ============================================

export function useVerifyLocation(id: string) {
  const queryClient = useQueryClient();

  return useMutation<VerifyLocationResponse, ApiError, VerifyLocationRequest>({
    mutationFn: async (data: VerifyLocationRequest) => {
      const response = await apiClient.post<VerifyLocationResponse>(
        `/encounters/${id}/verify`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the encounter detail to refetch with updated verification count
      queryClient.invalidateQueries({ queryKey: encounterKeys.detail(id) });
    },
  });
}
