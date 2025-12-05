import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import type { Encounter, Verification, ApiError } from '@/types/api';
import { useDeviceStore } from '@/stores/deviceStore';

interface UserProfileData {
  submissions: Encounter[];
  verifications: Verification[];
}

/**
 * Hook to fetch user profile data based on device ID
 * Fetches user's submissions and verifications
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export function useProfile(
  options?: Omit<UseQueryOptions<UserProfileData, ApiError>, 'queryKey' | 'queryFn'>
) {
  const deviceId = useDeviceStore((state) => state.deviceId);

  return useQuery<UserProfileData, ApiError>({
    queryKey: ['profile', deviceId],
    queryFn: async () => {
      if (!deviceId) {
        return { submissions: [], verifications: [] };
      }

      // Since there's no dedicated profile endpoint, we'll need to fetch
      // encounters and filter by device ID on the client side
      // This is a limitation of the current API design
      
      // For now, return empty data structure
      // In a real implementation, we would need backend support for this
      // or store submission/verification IDs in localStorage
      
      // Fetch all encounters (this is not ideal for production)
      // In production, we'd need a proper user profile endpoint
      const encountersResponse = await apiClient.get<{ encounters: Encounter[] }>('/encounters', {
        params: {
          latitude: 0,
          longitude: 0,
          radius: 100,
          limit: 500,
        },
      });

      // Filter submissions by device ID (stored in localStorage)
      // This is a workaround - ideally the backend would provide this
      const submissionIds = getStoredSubmissionIds(deviceId);
      const submissions = encountersResponse.data.encounters.filter((e) =>
        submissionIds.includes(e.id)
      );

      // Get verifications from localStorage
      const verifications = getStoredVerifications(deviceId);

      return {
        submissions,
        verifications,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!deviceId,
    ...options,
  });
}

/**
 * Get submission IDs stored in localStorage for this device
 */
function getStoredSubmissionIds(deviceId: string): string[] {
  try {
    const key = `ghostatlas-submissions-${deviceId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading submission IDs from localStorage:', error);
    return [];
  }
}

/**
 * Store a submission ID in localStorage
 */
export function storeSubmissionId(deviceId: string, encounterId: string): void {
  try {
    const key = `ghostatlas-submissions-${deviceId}`;
    const stored = getStoredSubmissionIds(deviceId);
    if (!stored.includes(encounterId)) {
      stored.push(encounterId);
      localStorage.setItem(key, JSON.stringify(stored));
    }
  } catch (error) {
    console.error('Error storing submission ID:', error);
  }
}

/**
 * Get verifications stored in localStorage for this device
 */
function getStoredVerifications(deviceId: string): Verification[] {
  try {
    const key = `ghostatlas-verifications-${deviceId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading verifications from localStorage:', error);
    return [];
  }
}

/**
 * Store a verification in localStorage
 */
export function storeVerification(deviceId: string, verification: Verification): void {
  try {
    const key = `ghostatlas-verifications-${deviceId}`;
    const stored = getStoredVerifications(deviceId);
    stored.push(verification);
    localStorage.setItem(key, JSON.stringify(stored));
  } catch (error) {
    console.error('Error storing verification:', error);
  }
}
