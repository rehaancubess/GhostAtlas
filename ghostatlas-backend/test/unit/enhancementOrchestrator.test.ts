/**
 * Unit tests for EnhancementOrchestrator Lambda function
 */

import { handler } from '../../src/lambdas/enhancement/enhancementOrchestrator';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const ddbMock = mockClient(DynamoDBDocumentClient);
const bedrockMock = mockClient(BedrockRuntimeClient);
const pollyMock = mockClient(PollyClient);
const s3Mock = mockClient(S3Client);

describe('EnhancementOrchestrator Lambda', () => {
  beforeEach(() => {
    ddbMock.reset();
    bedrockMock.reset();
    pollyMock.reset();
    s3Mock.reset();
    
    process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
    process.env.MEDIA_BUCKET = 'test-media-bucket';
    process.env.CLOUDFRONT_DOMAIN = 'test.cloudfront.net';
    process.env.BEDROCK_REGION = 'us-east-1';
  });

  afterEach(() => {
    delete process.env.ENCOUNTERS_TABLE;
    delete process.env.MEDIA_BUCKET;
    delete process.env.CLOUDFRONT_DOMAIN;
    delete process.env.BEDROCK_REGION;
  });

  const createMockSQSEvent = (encounterId: string): SQSEvent => {
    const message = {
      encounterId,
      originalStory: 'I saw a ghost in an old mansion',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
      },
      encounterTime: '2024-01-15T22:00:00Z',
    };

    const record: SQSRecord = {
      messageId: 'msg123',
      receiptHandle: 'receipt123',
      body: JSON.stringify(message),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1234567890',
        SenderId: 'sender123',
        ApproximateFirstReceiveTimestamp: '1234567890',
      },
      messageAttributes: {},
      md5OfBody: 'md5',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789:test-queue',
      awsRegion: 'us-east-1',
    };

    return {
      Records: [record],
    };
  };

  const mockBedrockClaudeResponse = (text: string) => {
    const responseBody = {
      content: [{ text }],
    };
    return {
      body: Buffer.from(JSON.stringify(responseBody)) as any,
    };
  };

  const mockBedrockStableDiffusionResponse = () => {
    const responseBody = {
      artifacts: [
        {
          base64: Buffer.from('fake-image-data').toString('base64'),
        },
      ],
    };
    return {
      body: Buffer.from(JSON.stringify(responseBody)) as any,
    };
  };

  const mockPollyResponse = () => {
    const audioStream = Readable.from([Buffer.from('fake-audio-data')]);
    return {
      AudioStream: audioStream as any,
    };
  };

  test('should successfully orchestrate all enhancement steps', async () => {
    const encounterId = 'encounter123';
    const enhancedStory = 'A chilling tale of supernatural horror...';

    // Mock Bedrock Claude for narrative generation
    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      })
      .resolves(mockBedrockClaudeResponse(enhancedStory));

    // Mock Bedrock Stable Diffusion for illustration
    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'stability.stable-diffusion-xl-v1',
      })
      .resolves(mockBedrockStableDiffusionResponse());

    // Mock S3 uploads
    s3Mock.on(PutObjectCommand).resolves({});

    // Mock Polly for narration
    pollyMock.on(SynthesizeSpeechCommand).resolves(mockPollyResponse());

    // Mock DynamoDB update
    ddbMock.on(UpdateCommand).resolves({});

    const event = createMockSQSEvent(encounterId);
    await handler(event);

    // Verify DynamoDB was updated with all enhancements
    const updateCalls = ddbMock.commandCalls(UpdateCommand);
    expect(updateCalls.length).toBeGreaterThan(0);
    
    const finalUpdate = updateCalls[updateCalls.length - 1];
    expect(finalUpdate.args[0].input.Key?.id).toBe(encounterId);
    expect(finalUpdate.args[0].input.ExpressionAttributeValues?.[':enhancedStory']).toBe(enhancedStory);
    expect(finalUpdate.args[0].input.ExpressionAttributeValues?.[':illustrationUrl']).toContain('illustration.png');
    expect(finalUpdate.args[0].input.ExpressionAttributeValues?.[':narrationUrl']).toContain('narration.mp3');
  });

  test('should update status to enhancement_failed on error', async () => {
    const encounterId = 'encounter123';

    // Mock Bedrock to fail
    bedrockMock.on(InvokeModelCommand).rejects(new Error('Bedrock error'));

    // Mock DynamoDB update for failure status
    ddbMock.on(UpdateCommand).resolves({});

    const event = createMockSQSEvent(encounterId);

    await expect(handler(event)).rejects.toThrow();

    // Verify status was updated to enhancement_failed
    const updateCalls = ddbMock.commandCalls(UpdateCommand);
    expect(updateCalls.length).toBeGreaterThan(0);
    
    const failureUpdate = updateCalls.find(
      (call) => call.args[0].input.ExpressionAttributeValues?.[':status'] === 'enhancement_failed'
    );
    expect(failureUpdate).toBeDefined();
    expect(failureUpdate?.args[0].input.Key?.id).toBe(encounterId);
  });

  test('should handle invalid message format', async () => {
    const record: SQSRecord = {
      messageId: 'msg123',
      receiptHandle: 'receipt123',
      body: JSON.stringify({ invalid: 'message' }),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1234567890',
        SenderId: 'sender123',
        ApproximateFirstReceiveTimestamp: '1234567890',
      },
      messageAttributes: {},
      md5OfBody: 'md5',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:123456789:test-queue',
      awsRegion: 'us-east-1',
    };

    const event: SQSEvent = { Records: [record] };

    await expect(handler(event)).rejects.toThrow('missing required fields');
  });

  test('should save illustration to correct S3 path', async () => {
    const encounterId = 'encounter123';
    const enhancedStory = 'A chilling tale...';

    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      })
      .resolves(mockBedrockClaudeResponse(enhancedStory));

    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'stability.stable-diffusion-xl-v1',
      })
      .resolves(mockBedrockStableDiffusionResponse());

    let capturedS3Key: string | undefined;
    s3Mock.on(PutObjectCommand).callsFake((input) => {
      if (input.ContentType === 'image/png') {
        capturedS3Key = input.Key;
      }
      return {};
    });

    pollyMock.on(SynthesizeSpeechCommand).resolves(mockPollyResponse());
    ddbMock.on(UpdateCommand).resolves({});

    const event = createMockSQSEvent(encounterId);
    await handler(event);

    expect(capturedS3Key).toBe(`encounters/${encounterId}/illustration.png`);
  });

  test('should save narration to correct S3 path', async () => {
    const encounterId = 'encounter123';
    const enhancedStory = 'A chilling tale...';

    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      })
      .resolves(mockBedrockClaudeResponse(enhancedStory));

    bedrockMock
      .on(InvokeModelCommand, {
        modelId: 'stability.stable-diffusion-xl-v1',
      })
      .resolves(mockBedrockStableDiffusionResponse());

    let capturedS3Key: string | undefined;
    s3Mock.on(PutObjectCommand).callsFake((input) => {
      if (input.ContentType === 'audio/mpeg') {
        capturedS3Key = input.Key;
      }
      return {};
    });

    pollyMock.on(SynthesizeSpeechCommand).resolves(mockPollyResponse());
    ddbMock.on(UpdateCommand).resolves({});

    const event = createMockSQSEvent(encounterId);
    await handler(event);

    expect(capturedS3Key).toBe(`encounters/${encounterId}/narration.mp3`);
  });
});
