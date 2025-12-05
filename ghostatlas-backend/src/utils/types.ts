/**
 * Shared TypeScript types and interfaces for GhostAtlas Backend
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  geohash?: string;
}

export interface Encounter {
  id: string;
  authorName: string;
  deviceId: string; // Device that submitted the encounter
  location: Location;
  originalStory: string;
  enhancedStory?: string;
  encounterTime: string;
  status: EncounterStatus;
  isPublic: boolean; // Whether story appears on public map (default: true)
  imageUrls: string[]; // User-uploaded images (optional)
  illustrationUrls?: string[]; // AI-generated illustrations (3-5 images)
  narrationUrl?: string;
  rating: number;
  ratingCount: number;
  verificationCount: number;
  commentCount: number; // Number of comments on this encounter
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  encounterId: string;
  authorName: string;
  deviceId: string;
  commentText: string;
  createdAt: string;
}

export type EncounterStatus = 'pending' | 'approved' | 'enhanced' | 'rejected' | 'enhancement_failed';

export interface Verification {
  id: string;
  encounterId: string;
  location: Location;
  spookinessScore: number;
  notes?: string;
  verifiedAt: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

export interface Rating {
  encounterId: string;
  deviceId: string;
  rating: number;
  ratedAt: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Allow-Methods': string;
    [key: string]: string; // Allow additional headers
  };
}

export interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

export interface EnhancementMessage {
  encounterId: string;
  originalStory: string;
  location: Location;
  encounterTime: string;
}
