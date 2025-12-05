/**
 * Unit tests for GetEncounters Lambda function
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambdas/api/getEncounters';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('GetEncounters Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
  });

  describe('Parameter Validation', () => {
    it('should return 400 when latitude is missing', async () => {
      const event = {
        queryStringParameters: {
          longitude: '0'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('latitude and longitude');
    });

    it('should return 400 when longitude is missing', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('latitude and longitude');
    });

    it('should return 400 when latitude is out of range', async () => {
      const event = {
        queryStringParameters: {
          latitude: '91',
          longitude: '0'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Latitude must be between -90 and 90');
    });

    it('should return 400 when longitude is out of range', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0',
          longitude: '181'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Longitude must be between -180 and 180');
    });

    it('should return 400 when radius is negative', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0',
          longitude: '0',
          radius: '-10'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('radius must be a positive number');
    });

    it('should return 400 when radius exceeds maximum', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0',
          longitude: '0',
          radius: '101'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('radius cannot exceed 100 km');
    });

    it('should return 400 when limit is not a positive integer', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0',
          longitude: '0',
          limit: '-5'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('limit must be a positive integer');
    });

    it('should return 400 when limit exceeds maximum', async () => {
      const event = {
        queryStringParameters: {
          latitude: '0',
          longitude: '0',
          limit: '501'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('limit cannot exceed 500');
    });
  });

  describe('Geospatial Query', () => {
    it('should return empty array when no encounters found', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.encounters).toEqual([]);
      expect(body.count).toBe(0);
    });

    it('should return encounters within radius sorted by distance', async () => {
      // Mock encounters at different distances from query point (40.7128, -74.0060)
      const mockEncounters = [
        {
          id: 'encounter-1',
          authorName: 'John Doe',
          location: {
            latitude: 40.7580, // ~5km away
            longitude: -73.9855
          },
          originalStory: 'Story 1',
          encounterTime: '2024-01-01T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 4.5,
          ratingCount: 10,
          verificationCount: 5
        },
        {
          id: 'encounter-2',
          authorName: 'Jane Smith',
          location: {
            latitude: 40.7489, // ~3km away
            longitude: -73.9680
          },
          originalStory: 'Story 2',
          encounterTime: '2024-01-02T12:00:00Z',
          status: 'approved',
          imageUrls: ['https://example.com/image.jpg'],
          rating: 3.8,
          ratingCount: 5,
          verificationCount: 2
        },
        {
          id: 'encounter-3',
          authorName: 'Bob Johnson',
          location: {
            latitude: 40.7614, // ~6km away
            longitude: -73.9776
          },
          originalStory: 'Story 3',
          encounterTime: '2024-01-03T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 5.0,
          ratingCount: 20,
          verificationCount: 10
        }
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockEncounters
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060',
          radius: '10'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.encounters).toHaveLength(3);
      expect(body.count).toBe(3);

      // Verify encounters are sorted by distance (ascending)
      const distances = body.encounters.map((e: any) => e.distance);
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }

      // Verify required fields are present
      body.encounters.forEach((encounter: any) => {
        expect(encounter).toHaveProperty('id');
        expect(encounter).toHaveProperty('authorName');
        expect(encounter).toHaveProperty('location');
        expect(encounter).toHaveProperty('enhancedStory');
        expect(encounter).toHaveProperty('encounterTime');
        expect(encounter).toHaveProperty('imageUrls');
        expect(encounter).toHaveProperty('rating');
        expect(encounter).toHaveProperty('verificationCount');
        expect(encounter).toHaveProperty('distance');
      });
    });

    it('should filter out encounters beyond radius', async () => {
      const mockEncounters = [
        {
          id: 'encounter-1',
          authorName: 'John Doe',
          location: {
            latitude: 40.7580,
            longitude: -73.9855
          },
          originalStory: 'Story 1',
          encounterTime: '2024-01-01T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 4.5,
          ratingCount: 10,
          verificationCount: 5
        },
        {
          id: 'encounter-2',
          authorName: 'Jane Smith',
          location: {
            latitude: 41.0, // ~30km away
            longitude: -74.0
          },
          originalStory: 'Story 2',
          encounterTime: '2024-01-02T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 3.8,
          ratingCount: 5,
          verificationCount: 2
        }
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockEncounters
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060',
          radius: '10' // 10km radius
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      // Only encounter-1 should be within 10km
      expect(body.encounters).toHaveLength(1);
      expect(body.encounters[0].id).toBe('encounter-1');
    });

    it('should respect limit parameter', async () => {
      const mockEncounters = Array.from({ length: 10 }, (_, i) => ({
        id: `encounter-${i}`,
        authorName: `Author ${i}`,
        location: {
          latitude: 40.7128 + (i * 0.001),
          longitude: -74.0060 + (i * 0.001)
        },
        originalStory: `Story ${i}`,
        encounterTime: '2024-01-01T12:00:00Z',
        status: 'approved',
        imageUrls: [],
        rating: 4.0,
        ratingCount: 5,
        verificationCount: 2
      }));

      ddbMock.on(QueryCommand).resolves({
        Items: mockEncounters
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060',
          limit: '5'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.encounters.length).toBeLessThanOrEqual(5);
    });

    it('should use default values when optional parameters are not provided', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      
      // Verify DynamoDB was queried
      expect(ddbMock.calls()).toHaveLength(1);
    });

    it('should only return approved encounters', async () => {
      const mockEncounters = [
        {
          id: 'encounter-1',
          authorName: 'John Doe',
          location: { latitude: 40.7128, longitude: -74.0060 },
          originalStory: 'Story 1',
          encounterTime: '2024-01-01T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 4.5,
          ratingCount: 10,
          verificationCount: 5
        }
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockEncounters
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
      } as unknown as APIGatewayProxyEvent;

      await handler(event);

      // Verify the query used status="enhanced"
      const calls = ddbMock.calls();
      expect(calls[0].args[0].input).toMatchObject({
        IndexName: 'status-encounterTime-index',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeValues: {
          ':status': 'enhanced'
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle DynamoDB errors gracefully', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
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
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });

    it('should return distance rounded to 2 decimal places', async () => {
      const mockEncounters = [
        {
          id: 'encounter-1',
          authorName: 'John Doe',
          location: {
            latitude: 40.7580,
            longitude: -73.9855
          },
          originalStory: 'Story 1',
          encounterTime: '2024-01-01T12:00:00Z',
          status: 'approved',
          imageUrls: [],
          rating: 4.5,
          ratingCount: 10,
          verificationCount: 5
        }
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockEncounters
      });

      const event = {
        queryStringParameters: {
          latitude: '40.7128',
          longitude: '-74.0060'
        }
      } as unknown as APIGatewayProxyEvent;

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      
      // Check that distance has at most 2 decimal places
      body.encounters.forEach((encounter: any) => {
        const decimalPlaces = (encounter.distance.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });
});
