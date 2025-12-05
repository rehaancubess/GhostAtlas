// Location data model
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Verification data model
export interface Verification {
  id: string;
  encounterId: string;
  spookinessScore: number; // 1-5
  notes?: string;
  verifiedAt: string; // ISO 8601
  isTimeMatched: boolean;
  distanceMeters: number;
}

// Encounter data model
export interface Encounter {
  id: string;
  authorName: string;
  location: Location;
  originalStory: string;
  enhancedStory?: string;
  encounterTime: string; // ISO 8601
  imageUrls: string[];
  illustrationUrl?: string;
  illustrationUrls?: string[];
  narrationUrl?: string;
  rating: number;
  ratingCount: number;
  verificationCount: number;
  verifications?: Verification[];
  status: 'pending' | 'approved' | 'rejected' | 'enhancing' | 'enhanced' | null;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Distance in meters (only in geospatial queries)
}

// User profile data model
export interface UserProfile {
  deviceId: string;
  submissionCount: number;
  verificationCount: number;
  ratingCount: number;
  submissions: Encounter[];
  verifications: Verification[];
}

// ============================================
// Request/Response Types for API Endpoints
// ============================================

// Submit Encounter
export interface SubmitEncounterRequest {
  authorName: string;
  location: Location;
  originalStory: string;
  encounterTime: string; // ISO 8601
  imageCount: number; // 0-5
}

export interface SubmitEncounterResponse {
  encounterId: string;
  uploadUrls: string[]; // Presigned S3 URLs
}

// Get Encounters (Geospatial Query)
export interface GetEncountersParams {
  latitude: number;
  longitude: number;
  radius?: number; // km, default: 50, max: 100
  limit?: number; // default: 100, max: 500
}

export interface GetEncountersResponse {
  encounters: Encounter[];
  count: number;
}

// Get Encounter by ID
export interface GetEncounterResponse {
  id: string;
  authorName: string;
  location: Location;
  originalStory: string;
  enhancedStory: string;
  encounterTime: string;
  imageUrls: string[];
  illustrationUrl: string;
  narrationUrl: string;
  rating: number;
  ratingCount: number;
  verificationCount: number;
  verifications: Verification[];
  createdAt: string;
  updatedAt: string;
}

// Rate Encounter
export interface RateEncounterRequest {
  deviceId: string;
  rating: number; // 1-5
}

export interface RateEncounterResponse {
  averageRating: number;
  ratingCount: number;
}

// Verify Location
export interface VerifyLocationRequest {
  location: Location;
  spookinessScore: number; // 1-5
  notes?: string;
}

export interface VerifyLocationResponse {
  verificationId: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

// Trigger Enhancement
export interface TriggerEnhancementResponse {
  message: string;
  encounterId: string;
  status: string;
}

// Admin: List Pending Encounters
export interface GetPendingEncountersParams {
  nextToken?: string;
  limit?: number; // default: 20, max: 100
}

export interface GetPendingEncountersResponse {
  encounters: Encounter[];
  nextToken?: string;
}

// Admin: Approve Encounter
export interface ApproveEncounterResponse {
  status: string;
  encounterId: string;
}

// Admin: Reject Encounter
export interface RejectEncounterRequest {
  reason?: string;
}

export interface RejectEncounterResponse {
  status: string;
  encounterId: string;
}

// Error response type
export interface ApiError {
  message: string;
  errorCode: string;
  status?: number;
  requestId?: string;
  timestamp: string;
}
