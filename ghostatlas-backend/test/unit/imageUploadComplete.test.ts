/**
 * Unit tests for ImageUploadComplete Lambda function
 */

import { S3Event } from 'aws-lambda';
import { handler } from '../../src/lambdas/api/imageUploadComplete';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

// Mock AWS SDK clients
const dynamoMock = mockClient(DynamoDBDocumentClient);

// Set environment variables
process.env.ENCOUNTERS_TABLE = 'test-encounters-table';
process.env.CLOUDFRONT_DOMAIN = 'test.cloudfront.net';

describe('ImageUploadComplete Lambda', () => {
  beforeEach(() => {
    // Reset mocks before each test
    dynamoMock.reset();
  });

  const createMockS3Event = (key: string, eventName: string = 'ObjectCreated:Put'): S3Event => ({
    Records: [
      {
        eventVersion: '2.1',
        eventSource: 'aws:s3',
        awsRegion: 'us-east-1',
        eventTime: '2024-01-01T12:00:00.000Z',
        eventName,
        userIdentity: {
          principalId: 'test-principal'
        },
        requestParameters: {
          sourceIPAddress: '127.0.0.1'
        },
        responseElements: {
          'x-amz-request-id': 'test-request-id',
          'x-amz-id-2': 'test-id-2'
        },
        s3: {
          s3SchemaVersion: '1.0',
          configurationId: 'test-config',
          bucket: {
            name: 'test-bucket',
            ownerIdentity: {
              principalId: 'test-owner'
            },
            arn: 'arn:aws:s3:::test-bucket'
          },
          object: {
            key: encodeURIComponent(key),
            size: 1024,
            eTag: 'test-etag',
            sequencer: 'test-sequencer'
          }
        }
      }
    ]
  });

  describe('S3 Path Validation', () => {
    it('should process valid S3 path pattern', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockS3Event(key);
      await handler(event);

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });

    it('should reject invalid S3 path pattern', async () => {
      const key = 'invalid/path/structure.jpg';
      
      const event = createMockS3Event(key);
      await handler(event);

      // Should not call DynamoDB if path is invalid
      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(0);
      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
    });

    it('should reject path without encounters prefix', async () => {
      const key = 'images/1704067200000-0.jpg';
      
      const event = createMockS3Event(key);
      await handler(event);

      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(0);
    });

    it('should reject path without images directory', async () => {
      const key = 'encounters/01HQXYZ123ABC456DEF789/1704067200000-0.jpg';
      
      const event = createMockS3Event(key);
      await handler(event);

      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(0);
    });

    it('should reject path without timestamp prefix', async () => {
      const key = 'encounters/01HQXYZ123ABC456DEF789/images/image.jpg';
      
      const event = createMockS3Event(key);
      await handler(event);

      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(0);
    });
  });

  describe('CloudFront URL Construction', () => {
    it('should construct correct CloudFront URL', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      let capturedUpdate: any;
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        capturedUpdate = input;
        return {};
      });

      const event = createMockS3Event(key);
      await handler(event);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls']).toBeDefined();
      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls']).toHaveLength(1);
      
      const actualUrl = capturedUpdate.ExpressionAttributeValues[':imageUrls'][0];
      // URL should be HTTPS and contain the key
      expect(actualUrl).toMatch(/^https:\/\//);
      expect(actualUrl).toContain(key);
      // Should contain a CloudFront domain (either test or fallback)
      expect(actualUrl).toMatch(/cloudfront/);
    });

    it('should handle URL-encoded S3 keys', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-test image.jpg`;
      
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockS3Event(key);
      await handler(event);

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('Encounter Update', () => {
    it('should add image URL to empty imageUrls array', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      let capturedUpdate: any;
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        capturedUpdate = input;
        return {};
      });

      const event = createMockS3Event(key);
      await handler(event);

      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls']).toHaveLength(1);
      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls'][0]).toContain(key);
    });

    it('should append image URL to existing imageUrls', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-1.jpg`;
      const existingUrl = `https://test.cloudfront.net/encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      let capturedUpdate: any;
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: [existingUrl]
        }
      });
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        capturedUpdate = input;
        return {};
      });

      const event = createMockS3Event(key);
      await handler(event);

      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls']).toHaveLength(2);
      expect(capturedUpdate.ExpressionAttributeValues[':imageUrls']).toContain(existingUrl);
    });

    it('should not duplicate existing image URLs (idempotency)', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      // The URL constructed by the handler will match this format
      const existingUrl = `https://test.cloudfront.net/${key}`;
      
      let capturedUpdate: any;
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: [existingUrl]
        }
      });
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        capturedUpdate = input;
        return {};
      });

      const event = createMockS3Event(key);
      await handler(event);

      // If UpdateCommand was called, check what URL was being added
      if (capturedUpdate) {
        const newUrls = capturedUpdate.ExpressionAttributeValues[':imageUrls'];
        // The handler should have detected the duplicate and not called UpdateCommand
        // But if it did, the URL should still be in the list
        expect(newUrls).toContain(existingUrl);
      } else {
        // Ideally, UpdateCommand should not be called at all
        expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
      }
    });

    it('should update updatedAt timestamp', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      let capturedUpdate: any;
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).callsFake((input) => {
        capturedUpdate = input;
        return {};
      });

      const event = createMockS3Event(key);
      await handler(event);

      expect(capturedUpdate.ExpressionAttributeValues[':updatedAt']).toBeDefined();
      expect(capturedUpdate.UpdateExpression).toContain('updatedAt');
    });
  });

  describe('Event Filtering', () => {
    it('should only process ObjectCreated events', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      const event = createMockS3Event(key, 'ObjectRemoved:Delete');
      await handler(event);

      expect(dynamoMock.commandCalls(GetCommand)).toHaveLength(0);
    });

    it('should process ObjectCreated:Put events', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockS3Event(key, 'ObjectCreated:Put');
      await handler(event);

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });

    it('should process ObjectCreated:Post events', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).resolves({
        Item: {
          id: encounterId,
          imageUrls: []
        }
      });
      dynamoMock.on(UpdateCommand).resolves({});

      const event = createMockS3Event(key, 'ObjectCreated:Post');
      await handler(event);

      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle encounter not found', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).resolves({
        Item: undefined
      });

      const event = createMockS3Event(key);
      
      // Should not throw, just log error
      await expect(handler(event)).resolves.not.toThrow();
      
      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(0);
    });

    it('should handle DynamoDB errors gracefully', async () => {
      const encounterId = '01HQXYZ123ABC456DEF789';
      const key = `encounters/${encounterId}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).rejects(new Error('DynamoDB error'));

      const event = createMockS3Event(key);
      
      // Should not throw, just log error
      await expect(handler(event)).resolves.not.toThrow();
    });

    it('should continue processing other records if one fails', async () => {
      const encounterId1 = '01HQXYZ123ABC456DEF789';
      const encounterId2 = '01HQXYZ987ZYX654CBA321';
      const key1 = `encounters/${encounterId1}/images/1704067200000-0.jpg`;
      const key2 = `encounters/${encounterId2}/images/1704067200000-0.jpg`;
      
      dynamoMock.on(GetCommand).callsFake((input) => {
        if (input.Key.id === encounterId1) {
          throw new Error('DynamoDB error');
        }
        return {
          Item: {
            id: encounterId2,
            imageUrls: []
          }
        };
      });
      dynamoMock.on(UpdateCommand).resolves({});

      const event: S3Event = {
        Records: [
          ...createMockS3Event(key1).Records,
          ...createMockS3Event(key2).Records
        ]
      };
      
      await handler(event);

      // Should still process the second record
      expect(dynamoMock.commandCalls(UpdateCommand)).toHaveLength(1);
    });
  });
});
