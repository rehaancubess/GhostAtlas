/**
 * RateEncounter Lambda Function
 * Handles rating submission with duplicate prevention and average calculation
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  validateRating,
  validateRequiredField,
  createErrorApiResponse,
  createSuccessApiResponse,
  logInfo,
  logError,
  ErrorCode,
  Rating
} from '../../utils';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const RATINGS_TABLE = process.env.RATINGS_TABLE || '';

interface RateEncounterRequest {
  deviceId: string;
  rating: number;
}

interface RateEncounterResponse {
  averageRating: number;
  ratingCount: number;
}

/**
 * Validates UUID format for deviceId
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Checks if a rating already exists for the given encounter and device
 */
async function checkDuplicateRating(
  encounterId: string,
  deviceId: string
): Promise<boolean> {
  const getCommand = new GetCommand({
    TableName: RATINGS_TABLE,
    Key: {
      encounterId,
      deviceId
    }
  });

  const result = await docClient.send(getCommand);
  return !!result.Item;
}

/**
 * Stores a new rating in the Ratings table
 */
async function storeRating(
  encounterId: string,
  deviceId: string,
  rating: number
): Promise<void> {
  const now = new Date().toISOString();
  
  const ratingRecord: Rating = {
    encounterId,
    deviceId,
    rating,
    ratedAt: now
  };

  const putCommand = new PutCommand({
    TableName: RATINGS_TABLE,
    Item: ratingRecord
  });

  await docClient.send(putCommand);
}

/**
 * Updates the encounter's average rating and rating count using atomic operations
 */
async function updateEncounterRating(
  encounterId: string,
  newRating: number
): Promise<{ averageRating: number; ratingCount: number }> {
  // First, get the current encounter to calculate the new average
  const getCommand = new GetCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId }
  });

  const result = await docClient.send(getCommand);
  
  if (!result.Item) {
    throw new Error('Encounter not found');
  }

  const currentRating = result.Item.rating || 0;
  const currentCount = result.Item.ratingCount || 0;
  
  // Calculate new average
  const totalRating = currentRating * currentCount + newRating;
  const newCount = currentCount + 1;
  const newAverage = totalRating / newCount;
  
  // Round to one decimal place
  const roundedAverage = Math.round(newAverage * 10) / 10;

  // Update the encounter with atomic counter increment
  const updateCommand = new UpdateCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId },
    UpdateExpression: 'SET rating = :rating, ratingCount = :count, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':rating': roundedAverage,
      ':count': newCount,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  });

  const updateResult = await docClient.send(updateCommand);
  
  return {
    averageRating: updateResult.Attributes?.rating || roundedAverage,
    ratingCount: Math.floor(updateResult.Attributes?.ratingCount || newCount) // Ensure integer
  };
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logInfo('Processing rating submission', { requestId });

    // Extract encounter ID from path parameters
    const encounterId = event.pathParameters?.id;
    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required',
        requestId
      );
    }

    // Parse request body
    if (!event.body) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Request body is required',
        requestId
      );
    }

    let requestData: RateEncounterRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (error) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Invalid JSON in request body',
        requestId
      );
    }

    // Validate required fields
    const deviceIdCheck = validateRequiredField(requestData.deviceId, 'deviceId');
    if (!deviceIdCheck.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        deviceIdCheck.error!,
        requestId
      );
    }

    const ratingCheck = validateRequiredField(requestData.rating, 'rating');
    if (!ratingCheck.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        ratingCheck.error!,
        requestId
      );
    }

    // Validate deviceId format (UUID)
    if (!isValidUUID(requestData.deviceId)) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'deviceId must be a valid UUID',
        requestId
      );
    }

    // Validate rating value (1-5)
    const ratingValidation = validateRating(requestData.rating);
    if (!ratingValidation.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        ratingValidation.error!,
        requestId
      );
    }

    // Check for duplicate rating
    const isDuplicate = await checkDuplicateRating(encounterId, requestData.deviceId);
    if (isDuplicate) {
      logInfo('Duplicate rating detected', {
        encounterId,
        deviceId: requestData.deviceId,
        requestId
      });
      
      return createErrorApiResponse(
        ErrorCode.ALREADY_EXISTS,
        'Already rated',
        requestId
      );
    }

    // Store the rating
    await storeRating(encounterId, requestData.deviceId, requestData.rating);

    logInfo('Rating stored successfully', {
      encounterId,
      deviceId: requestData.deviceId,
      rating: requestData.rating,
      requestId
    });

    // Update encounter's average rating and count
    const updatedStats = await updateEncounterRating(encounterId, requestData.rating);

    logInfo('Encounter rating updated', {
      encounterId,
      averageRating: updatedStats.averageRating,
      ratingCount: updatedStats.ratingCount,
      requestId
    });

    // Return response with proper integer types
    const response: RateEncounterResponse = {
      averageRating: updatedStats.averageRating,
      ratingCount: Math.floor(updatedStats.ratingCount) // Ensure integer
    };

    return createSuccessApiResponse(response, 200);

  } catch (error) {
    logError(error as Error, { requestId });
    
    // Check if it's a "not found" error
    if ((error as Error).message === 'Encounter not found') {
      return createErrorApiResponse(
        ErrorCode.NOT_FOUND,
        'Encounter not found',
        requestId
      );
    }
    
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to submit rating',
      requestId
    );
  }
}
