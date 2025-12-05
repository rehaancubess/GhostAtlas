/**
 * Unit tests for AdminReject Lambda function
 */

import { handler } from '../../src/lambdas/api/adminReject';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('AdminReject Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
  });

  const createMockEvent = (encounterId: string, body?: string): APIGatewayProxyEvent => ({
    httpMethod: 'PUT',
    path: `/api/admin/encounters/${encounterId}/reject`,
    headers: {},
    queryStringParameters: null,
    body: body || null,
    isBase64Encoded: false,
    pathParameters: { id: encounterId },
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null
  });

  test('should reject encounter without reason', async () => {
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060, address: 'New York' },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: ['https://example.com/image1.jpg'],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { ...mockEncounter, status: 'rejected', updatedAt: '2024-01-15T23:00:00Z' }
    });

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('rejected');
    expect(body.encounterId).toBe(encounterId);
    expect(body.encounter.status).toBe('rejected');
    expect(body.message).toContain('rejected successfully');
  });

  test('should reject encounter with reason', async () => {
    const encounterId = 'encounter123';
    const rejectionReason = 'Inappropriate content';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { 
        ...mockEncounter, 
        status: 'rejected', 
        rejectionReason,
        updatedAt: '2024-01-15T23:00:00Z' 
      }
    });

    const event = createMockEvent(encounterId, JSON.stringify({ reason: rejectionReason }));
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('rejected');
    expect(body.encounter.rejectionReason).toBe(rejectionReason);
  });

  test('should return 404 when encounter does not exist', async () => {
    const encounterId = 'nonexistent';

    ddbMock.on(GetCommand).resolves({ Item: undefined });

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('NOT_FOUND');
    expect(body.message).toContain('not found');
  });

  test('should return 400 when encounter ID is missing', async () => {
    const event = createMockEvent('');
    event.pathParameters = null;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('VALIDATION_ERROR');
    expect(body.message).toContain('required');
  });

  test('should update encounter status to rejected in DynamoDB', async () => {
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    
    let capturedUpdate: any;
    ddbMock.on(UpdateCommand).callsFake((input) => {
      capturedUpdate = input;
      return {
        Attributes: { ...mockEncounter, status: 'rejected', updatedAt: new Date().toISOString() }
      };
    });

    const event = createMockEvent(encounterId);
    await handler(event);

    expect(capturedUpdate).toBeDefined();
    expect(capturedUpdate.Key.id).toBe(encounterId);
    expect(capturedUpdate.ExpressionAttributeValues[':status']).toBe('rejected');
    expect(capturedUpdate.ExpressionAttributeValues[':updatedAt']).toBeDefined();
  });

  test('should store rejection reason when provided', async () => {
    const encounterId = 'encounter123';
    const rejectionReason = 'Low quality submission';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    
    let capturedUpdate: any;
    ddbMock.on(UpdateCommand).callsFake((input) => {
      capturedUpdate = input;
      return {
        Attributes: { 
          ...mockEncounter, 
          status: 'rejected', 
          rejectionReason,
          updatedAt: new Date().toISOString() 
        }
      };
    });

    const event = createMockEvent(encounterId, JSON.stringify({ reason: rejectionReason }));
    await handler(event);

    expect(capturedUpdate).toBeDefined();
    expect(capturedUpdate.ExpressionAttributeValues[':rejectionReason']).toBe(rejectionReason);
    expect(capturedUpdate.UpdateExpression).toContain('rejectionReason');
  });

  test('should handle invalid JSON in request body gracefully', async () => {
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { ...mockEncounter, status: 'rejected', updatedAt: '2024-01-15T23:00:00Z' }
    });

    const event = createMockEvent(encounterId, 'invalid json');
    const result = await handler(event);

    // Should still succeed, just without rejection reason
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('rejected');
  });

  test('should handle DynamoDB errors', async () => {
    const encounterId = 'encounter123';

    ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'));

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('INTERNAL_ERROR');
  });

  test('should not trigger enhancement pipeline', async () => {
    // This test verifies that no SQS message is sent
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'pending',
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { ...mockEncounter, status: 'rejected', updatedAt: '2024-01-15T23:00:00Z' }
    });

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    // The function should complete successfully without calling SQS
    // (No SQS mock is set up, so if it tried to call SQS, it would fail)
  });

  test('should handle rejection of already rejected encounter', async () => {
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060 },
      originalStory: 'A spooky story',
      encounterTime: '2024-01-15T22:00:00Z',
      status: 'rejected', // Already rejected
      imageUrls: [],
      createdAt: '2024-01-15T22:00:00Z',
      updatedAt: '2024-01-15T22:00:00Z',
      rating: 0,
      ratingCount: 0,
      verificationCount: 0
    };

    ddbMock.on(GetCommand).resolves({ Item: mockEncounter });
    ddbMock.on(UpdateCommand).resolves({
      Attributes: { ...mockEncounter, updatedAt: '2024-01-15T23:00:00Z' }
    });

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    // Should still succeed (idempotent operation)
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('rejected');
  });
});
