/**
 * Validation utility functions for GhostAtlas Backend
 * Provides input sanitization, field length validation, and file type validation
 */

import { validateCoordinates } from './geospatial';

/**
 * Allowed image MIME types for file uploads
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Allowed image file extensions
 */
const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
];

/**
 * Sanitizes input string to prevent XSS attacks
 * Removes or escapes potentially dangerous characters and HTML tags
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters that could be used for XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Validates field length against maximum allowed length
 * 
 * @param value - Value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field (for error messages)
 * @returns Validation result with isValid flag and optional error message
 */
export function validateFieldLength(
  value: string,
  maxLength: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} must be a string`
    };
  }
  
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} exceeds maximum length of ${maxLength} characters`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates that a required field is present and not empty
 * 
 * @param value - Value to validate
 * @param fieldName - Name of the field (for error messages)
 * @returns Validation result with isValid flag and optional error message
 */
export function validateRequiredField(
  value: any,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (value === undefined || value === null) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} cannot be empty`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates coordinate ranges
 * Latitude: -90 to 90 degrees
 * Longitude: -180 to 180 degrees
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateCoordinateRange(
  latitude: number,
  longitude: number
): { isValid: boolean; error?: string } {
  if (!validateCoordinates(latitude, longitude)) {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
      return {
        isValid: false,
        error: 'Latitude must be a valid number'
      };
    }
    
    if (typeof longitude !== 'number' || isNaN(longitude)) {
      return {
        isValid: false,
        error: 'Longitude must be a valid number'
      };
    }
    
    if (latitude < -90 || latitude > 90) {
      return {
        isValid: false,
        error: 'Latitude must be between -90 and 90 degrees'
      };
    }
    
    if (longitude < -180 || longitude > 180) {
      return {
        isValid: false,
        error: 'Longitude must be between -180 and 180 degrees'
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validates file type for image uploads
 * Checks both MIME type and file extension
 * 
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 * @returns Validation result with isValid flag and optional error message
 */
export function validateFileType(
  filename: string,
  mimeType: string
): { isValid: boolean; error?: string } {
  if (!filename || typeof filename !== 'string') {
    return {
      isValid: false,
      error: 'Filename is required'
    };
  }
  
  if (!mimeType || typeof mimeType !== 'string') {
    return {
      isValid: false,
      error: 'MIME type is required'
    };
  }
  
  // Check MIME type
  const normalizedMimeType = mimeType.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(normalizedMimeType)) {
    return {
      isValid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: JPEG, PNG, WebP`
    };
  }
  
  // Check file extension
  const lowerFilename = filename.toLowerCase();
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some(ext => 
    lowerFilename.endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: `File extension is not allowed. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates rating value (1-5)
 * 
 * @param rating - Rating value to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateRating(rating: number): { isValid: boolean; error?: string } {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return {
      isValid: false,
      error: 'Rating must be a number'
    };
  }
  
  if (!Number.isInteger(rating)) {
    return {
      isValid: false,
      error: 'Rating must be an integer'
    };
  }
  
  if (rating < 1 || rating > 5) {
    return {
      isValid: false,
      error: 'Rating must be between 1 and 5'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates spookiness score (0-10, decimal allowed)
 * 
 * @param score - Spookiness score to validate
 * @returns Validation result with isValid flag and optional error message
 */
export function validateSpookinessScore(score: number): { isValid: boolean; error?: string } {
  if (typeof score !== 'number' || isNaN(score)) {
    return {
      isValid: false,
      error: 'Spookiness score must be a number'
    };
  }
  
  if (score < 0 || score > 10) {
    return {
      isValid: false,
      error: 'Spookiness score must be between 0 and 10'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates encounter submission data
 * 
 * @param data - Encounter submission data
 * @returns Validation result with isValid flag and optional errors array
 */
export function validateEncounterSubmission(data: any): {
  isValid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];
  const isPublic = data.isPublic !== false; // Default to true if not specified
  
  // Validate required fields
  const authorNameCheck = validateRequiredField(data.authorName, 'authorName');
  if (!authorNameCheck.isValid) {
    errors.push(authorNameCheck.error!);
  }
  
  const originalStoryCheck = validateRequiredField(data.originalStory, 'originalStory');
  if (!originalStoryCheck.isValid) {
    errors.push(originalStoryCheck.error!);
  }
  
  // Only validate encounterTime for public stories
  if (isPublic) {
    const encounterTimeCheck = validateRequiredField(data.encounterTime, 'encounterTime');
    if (!encounterTimeCheck.isValid) {
      errors.push(encounterTimeCheck.error!);
    }
  }
  
  // Validate field lengths
  if (data.authorName) {
    const lengthCheck = validateFieldLength(data.authorName, 100, 'authorName');
    if (!lengthCheck.isValid) {
      errors.push(lengthCheck.error!);
    }
  }
  
  if (data.originalStory) {
    const lengthCheck = validateFieldLength(data.originalStory, 5000, 'originalStory');
    if (!lengthCheck.isValid) {
      errors.push(lengthCheck.error!);
    }
  }
  
  // Only validate location for public stories
  if (isPublic) {
    if (!data.location) {
      errors.push('location is required for public stories');
    } else {
      const coordCheck = validateCoordinateRange(
        data.location.latitude,
        data.location.longitude
      );
      if (!coordCheck.isValid) {
        errors.push(coordCheck.error!);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
