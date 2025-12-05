/**
 * SubmitEncounter Lambda Function
 * Handles encounter submission with validation, storage, and presigned URL generation
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ulid } from 'ulid';
import {
  validateEncounterSubmission,
  sanitizeInput,
  createErrorApiResponse,
  createSuccessApiResponse,
  logInfo,
  logError,
  ErrorCode,
  encodeGeohash,
  Encounter
} from '../../utils';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true, // Remove undefined values from objects
  },
});
const s3Client = new S3Client({});

// Environment variables
const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || '';
const MAX_IMAGES = 5;
const PRESIGNED_URL_EXPIRY_SECONDS = 900; // 15 minutes
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface EncounterSubmissionRequest {
  authorName: string;
  deviceId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  originalStory: string;
  encounterTime: string;
  imageCount: number;
  isPublic?: boolean;
}

interface SubmitEncounterResponse {
  encounterId: string;
  uploadUrls: string[];
}

/**
 * Generates presigned S3 URLs for image uploads
 */
async function generatePresignedUrls(
  encounterId: string,
  imageCount: number
): Promise<string[]> {
  const uploadUrls: string[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < imageCount; i++) {
    const key = `encounters/${encounterId}/images/${timestamp}-${i}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: key,
      ContentType: 'image/jpeg',
      // Add metadata for validation
      Metadata: {
        'encounter-id': encounterId,
        'max-size': MAX_FILE_SIZE_BYTES.toString()
      }
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS
    });

    uploadUrls.push(presignedUrl);
  }

  return uploadUrls;
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logInfo('Processing encounter submission', { requestId });

    // Parse request body
    if (!event.body) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Request body is required',
        requestId
      );
    }

    let requestData: EncounterSubmissionRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid JSON in request body',
        requestId
      );
    }

    // Validate encounter submission data
    const validation = validateEncounterSubmission(requestData);
    if (!validation.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        validation.errors?.join(', ') || 'Validation failed',
        requestId
      );
    }

    // Validate image count
    if (requestData.imageCount < 0 || requestData.imageCount > MAX_IMAGES) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        `Image count must be between 0 and ${MAX_IMAGES}`,
        requestId
      );
    }

    // Sanitize text inputs
    const sanitizedAuthorName = sanitizeInput(requestData.authorName);
    const sanitizedOriginalStory = sanitizeInput(requestData.originalStory);
    const sanitizedAddress = requestData.location.address 
      ? sanitizeInput(requestData.location.address)
      : undefined;

    // Generate unique encounter ID using ULID
    const encounterId = ulid();
    const now = new Date().toISOString();

    // Calculate geohash from coordinates
    const geohash = encodeGeohash(
      requestData.location.latitude,
      requestData.location.longitude,
      6 // Precision 6 for ~1.2km grid
    );

    // Create encounter record
    const encounter: Encounter = {
      id: encounterId,
      authorName: sanitizedAuthorName,
      deviceId: requestData.deviceId,
      location: {
        latitude: requestData.location.latitude,
        longitude: requestData.location.longitude,
        address: sanitizedAddress,
        geohash
      },
      originalStory: sanitizedOriginalStory,
      encounterTime: requestData.encounterTime,
      status: 'pending',
      isPublic: requestData.isPublic !== false, // Default to true if not specified
      imageUrls: [],
      rating: 0,
      ratingCount: 0,
      verificationCount: 0,
      commentCount: 0,
      createdAt: now,
      updatedAt: now
    };

    // Store encounter in DynamoDB
    const putCommand = new PutCommand({
      TableName: ENCOUNTERS_TABLE,
      Item: encounter,
      // Remove undefined values from the item
      // DynamoDB doesn't allow undefined values
      ReturnValues: 'NONE'
    });

    await docClient.send(putCommand);

    logInfo('Encounter stored successfully', {
      encounterId,
      requestId
    });

    // Generate presigned URLs for image uploads
    const uploadUrls = requestData.imageCount > 0
      ? await generatePresignedUrls(encounterId, requestData.imageCount)
      : [];

    logInfo('Presigned URLs generated', {
      encounterId,
      urlCount: uploadUrls.length,
      requestId
    });

    // Return response
    const response: SubmitEncounterResponse = {
      encounterId,
      uploadUrls
    };

    return createSuccessApiResponse(response, 201);

  } catch (error) {
    logError(error as Error, { requestId });
    
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to submit encounter',
      requestId
    );
  }
}
