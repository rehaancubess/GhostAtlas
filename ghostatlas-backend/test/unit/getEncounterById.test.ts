/**
 * Unit tests for GetEncounterById Lambda function
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambdas/api/getEncounterById';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('GetEncounterById Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
    process.env.VERIFICATIONS_TABLE = 'test-verifications-table';
    process.env.RATINGS_TABLE = 'test-ratings-table';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
    delete process.env.VERIFICATIONS_TABLE;
    delete process.env.RATINGS_TABLE;
  });

  describe('Parameter Validation', () => {
    it('should return 400 when encounter ID is missing', async () => {
      const event = {
        pathParameters: null
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Encounter ID is required');
    });

    it('should return 400 when encounter ID is empty', async () => {
      const event = {
        pathParameters: {}
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Encounter ID is required');
    });
  });

  describe('Encounter Retrieval', () => {
    it('should return 404 when encounter does not exist', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: undefined
      });

      const event = {
        pathParameters: {
          id: 'non-existent-id'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(404);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('NOT_FOUND');
      expect(body.message).toBe('Encounter not found');
    });

    it('should return 403 when encounter status is pending', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'pending',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(403);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('FORBIDDEN');
      expect(body.message).toBe('This encounter is not available for viewing');
    });

    it('should return 403 when encounter status is rejected', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'rejected',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(403);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('FORBIDDEN');
    });

    it('should return 403 when encounter status is enhancement_failed', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'enhancement_failed',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(403);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('FORBIDDEN');
    });
  });

  describe('Complete Encounter Details', () => {
    it('should return complete encounter details with verifications and ratings', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Haunted St, New York, NY'
        },
        originalStory: 'A spooky story',
        enhancedStory: 'An enhanced spooky story with atmospheric details',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: ['https://cdn.example.com/image1.jpg', 'https://cdn.example.com/image2.jpg'],
        illustrationUrl: 'https://cdn.example.com/illustration.png',
        narrationUrl: 'https://cdn.example.com/narration.mp3',
        rating: 4.5,
        ratingCount: 10,
        verificationCount: 3,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T14:00:00Z'
      };

      const mockVerifications = [
        {
          id: 'verification-1',
          encounterId: 'encounter-1',
          location: {
            latitude: 40.7128,
            longitude: -74.0060
          },
          spookinessScore: 5,
          notes: 'Very spooky indeed',
          verifiedAt: '2024-01-02T12:00:00Z',
          isTimeMatched: true,
          distanceMeters: 10
        },
        {
          id: 'verification-2',
          encounterId: 'encounter-1',
          location: {
            latitude: 40.7129,
            longitude: -74.0061
          },
          spookinessScore: 4,
          verifiedAt: '2024-01-03T12:00:00Z',
          isTimeMatched: false,
          distanceMeters: 50
        }
      ];

      const mockRatings = [
        {
          encounterId: 'encounter-1',
          deviceId: 'device-1',
          rating: 5,
          ratedAt: '2024-01-02T10:00:00Z'
        },
        {
          encounterId: 'encounter-1',
          deviceId: 'device-2',
          rating: 4,
          ratedAt: '2024-01-02T11:00:00Z'
        },
        {
          encounterId: 'encounter-1',
          deviceId: 'device-3',
          rating: 5,
          ratedAt: '2024-01-02T12:00:00Z'
        }
      ];

      ddbMock.reset();
      
      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      // Mock verifications and ratings queries separately
      let queryCallCount = 0;
      ddbMock.on(QueryCommand).callsFake(() => {
        queryCallCount++;
        if (queryCallCount === 1) {
          // First call is for verifications
          return Promise.resolve({ Items: mockVerifications });
        } else {
          // Second call is for ratings
          return Promise.resolve({ Items: mockRatings });
        }
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      // Verify all required encounter fields are present
      expect(body).toHaveProperty('id', 'encounter-1');
      expect(body).toHaveProperty('authorName', 'John Doe');
      expect(body).toHaveProperty('location');
      expect(body.location).toHaveProperty('latitude', 40.7128);
      expect(body.location).toHaveProperty('longitude', -74.0060);
      expect(body.location).toHaveProperty('address', '123 Haunted St, New York, NY');
      expect(body).toHaveProperty('originalStory', 'A spooky story');
      expect(body).toHaveProperty('enhancedStory', 'An enhanced spooky story with atmospheric details');
      expect(body).toHaveProperty('encounterTime', '2024-01-01T12:00:00Z');
      expect(body).toHaveProperty('imageUrls');
      expect(body.imageUrls).toHaveLength(2);
      expect(body).toHaveProperty('illustrationUrl', 'https://cdn.example.com/illustration.png');
      expect(body).toHaveProperty('narrationUrl', 'https://cdn.example.com/narration.mp3');
      expect(body).toHaveProperty('rating', 4.5);
      expect(body).toHaveProperty('ratingCount', 10);
      expect(body).toHaveProperty('verificationCount', 3);
      expect(body).toHaveProperty('createdAt', '2024-01-01T10:00:00Z');
      expect(body).toHaveProperty('updatedAt', '2024-01-01T14:00:00Z');

      // Verify verifications are included
      expect(body).toHaveProperty('verifications');
      expect(body.verifications).toHaveLength(2);
      expect(body.verifications[0]).toHaveProperty('id', 'verification-1');
      expect(body.verifications[0]).toHaveProperty('spookinessScore', 5);
      expect(body.verifications[0]).toHaveProperty('isTimeMatched', true);
      expect(body.verifications[0]).toHaveProperty('distanceMeters', 10);

      // Verify rating statistics are included
      expect(body).toHaveProperty('ratingStats');
      expect(body.ratingStats).toHaveProperty('averageRating', 4.5);
      expect(body.ratingStats).toHaveProperty('ratingCount', 10);
      expect(body.ratingStats).toHaveProperty('ratingDistribution');
      expect(body.ratingStats.ratingDistribution).toHaveProperty('5', 2);
      expect(body.ratingStats.ratingDistribution).toHaveProperty('4', 1);
    });

    it('should handle encounter with no verifications or ratings', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      expect(body.verifications).toEqual([]);
      expect(body.ratingStats.averageRating).toBe(0);
      expect(body.ratingStats.ratingCount).toBe(0);
      expect(body.ratingStats.ratingDistribution).toEqual({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      });
    });

    it('should handle encounter with missing optional fields', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);

      expect(body.enhancedStory).toBeUndefined();
      expect(body.illustrationUrl).toBeUndefined();
      expect(body.narrationUrl).toBeUndefined();
      expect(body.rating).toBe(0);
      expect(body.ratingCount).toBe(0);
      expect(body.verificationCount).toBe(0);
    });
  });

  describe('Cache Headers', () => {
    it('should include CloudFront cache headers with 86400s TTL', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Cache-Control');
      expect(result.headers?.['Cache-Control']).toBe('public, max-age=86400');
      expect(result.headers).toHaveProperty('Expires');
    });
  });

  describe('Error Handling', () => {
    it('should handle DynamoDB GetCommand errors gracefully', async () => {
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('INTERNAL_ERROR');
      expect(body.message).toBe('An error occurred while retrieving encounter details');
    });

    it('should handle DynamoDB QueryCommand errors gracefully', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB query error'));

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('INTERNAL_ERROR');
    });
  });

  describe('Response Format', () => {
    it('should include CORS headers', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });

    it('should return valid JSON', async () => {
      const mockEncounter = {
        id: 'encounter-1',
        authorName: 'John Doe',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 0,
        ratingCount: 0,
        verificationCount: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z'
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockEncounter
      });

      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        pathParameters: {
          id: 'encounter-1'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(() => JSON.parse(result.body)).not.toThrow();
    });
  });
});
