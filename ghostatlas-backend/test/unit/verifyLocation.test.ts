/**
 * Unit tests for VerifyLocation Lambda function
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../src/lambdas/api/verifyLocation';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

// Mock AWS SDK clients
const dynamoMock = mockClient(DynamoDBDocumentClient);

// Set environment variables
process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
process.env.VERIFICATIONS_TABLE = 'test-verifications-table';

describe('VerifyLocation Lambda', () => {
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
    path: `/api/encounters/${encounterId}/verify`,
    pathParameters: { id: encounterId },
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api',
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      path: `/api/encounters/${encounterId}/verify`,
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
      resourcePath: `/api/encounters/${encounterId}/verify`
    },
    resource: `/api/encounters/{id}/verify`
  });

  describe('Validation', () => {
    it('should reject request without encounter ID', async () => {
      const event = createMockEvent('', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
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

    it('should reject missing location', async () => {
      const event = createMockEvent('test-encounter-id', {
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('location');
    });

    it('should reject missing spookinessScore', async () => {
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 }
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('spookinessScore');
    });

    it('should reject spookinessScore less than 0', async () => {
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: -1
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('between 0 and 10');
    });

    it('should reject spookinessScore greater than 10', async () => {
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 11
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('between 0 and 10');
    });

    it('should accept decimal spookinessScore', async () => {
      // Mock DynamoDB to return an encounter
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });
      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 7.5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('verificationId');
      expect(body).toHaveProperty('isTimeMatched');
    });

    it('should reject invalid latitude', async () => {
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 91, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Latitude');
    });

    it('should reject invalid longitude', async () => {
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -181 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('Longitude');
    });

    it('should reject notes exceeding 500 characters', async () => {
      const longNotes = 'a'.repeat(501);
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5,
        notes: longNotes
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('500 characters');
    });

    it('should accept valid notes within 500 characters', async () => {
      const validNotes = 'This place is really spooky!';
      
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5,
        notes: validNotes
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Distance Validation', () => {
    it('should reject verification more than 100 meters away', async () => {
      // Mock encounter at specific location
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 }, // New York
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      // Verification location ~200 meters away
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7148, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('VALIDATION_ERROR');
      expect(body.message).toContain('meters from encounter location');
      expect(body.message).toContain('100 meters');
    });

    it('should accept verification within 100 meters', async () => {
      // Mock encounter at specific location
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      // Verification location ~50 meters away
      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.71325, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });

    it('should accept verification at exact same location', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Time Matching', () => {
    it('should match time within 2 hour window', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z' // Noon
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      // Mock current time to be 1 hour later (13:00)
      const originalDate = Date;
      global.Date = class extends originalDate {
        constructor(value?: any) {
          super();
          // If no arguments, return mocked time; otherwise parse normally
          if (value === undefined) {
            return new originalDate('2024-01-01T13:00:00Z');
          }
          return new originalDate(value);
        }
        static now() {
          return new originalDate('2024-01-01T13:00:00Z').getTime();
        }
      } as any;

      const response = await handler(event);

      global.Date = originalDate;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.isTimeMatched).toBe(true);
    });

    it('should not match time outside 2 hour window', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z' // Noon
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      // Mock current time to be 3 hours later (15:00)
      const originalDate = Date;
      global.Date = class extends originalDate {
        constructor(value?: any) {
          super();
          // If no arguments, return mocked time; otherwise parse normally
          if (value === undefined) {
            return new originalDate('2024-01-01T15:00:00Z');
          }
          return new originalDate(value);
        }
        static now() {
          return new originalDate('2024-01-01T15:00:00Z').getTime();
        }
      } as any;

      const response = await handler(event);

      global.Date = originalDate;

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.isTimeMatched).toBe(false);
    });
  });

  describe('Verification Storage', () => {
    it('should store verification in Verifications table', async () => {
      let capturedVerification: any;

      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).callsFake((input) => {
        capturedVerification = input.Item;
        return Promise.resolve({});
      });

      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 4,
        notes: 'Very spooky place!'
      });

      await handler(event);

      expect(capturedVerification).toBeDefined();
      expect(capturedVerification.encounterId).toBe('test-encounter-id');
      expect(capturedVerification.location.latitude).toBe(40.7128);
      expect(capturedVerification.location.longitude).toBe(-74.0060);
      expect(capturedVerification.spookinessScore).toBe(4);
      expect(capturedVerification.notes).toBe('Very spooky place!');
      expect(capturedVerification.verifiedAt).toBeDefined();
      expect(capturedVerification.isTimeMatched).toBeDefined();
      expect(capturedVerification.distanceMeters).toBeDefined();
      expect(capturedVerification.id).toBeDefined();
    });

    it('should increment encounter verification count', async () => {
      let updateExpression: string | undefined;

      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        updateExpression = input.UpdateExpression;
        return Promise.resolve({});
      });

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      await handler(event);

      expect(updateExpression).toBeDefined();
      expect(updateExpression).toContain('verificationCount');
    });

    it('should return verification ID and time match status', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.verificationId).toBeDefined();
      expect(typeof body.verificationId).toBe('string');
      expect(body.isTimeMatched).toBeDefined();
      expect(typeof body.isTimeMatched).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 if encounter does not exist', async () => {
      dynamoMock.on(GetCommand).resolves({ Item: undefined });

      const event = createMockEvent('non-existent-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
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
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.errorCode).toBe('INTERNAL_ERROR');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: 'test-encounter-id',
          location: { latitude: 40.7128, longitude: -74.0060 },
          encounterTime: '2024-01-01T12:00:00Z'
        }
      });

      dynamoMock.on(PutCommand).resolves({});
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockEvent('test-encounter-id', {
        location: { latitude: 40.7128, longitude: -74.0060 },
        spookinessScore: 5
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
