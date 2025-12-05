import { handler } from '../../src/lambdas/api/triggerEnhancement';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sqsMock = mockClient(SQSClient);

describe('TriggerEnhancement Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    sqsMock.reset();
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
    process.env.ENHANCEMENT_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue';
  });

  const createEvent = (encounterId: string): APIGatewayProxyEvent => ({
    httpMethod: 'PUT',
    path: `/api/encounters/${encounterId}/upload-complete`,
    pathParameters: { id: encounterId },
    body: null,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {
      requestId: 'test-request-id',
    } as any,
    resource: '',
    stageVariables: null,
  });

  it('should trigger enhancement for pending encounter', async () => {
    const encounterId = '01HQTEST123456789';
    const encounter = {
      id: encounterId,
      status: 'pending',
      originalStory: 'I saw a ghost',
      location: { latitude: 37.7749, longitude: -122.4194 },
      encounterTime: '2024-01-01T00:00:00Z'
    };

    ddbMock.on(GetCommand).resolves({ Item: encounter });
    ddbMock.on(UpdateCommand).resolves({});
    sqsMock.on(SendMessageCommand).resolves({ MessageId: 'test-message-id' });

    const event = createEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toBe('AI enhancement pipeline triggered');
    expect(body.encounterId).toBe(encounterId);
    expect(body.status).toBe('enhancing');
  });

  it('should return success if already enhancing', async () => {
    const encounterId = '01HQTEST123456789';
    const encounter = {
      id: encounterId,
      status: 'enhancing',
      originalStory: 'I saw a ghost'
    };

    ddbMock.on(GetCommand).resolves({ Item: encounter });

    const event = createEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('already in progress');
  });

  it('should return success if already enhanced', async () => {
    const encounterId = '01HQTEST123456789';
    const encounter = {
      id: encounterId,
      status: 'enhanced',
      originalStory: 'I saw a ghost'
    };

    ddbMock.on(GetCommand).resolves({ Item: encounter });

    const event = createEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.message).toContain('already in progress');
  });

  it('should return 404 if encounter not found', async () => {
    const encounterId = '01HQTEST123456789';

    ddbMock.on(GetCommand).resolves({ Item: undefined });

    const event = createEvent(encounterId);
    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Encounter not found');
  });

  it('should return 400 if encounter ID missing', async () => {
    const event = createEvent('');
    event.pathParameters = null;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Encounter ID is required');
  });
});
