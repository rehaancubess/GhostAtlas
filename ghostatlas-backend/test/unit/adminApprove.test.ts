/**
 * Unit tests for AdminApprove Lambda function
 */

import { handler } from '../../src/lambdas/api/adminApprove';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sqsMock = mockClient(SQSClient);

describe('AdminApprove Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    sqsMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
    process.env.ENHANCEMENT_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
    delete process.env.ENHANCEMENT_QUEUE_URL;
  });

  const createMockEvent = (encounterId: string): APIGatewayProxyEvent => ({
    httpMethod: 'PUT',
    path: `/api/admin/encounters/${encounterId}/approve`,
    headers: {},
    queryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    pathParameters: { id: encounterId },
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: null
  });

  test('should approve encounter and publish to SQS', async () => {
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
      Attributes: { ...mockEncounter, status: 'approved', updatedAt: '2024-01-15T23:00:00Z' }
    });
    sqsMock.on(SendMessageCommand).resolves({ MessageId: 'msg123' });

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('approved');
    expect(body.encounterId).toBe(encounterId);
    expect(body.encounter.status).toBe('approved');
    expect(body.message).toContain('approved successfully');
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

  test('should publish correct message to SQS queue', async () => {
    const encounterId = 'encounter123';
    const mockEncounter = {
      id: encounterId,
      authorName: 'John Doe',
      location: { latitude: 40.7128, longitude: -74.0060, address: 'New York' },
      originalStory: 'A spooky story about a haunted house',
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
      Attributes: { ...mockEncounter, status: 'approved' }
    });
    
    let capturedMessage: any;
    sqsMock.on(SendMessageCommand).callsFake((input) => {
      capturedMessage = JSON.parse(input.MessageBody);
      return { MessageId: 'msg123' };
    });

    const event = createMockEvent(encounterId);
    await handler(event);

    expect(capturedMessage).toBeDefined();
    expect(capturedMessage.encounterId).toBe(encounterId);
    expect(capturedMessage.originalStory).toBe('A spooky story about a haunted house');
    expect(capturedMessage.location.latitude).toBe(40.7128);
    expect(capturedMessage.location.longitude).toBe(-74.0060);
    expect(capturedMessage.encounterTime).toBe('2024-01-15T22:00:00Z');
  });

  test('should update encounter status to approved in DynamoDB', async () => {
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
        Attributes: { ...mockEncounter, status: 'approved', updatedAt: new Date().toISOString() }
      };
    });
    
    sqsMock.on(SendMessageCommand).resolves({ MessageId: 'msg123' });

    const event = createMockEvent(encounterId);
    await handler(event);

    expect(capturedUpdate).toBeDefined();
    expect(capturedUpdate.Key.id).toBe(encounterId);
    expect(capturedUpdate.ExpressionAttributeValues[':status']).toBe('approved');
    expect(capturedUpdate.ExpressionAttributeValues[':updatedAt']).toBeDefined();
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

  test('should handle SQS errors', async () => {
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
      Attributes: { ...mockEncounter, status: 'approved' }
    });
    sqsMock.on(SendMessageCommand).rejects(new Error('SQS error'));

    const event = createMockEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.errorCode).toBe('INTERNAL_ERROR');
  });

  test('should include message attributes in SQS message', async () => {
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
      Attributes: { ...mockEncounter, status: 'approved' }
    });
    
    let capturedCommand: any;
    sqsMock.on(SendMessageCommand).callsFake((input) => {
      capturedCommand = input;
      return { MessageId: 'msg123' };
    });

    const event = createMockEvent(encounterId);
    await handler(event);

    expect(capturedCommand.MessageAttributes).toBeDefined();
    expect(capturedCommand.MessageAttributes.encounterId.StringValue).toBe(encounterId);
    expect(capturedCommand.MessageAttributes.action.StringValue).toBe('enhance');
  });
});
