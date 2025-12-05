// Core data models
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Verification {
  id: string;
  encounterId: string;
  spookinessScore: number; // 1-5
  notes?: string;
  verifiedAt: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

export interface Encounter {
  id: string;
  authorName: string;
  location: Location;
  originalStory: string;
  enhancedStory?: string;
  encounterTime: string; // ISO 8601
  imageUrls: string[];
  illustrationUrl?: string;
  narrationUrl?: string;
  rating: number;
  ratingCount: number;
  verificationCount: number;
  verifications?: Verification[];
  status: 'pending' | 'approved' | 'rejected' | 'enhancing';
  createdAt: string;
  updatedAt: string;
}

// API Request/Response types
export interface SubmitEncounterRequest {
  authorName: string;
  location: Location;
  originalStory: string;
  encounterTime: string;
  imageCount: number;
}

export interface SubmitEncounterResponse {
  encounterId: string;
  uploadUrls: string[];
}

export interface RateEncounterRequest {
  deviceId: string;
  rating: number; // 1-5
}

export interface RateEncounterResponse {
  averageRating: number;
  ratingCount: number;
}

export interface VerifyLocationRequest {
  location: Location;
  spookinessScore: number;
  notes?: string;
}

export interface VerifyLocationResponse {
  verificationId: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

export interface UserProfile {
  deviceId: string;
  submissionCount: number;
  verificationCount: number;
  ratingCount: number;
  submissions: Encounter[];
  verifications: Verification[];
}

// Query parameters
export interface EncountersQueryParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  nextToken?: string;
}
