/**
 * Unit tests for RateEncounter Lambda function
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambdas/api/rateEncounter';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

// Mock AWS SDK clients
const dynamoMock = mockClient(DynamoDBDocumentClient);

// Set environment variables
process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
process.env.RATINGS_TABLE = 'test-ratings-table';

describe('RateEncounter Lambda', () => {
  beforeEach(() => {
    // Reset mocks before each test
    dynamoMock.reset();
    dynamoMock.resetHistory();
  });

  const createMockEvent = (encounterId: string, body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: `/api/encounters/${encounterId}/rate`,
    pathParameters: { id: encounterId },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api',
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      path: `/api/encounters/${encounterId}/rate`,
      stage: 'test',
      requestId: 'test-request-id',
      requestTime: '01/Jan/2024:00:00:00 +0000',
      requestTimeEpoch: 1704067200000,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test-agent',
        userArn: null
      },
      authorizer: null,
      resourceId: 'test-resource',
      resourcePath: `/api/encounters/${encounterId}/rate`
    },
    resource: `/api/encounters/{id}/rate`
  });

  describe('Validation', () => {
    it('should reject request without encounter ID', async () => {
      const event = createMockEvent('', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });
      event.pathParameters = null;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Encounter ID is required');
    });

    it('should reject request without body', async () => {
      const event = createMockEvent('test-encounter-id', null);
      event.body = null;

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Request body is required');
    });

    it('should reject invalid JSON', async () => {
      const event = createMockEvent('test-encounter-id', null);
      event.body = 'invalid json{';

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Invalid JSON');
    });

    it('should reject missing deviceId', async () => {
      const event = createMockEvent('test-encounter-id', {
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('deviceId');
    });

    it('should reject missing rating', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('rating');
    });

    it('should reject invalid deviceId format', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: 'not-a-uuid',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('UUID');
    });

    it('should reject rating less than 1', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 0
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('between 1 and 5');
    });

    it('should reject rating greater than 5', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 6
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('between 1 and 5');
    });

    it('should reject non-integer rating', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 3.5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('integer');
    });

    it('should reject non-numeric rating', async () => {
      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 'five'
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('Duplicate Rating Prevention', () => {
    it('should return 409 if device has already rated', async () => {
      // Mock existing rating
      dynamoMock.on(GetCommand).resolves({
        Item: {
          encounterId: 'test-encounter-id',
          deviceId: '550e8400-e29b-41d4-a716-446655440000',
          rating: 4,
          ratedAt: '2024-01-01T12:00:00Z'
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('ALREADY_EXISTS');
      expect(body.message).toBe('Already rated');
    });

    it('should allow rating if device has not rated before', async () => {
      // Mock no existing rating - first GetCommand call (checking for duplicate)
      // Mock encounter exists - second GetCommand call (getting encounter for update)
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 0,
            ratingCount: 0
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 5,
          ratingCount: 1
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Rating Storage and Calculation', () => {
    it('should store rating in Ratings table', async () => {
      let capturedRating: any;

      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 0,
            ratingCount: 0
          }
        });

      dynamoMock.on(PutCommand).callsFake((input) => {
        capturedRating = input.Item;
        return Promise.resolve({});
      });

      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 5,
          ratingCount: 1
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      await handler(event);

      expect(capturedRating).toBeDefined();
      expect(capturedRating.encounterId).toBe('test-encounter-id');
      expect(capturedRating.deviceId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(capturedRating.rating).toBe(5);
      expect(capturedRating.ratedAt).toBeDefined();
    });

    it('should calculate average rating correctly for first rating', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 0,
            ratingCount: 0
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 4,
          ratingCount: 1
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 4
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.averageRating).toBe(4);
      expect(body.ratingCount).toBe(1);
    });

    it('should calculate average rating correctly for multiple ratings', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 4,
            ratingCount: 2
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 4.3,
          ratingCount: 3
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.averageRating).toBe(4.3);
      expect(body.ratingCount).toBe(3);
    });

    it('should round average rating to one decimal place', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 3.5,
            ratingCount: 2
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 3.7,
          ratingCount: 3
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 4
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      // Average should be (3.5*2 + 4) / 3 = 11/3 = 3.666... rounded to 3.7
      expect(body.averageRating).toBe(3.7);
    });

    it('should increment rating count', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 4,
            ratingCount: 5
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 4.2,
          ratingCount: 6
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.ratingCount).toBe(6);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 if encounter does not exist', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({ Item: undefined });

      dynamoMock.on(PutCommand).resolves({});

      const event = createMockEvent('non-existent-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('NOT_FOUND');
      expect(body.message).toContain('Encounter not found');
    });

    it('should handle DynamoDB errors gracefully', async () => {
      dynamoMock.on(GetCommand).rejects(new Error('DynamoDB error'));

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('INTERNAL_ERROR');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      dynamoMock.on(GetCommand)
        .resolvesOnce({ Item: undefined })
        .resolvesOnce({
          Item: {
            id: 'test-encounter-id',
            rating: 0,
            ratingCount: 0
          }
        });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          rating: 5,
          ratingCount: 1
        }
      });

      const event = createMockEvent('test-encounter-id', {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5
      });

      const response = await handler(event);

      expect(response.headers).toBeDefined();
      if (response.headers) {
        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
        expect(response.headers['Content-Type']).toBe('application/json');
      }
    });
  });
});
