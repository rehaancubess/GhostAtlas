/**
 * Unit tests for utility functions
 */

import {
  validateCoordinates,
  calculateDistance,
  encodeGeohash,
  decodeGeohash,
  sanitizeInput,
  validateFieldLength,
  validateCoordinateRange,
  validateFileType,
  validateRating,
  createErrorResponse,
  createErrorApiResponse,
  ErrorCode
} from '../../src/utils';

describe('Geospatial Utilities', () => {
  describe('validateCoordinates', () => {
    test('should validate correct coordinates', () => {
      expect(validateCoordinates(0, 0)).toBe(true);
      expect(validateCoordinates(45.5, -122.6)).toBe(true);
      expect(validateCoordinates(90, 180)).toBe(true);
      expect(validateCoordinates(-90, -180)).toBe(true);
    });

    test('should reject invalid coordinates', () => {
      expect(validateCoordinates(91, 0)).toBe(false);
      expect(validateCoordinates(-91, 0)).toBe(false);
      expect(validateCoordinates(0, 181)).toBe(false);
      expect(validateCoordinates(0, -181)).toBe(false);
      expect(validateCoordinates(NaN, 0)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between two points', () => {
      // Distance between New York and Los Angeles (approx 3936 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900000); // meters
      expect(distance).toBeLessThan(4000000);
    });

    test('should return 0 for same coordinates', () => {
      const distance = calculateDistance(45.5, -122.6, 45.5, -122.6);
      expect(distance).toBe(0);
    });
  });

  describe('encodeGeohash', () => {
    test('should encode coordinates to geohash', () => {
      const geohash = encodeGeohash(45.5, -122.6, 6);
      expect(geohash.length).toBe(6);
      expect(typeof geohash).toBe('string');
      
      // Verify round-trip accuracy
      const decoded = decodeGeohash(geohash);
      expect(decoded.latitude).toBeCloseTo(45.5, 1);
      expect(decoded.longitude).toBeCloseTo(-122.6, 1);
    });

    test('should throw error for invalid coordinates', () => {
      expect(() => encodeGeohash(91, 0, 6)).toThrow('Invalid coordinates');
    });
  });

  describe('decodeGeohash', () => {
    test('should decode geohash to coordinates', () => {
      // Use a known geohash and verify it decodes to approximate coordinates
      const geohash = encodeGeohash(40.7128, -74.0060, 6);
      const { latitude, longitude } = decodeGeohash(geohash);
      expect(latitude).toBeCloseTo(40.7128, 1);
      expect(longitude).toBeCloseTo(-74.0060, 1);
    });

    test('should throw error for invalid geohash', () => {
      expect(() => decodeGeohash('')).toThrow('Invalid geohash');
      expect(() => decodeGeohash('invalid!')).toThrow('Invalid geohash character');
    });
  });
});

describe('Validation Utilities', () => {
  describe('sanitizeInput', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    test('should escape special characters', () => {
      const input = 'Test & "quotes"';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      
      // Test HTML tags are removed and content is escaped
      const inputWithTags = '<div>Test</div>';
      const sanitizedWithTags = sanitizeInput(inputWithTags);
      expect(sanitizedWithTags).not.toContain('<div>');
      expect(sanitizedWithTags).toContain('Test');
    });
  });

  describe('validateFieldLength', () => {
    test('should validate field within length limit', () => {
      const result = validateFieldLength('Hello', 10, 'testField');
      expect(result.isValid).toBe(true);
    });

    test('should reject field exceeding length limit', () => {
      const result = validateFieldLength('Hello World!', 5, 'testField');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });
  });

  describe('validateCoordinateRange', () => {
    test('should validate correct coordinate ranges', () => {
      const result = validateCoordinateRange(45.5, -122.6);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid latitude', () => {
      const result = validateCoordinateRange(91, 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Latitude');
    });

    test('should reject invalid longitude', () => {
      const result = validateCoordinateRange(0, 181);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Longitude');
    });
  });

  describe('validateFileType', () => {
    test('should validate allowed image types', () => {
      expect(validateFileType('photo.jpg', 'image/jpeg').isValid).toBe(true);
      expect(validateFileType('photo.png', 'image/png').isValid).toBe(true);
      expect(validateFileType('photo.webp', 'image/webp').isValid).toBe(true);
    });

    test('should reject disallowed file types', () => {
      const result = validateFileType('document.pdf', 'application/pdf');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });
  });

  describe('validateRating', () => {
    test('should validate ratings 1-5', () => {
      expect(validateRating(1).isValid).toBe(true);
      expect(validateRating(3).isValid).toBe(true);
      expect(validateRating(5).isValid).toBe(true);
    });

    test('should reject invalid ratings', () => {
      expect(validateRating(0).isValid).toBe(false);
      expect(validateRating(6).isValid).toBe(false);
      expect(validateRating(3.5).isValid).toBe(false);
    });
  });
});

describe('Error Handler Utilities', () => {
  describe('createErrorResponse', () => {
    test('should create standardized error response', () => {
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Test error message',
        'req-123'
      );
      
      expect(response.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(response.message).toBe('Test error message');
      expect(response.requestId).toBe('req-123');
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('createErrorApiResponse', () => {
    test('should create API Gateway error response', () => {
      const response = createErrorApiResponse(
        ErrorCode.NOT_FOUND,
        'Resource not found'
      );
      
      expect(response.statusCode).toBe(404);
      expect(response.headers['Content-Type']).toBe('application/json');
      
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe(ErrorCode.NOT_FOUND);
      expect(body.message).toBe('Resource not found');
    });

    test('should map error codes to correct HTTP status codes', () => {
      expect(createErrorApiResponse(ErrorCode.VALIDATION_ERROR, 'msg').statusCode).toBe(400);
      expect(createErrorApiResponse(ErrorCode.UNAUTHORIZED, 'msg').statusCode).toBe(401);
      expect(createErrorApiResponse(ErrorCode.FORBIDDEN, 'msg').statusCode).toBe(403);
      expect(createErrorApiResponse(ErrorCode.NOT_FOUND, 'msg').statusCode).toBe(404);
      expect(createErrorApiResponse(ErrorCode.ALREADY_EXISTS, 'msg').statusCode).toBe(409);
      expect(createErrorApiResponse(ErrorCode.RATE_LIMIT_EXCEEDED, 'msg').statusCode).toBe(429);
      expect(createErrorApiResponse(ErrorCode.INTERNAL_ERROR, 'msg').statusCode).toBe(500);
    });
  });
});
