/**
 * VerifyLocation Lambda Function
 * Handles location verification with distance validation and time matching
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import {
  validateSpookinessScore,
  validateRequiredField,
  validateCoordinateRange,
  validateFieldLength,
  calculateDistance,
  createErrorApiResponse,
  createSuccessApiResponse,
  logInfo,
  logError,
  ErrorCode,
  Verification,
  Location
} from '../../utils';

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const VERIFICATIONS_TABLE = process.env.VERIFICATIONS_TABLE || '';

// Constants
const MAX_DISTANCE_METERS = 100;
const TIME_MATCH_WINDOW_HOURS = 2;

interface VerifyLocationRequest {
  location: {
    latitude: number;
    longitude: number;
  };
  spookinessScore: number;
  notes?: string;
}

interface VerifyLocationResponse {
  verificationId: string;
  isTimeMatched: boolean;
}

/**
 * Checks if verification time matches encounter time of day within ±2 hours
 */
function isTimeMatched(encounterTime: string, verificationTime: string): boolean {
  const encounterDate = new Date(encounterTime);
  const verificationDate = new Date(verificationTime);
  
  // Extract hours and minutes for time of day comparison
  const encounterHour = encounterDate.getUTCHours();
  const encounterMinute = encounterDate.getUTCMinutes();
  const verificationHour = verificationDate.getUTCHours();
  const verificationMinute = verificationDate.getUTCMinutes();
  
  // Convert to minutes since midnight for easier comparison
  const encounterMinutesSinceMidnight = encounterHour * 60 + encounterMinute;
  const verificationMinutesSinceMidnight = verificationHour * 60 + verificationMinute;
  
  // Calculate difference in minutes
  let differenceMinutes = Math.abs(encounterMinutesSinceMidnight - verificationMinutesSinceMidnight);
  
  // Handle wrap-around midnight (e.g., 23:00 to 01:00 should be 2 hours, not 22 hours)
  const minutesInDay = 24 * 60;
  if (differenceMinutes > minutesInDay / 2) {
    differenceMinutes = minutesInDay - differenceMinutes;
  }
  
  // Check if within 2 hours (120 minutes)
  const windowMinutes = TIME_MATCH_WINDOW_HOURS * 60;
  
  console.log('DEBUG isTimeMatched:', {
    encounterTime,
    verificationTime,
    encounterMinutesSinceMidnight,
    verificationMinutesSinceMidnight,
    differenceMinutes,
    windowMinutes,
    result: differenceMinutes <= windowMinutes
  });
  
  return differenceMinutes <= windowMinutes;
}

/**
 * Retrieves encounter from DynamoDB
 */
async function getEncounter(encounterId: string): Promise<any> {
  const getCommand = new GetCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId }
  });

  const result = await docClient.send(getCommand);
  
  if (!result.Item) {
    throw new Error('Encounter not found');
  }
  
  return result.Item;
}

/**
 * Stores verification in Verifications table
 */
async function storeVerification(
  encounterId: string,
  location: Location,
  spookinessScore: number,
  notes: string | undefined,
  verifiedAt: string,
  isTimeMatched: boolean,
  distanceMeters: number
): Promise<string> {
  const verificationId = ulid();
  
  const verification: Verification = {
    id: verificationId,
    encounterId,
    location,
    spookinessScore,
    notes,
    verifiedAt,
    isTimeMatched,
    distanceMeters
  };

  const putCommand = new PutCommand({
    TableName: VERIFICATIONS_TABLE,
    Item: verification
  });

  await docClient.send(putCommand);
  
  return verificationId;
}

/**
 * Increments encounter's verification count and updates average spookiness
 */
async function incrementVerificationCount(encounterId: string, newSpookinessScore: number): Promise<void> {
  // First, get current encounter data
  const getCommand = new GetCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId }
  });
  
  const result = await docClient.send(getCommand);
  const encounter = result.Item;
  
  if (!encounter) {
    throw new Error('Encounter not found');
  }
  
  // Calculate new average spookiness
  const currentCount = encounter.verificationCount || 0;
  const currentAvg = encounter.averageSpookiness || 0;
  const newCount = currentCount + 1;
  const newAvg = ((currentAvg * currentCount) + newSpookinessScore) / newCount;
  
  // Update encounter with new count and average
  const updateCommand = new UpdateCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId },
    UpdateExpression: 'SET verificationCount = :count, averageSpookiness = :avg, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':count': newCount,
      ':avg': Number(newAvg.toFixed(1)),
      ':updatedAt': new Date().toISOString()
    }
  });

  await docClient.send(updateCommand);
}

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;

  try {
    logInfo('Processing location verification', { requestId });

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

    let requestData: VerifyLocationRequest;
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
    const locationCheck = validateRequiredField(requestData.location, 'location');
    if (!locationCheck.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        locationCheck.error!,
        requestId
      );
    }

    const spookinessScoreCheck = validateRequiredField(requestData.spookinessScore, 'spookinessScore');
    if (!spookinessScoreCheck.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        spookinessScoreCheck.error!,
        requestId
      );
    }

    // Validate spookiness score (1-5)
    const scoreValidation = validateSpookinessScore(requestData.spookinessScore);
    if (!scoreValidation.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        scoreValidation.error!,
        requestId
      );
    }

    // Validate coordinates
    const coordValidation = validateCoordinateRange(
      requestData.location.latitude,
      requestData.location.longitude
    );
    if (!coordValidation.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        coordValidation.error!,
        requestId
      );
    }

    // Validate notes length if provided
    if (requestData.notes !== undefined) {
      const notesValidation = validateFieldLength(requestData.notes, 500, 'notes');
      if (!notesValidation.isValid) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          notesValidation.error!,
          requestId
        );
      }
    }

    // Retrieve encounter to get original location
    const encounter = await getEncounter(encounterId);

    logInfo('Retrieved encounter for verification', {
      encounterId,
      encounterLocation: encounter.location,
      requestId
    });

    // Calculate distance between verification and encounter location
    const distance = calculateDistance(
      requestData.location.latitude,
      requestData.location.longitude,
      encounter.location.latitude,
      encounter.location.longitude
    );

    logInfo('Calculated distance', {
      encounterId,
      distanceMeters: distance,
      requestId
    });

    // Reject if distance > 100 meters
    if (distance > MAX_DISTANCE_METERS) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        `Verification location is ${Math.round(distance)} meters from encounter location. Must be within ${MAX_DISTANCE_METERS} meters.`,
        requestId
      );
    }

    // Check if verification time matches encounter time of day (±2 hours)
    const verifiedAt = new Date().toISOString();
    const timeMatched = isTimeMatched(encounter.encounterTime, verifiedAt);

    logInfo('Time match check', {
      encounterId,
      encounterTime: encounter.encounterTime,
      verifiedAt,
      isTimeMatched: timeMatched,
      requestId
    });

    // Store verification in Verifications table
    const verificationId = await storeVerification(
      encounterId,
      {
        latitude: requestData.location.latitude,
        longitude: requestData.location.longitude
      },
      requestData.spookinessScore,
      requestData.notes,
      verifiedAt,
      timeMatched,
      distance
    );

    logInfo('Verification stored successfully', {
      verificationId,
      encounterId,
      requestId
    });

    // Increment encounter's verificationCount and update average spookiness
    await incrementVerificationCount(encounterId, requestData.spookinessScore);

    logInfo('Verification count and average spookiness updated', {
      encounterId,
      requestId
    });

    // Return response
    const response: VerifyLocationResponse = {
      verificationId,
      isTimeMatched: timeMatched
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
      'Failed to verify location',
      requestId
    );
  }
}
