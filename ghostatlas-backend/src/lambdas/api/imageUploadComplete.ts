/**
 * ImageUploadComplete Lambda Function
 * Handles S3 upload completion events and updates encounter records with CloudFront URLs
 * 
 * Requirements: 2.3, 2.5
 */

import { S3Event } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  logInfo,
  logError,
  logWarning
} from '../../utils';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';

/**
 * Validates S3 path follows the required pattern
 * Pattern: encounters/{id}/images/{timestamp}-{filename}
 */
function validateS3Path(key: string): { isValid: boolean; encounterId?: string } {
  const pathPattern = /^encounters\/([a-zA-Z0-9]+)\/images\/(\d+)-(.+)$/;
  const match = key.match(pathPattern);

  if (!match) {
    return { isValid: false };
  }

  const encounterId = match[1];
  return { isValid: true, encounterId };
}

/**
 * Constructs CloudFront URL from S3 key
 */
function getCloudFrontUrl(key: string): string {
  // Handle empty domain (test environment)
  if (!CLOUDFRONT_DOMAIN) {
    return `https://cloudfront.example.com/${key}`;
  }
  
  // Ensure CLOUDFRONT_DOMAIN doesn't have trailing slash or protocol
  const domain = CLOUDFRONT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
  // Ensure key doesn't have leading slash
  const cleanKey = key.replace(/^\//, '');
  
  return `https://${domain}/${cleanKey}`;
}

/**
 * Updates encounter record with new image URL
 */
async function updateEncounterWithImageUrl(
  encounterId: string,
  imageUrl: string
): Promise<void> {
  const now = new Date().toISOString();

  // First, get the current encounter to retrieve existing imageUrls
  const getCommand = new GetCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId }
  });

  const getResult = await docClient.send(getCommand);

  if (!getResult.Item) {
    throw new Error(`Encounter not found: ${encounterId}`);
  }

  const currentImageUrls = getResult.Item.imageUrls || [];

  // Check if URL already exists (idempotency)
  if (currentImageUrls.includes(imageUrl)) {
    logInfo('Image URL already exists in encounter', { encounterId, imageUrl });
    return;
  }

  // Add new image URL to the list
  const updatedImageUrls = [...currentImageUrls, imageUrl];

  // Update the encounter record
  const updateCommand = new UpdateCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId },
    UpdateExpression: 'SET imageUrls = :imageUrls, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':imageUrls': updatedImageUrls,
      ':updatedAt': now
    }
  });

  await docClient.send(updateCommand);

  logInfo('Encounter updated with image URL', {
    encounterId,
    imageUrl,
    totalImages: updatedImageUrls.length
  });
}

/**
 * Main Lambda handler for S3 events
 */
export async function handler(event: S3Event): Promise<void> {
  logInfo('Processing S3 upload events', { recordCount: event.Records.length });

  for (const record of event.Records) {
    try {
      // Only process ObjectCreated events
      if (!record.eventName.startsWith('ObjectCreated:')) {
        logInfo('Skipping non-creation event', { eventName: record.eventName });
        continue;
      }

      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      logInfo('Processing uploaded object', { bucket, key });

      // Validate S3 path pattern
      const validation = validateS3Path(key);
      if (!validation.isValid || !validation.encounterId) {
        logWarning('Invalid S3 path pattern', { key });
        continue;
      }

      const { encounterId } = validation;

      // Construct CloudFront URL
      const cloudFrontUrl = getCloudFrontUrl(key);

      // Update encounter record with CloudFront URL
      await updateEncounterWithImageUrl(encounterId, cloudFrontUrl);

      logInfo('Successfully processed image upload', {
        encounterId,
        key,
        cloudFrontUrl
      });

    } catch (error) {
      logError(error as Error, {
        bucket: record.s3.bucket.name,
        key: record.s3.object.key
      });
      // Continue processing other records even if one fails
    }
  }
}
