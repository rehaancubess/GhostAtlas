/**
 * Unit tests for AdminListPending Lambda function
 */

import { handler } from '../../src/lambdas/api/adminListPending';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('AdminListPending Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
  });

  const createMockEvent = (queryStringParameters?: Record<string, string>): APIGatewayProxyEvent => ({
    httpMethod: 'GET',
    path: '/api/admin/encounters',
    headers: {},
    queryStringParameters: queryStringParameters || null,
    body: null,
    isBase64Encoded: false,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null
  });

  test('should return pending encounters with default pagination', async () => {
    const mockEncounters = [
      {
        id: 'encounter1',
        authorName: 'John Doe',
        location: { latitude: 40.7128, longitude: -74.0060, address: 'New York' },
        originalStory: 'A spooky story',
        encounterTime: '2024-01-15T10:00:00Z',
        status: 'pending',
        imageUrls: ['https://example.com/image1.jpg'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        rating: 0,
        ratingCount: 0,
        verificationCount: 0
      },
      {
        id: 'encounter2',
        authorName: 'Jane Smith',
        location: { latitude: 34.0522, longitude: -118.2437, address: 'Los Angeles' },
        originalStory: 'Another spooky story',
        encounterTime: '2024-01-14T15:30:00Z',
        status: 'pending',
        imageUrls: [],
        createdAt: '2024-01-14T15:30:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
        rating: 0,
        ratingCount: 0,
        verificationCount: 0
      }
    ];

    ddbMock.on(QueryCommand).resolves({
      Items: mockEncounters,
      Count: 2
    });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(2);
    expect(body.count).toBe(2);
    expect(body.encounters[0].id).toBe('encounter1');
    expect(body.encounters[0].status).toBe('pending');
    expect(body.nextToken).toBeUndefined();
  });

  test('should return pending encounters with custom limit', async () => {
    const mockEncounters = Array.from({ length: 10 }, (_, i) => ({
      id: `encounter${i}`,
      authorName: `Author ${i}`,
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: `Story ${i}`,
      encounterTime: `2024-01-${15 - i}T10:00:00Z`,
      status: 'pending',
      imageUrls: [],
      createdAt: `2024-01-${15 - i}T10:00:00Z`,
      updatedAt: `2024-01-${15 - i}T10:00:00Z`,
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    }));

    ddbMock.on(QueryCommand).resolves({
      Items: mockEncounters,
      Count: 10
    });

    const event = createMockEvent({ limit: '10' });
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(10);
    expect(body.count).toBe(10);
  });

  test('should return nextToken when more results available', async () => {
    const mockEncounters = Array.from({ length: 20 }, (_, i) => ({
      id: `encounter${i}`,
      authorName: `Author ${i}`,
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: `Story ${i}`,
      encounterTime: `2024-01-15T${10 + i}:00:00Z`,
      status: 'pending',
      imageUrls: [],
      createdAt: `2024-01-15T${10 + i}:00:00Z`,
      updatedAt: `2024-01-15T${10 + i}:00:00Z`,
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    }));

    ddbMock.on(QueryCommand).resolves({
      Items: mockEncounters,
      Count: 20,
      LastEvaluatedKey: { id: 'encounter19', status: 'pending' }
    });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(20);
    expect(body.nextToken).toBeDefined();
    expect(typeof body.nextToken).toBe('string');
  });

  test('should handle pagination with nextToken', async () => {
    const mockEncounters = [
      {
        id: 'encounter20',
        authorName: 'Author 20',
        location: { latitude: 40.7128, longitude: -74.0060 },
        originalStory: 'Story 20',
        encounterTime: '2024-01-10T10:00:00Z',
        status: 'pending',
        imageUrls: [],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        rating: 0,
        ratingCount: 0,
        verificationCount: 0
      }
    ];

    const lastEvaluatedKey = { id: 'encounter19', status: 'pending' };
    const nextToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');

    ddbMock.on(QueryCommand).resolves({
      Items: mockEncounters,
      Count: 1
    });

    const event = createMockEvent({ nextToken });
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(1);
    expect(body.encounters[0].id).toBe('encounter20');
  });

  test('should return empty array when no pending encounters', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
      Count: 0
    });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(0);
    expect(body.count).toBe(0);
  });

  test('should reject invalid limit parameter', async () => {
    const event = createMockEvent({ limit: 'invalid' });
    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('VALIDATION_ERROR');
    expect(body.message).toContain('positive integer');
  });

  test('should cap limit at maximum page size', async () => {
    const mockEncounters = Array.from({ length: 100 }, (_, i) => ({
      id: `encounter${i}`,
      authorName: `Author ${i}`,
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: `Story ${i}`,
      encounterTime: `2024-01-15T10:00:00Z`,
      status: 'pending',
      imageUrls: [],
      createdAt: `2024-01-15T10:00:00Z`,
      updatedAt: `2024-01-15T10:00:00Z`,
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    }));

    ddbMock.on(QueryCommand).resolves({
      Items: mockEncounters,
      Count: 100
    });

    const event = createMockEvent({ limit: '200' }); // Request more than max
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.encounters).toHaveLength(100); // Should be capped at 100
  });

  test('should handle DynamoDB errors', async () => {
    ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('INTERNAL_ERROR');
  });

  test('should include all required fields in response', async () => {
    const mockEncounter = {
      id: 'encounter1',
      authorName: 'John Doe',
      location: { 
        latitude: 40.7128, 
        longitude: -74.0060, 
        address: '123 Main St, New York, NY',
        geohash: 'dr5reg'
      },
      originalStory: 'A very spooky story about ghosts',
      encounterTime: '2024-01-15T22:30:00Z',
      status: 'pending',
      imageUrls: ['https://cdn.example.com/image1.jpg', 'https://cdn.example.com/image2.jpg'],
      createdAt: '2024-01-15T23:00:00Z',
      updatedAt: '2024-01-15T23:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(QueryCommand).resolves({
      Items: [mockEncounter],
      Count: 1
    });

    const event = createMockEvent();
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    const encounter = body.encounters[0];
    
    // Verify all required fields are present
    expect(encounter.id).toBe('encounter1');
    expect(encounter.authorName).toBe('John Doe');
    expect(encounter.location.latitude).toBe(40.7128);
    expect(encounter.location.longitude).toBe(-74.0060);
    expect(encounter.location.address).toBe('123 Main St, New York, NY');
    expect(encounter.originalStory).toBe('A very spooky story about ghosts');
    expect(encounter.encounterTime).toBe('2024-01-15T22:30:00Z');
    expect(encounter.imageUrls).toEqual(['https://cdn.example.com/image1.jpg', 'https://cdn.example.com/image2.jpg']);
    expect(encounter.createdAt).toBe('2024-01-15T23:00:00Z');
    expect(encounter.status).toBe('pending');
  });
});
