/**
 * GetEncounters Lambda Function
 * Handles geospatial queries for approved encounters
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateCoordinateRange } from '../../utils/validation';
import { calculateDistance, encodeGeohash } from '../../utils/geospatial';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter } from '../../utils/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const DEFAULT_RADIUS_KM = 50;
const MAX_RADIUS_KM = 100;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

interface EncounterWithDistance extends Encounter {
  distance: number;
}

/**
 * Lambda handler for GET /api/encounters
 * Returns approved encounters near a specified location
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('GetEncounters Lambda invoked', { queryParams: event.queryStringParameters });

  try {
    // Extract and validate query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Validate required parameters
    if (!queryParams.latitude || !queryParams.longitude) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'latitude and longitude query parameters are required'
      );
    }

    // Parse coordinates
    const latitude = parseFloat(queryParams.latitude);
    const longitude = parseFloat(queryParams.longitude);

    // Validate coordinates
    const coordValidation = validateCoordinateRange(latitude, longitude);
    if (!coordValidation.isValid) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        coordValidation.error || 'Invalid coordinates'
      );
    }

    // Parse and validate radius
    let radiusKm = DEFAULT_RADIUS_KM;
    if (queryParams.radius) {
      radiusKm = parseFloat(queryParams.radius);
      if (isNaN(radiusKm) || radiusKm <= 0) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          'radius must be a positive number'
        );
      }
      if (radiusKm > MAX_RADIUS_KM) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          `radius cannot exceed ${MAX_RADIUS_KM} km`
        );
      }
    }

    // Parse and validate limit
    let limit = DEFAULT_LIMIT;
    if (queryParams.limit) {
      limit = parseInt(queryParams.limit, 10);
      if (isNaN(limit) || limit <= 0) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          'limit must be a positive integer'
        );
      }
      if (limit > MAX_LIMIT) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          `limit cannot exceed ${MAX_LIMIT}`
        );
      }
    }

    console.log('Query parameters validated', { latitude, longitude, radiusKm, limit });

    // Calculate geohash for the query location
    // Note: For simplicity, we'll query all approved encounters and filter by distance
    // In production with large datasets, we'd use geohash prefix queries for optimization
    const geohash = encodeGeohash(latitude, longitude, 6);
    console.log('Calculated geohash', { geohash });

    // Query DynamoDB for enhanced encounters (approved + AI enhancement complete)
    // Using the status-encounterTime-index GSI
    const queryCommand = new QueryCommand({
      TableName: ENCOUNTERS_TABLE,
      IndexName: 'status-encounterTime-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'enhanced'
      },
      // We'll fetch more than needed and filter by distance
      Limit: limit * 3 // Fetch 3x to account for distance filtering
    });

    console.log('Querying DynamoDB', { indexName: 'status-encounterTime-index' });
    const result = await docClient.send(queryCommand);
    
    if (!result.Items || result.Items.length === 0) {
      console.log('No enhanced encounters found');
      return createSuccessApiResponse({
        encounters: [],
        count: 0
      });
    }

    console.log(`Found ${result.Items.length} enhanced encounters`);

    // Calculate distance for each encounter and filter by radius
    const encountersWithDistance: EncounterWithDistance[] = result.Items
      .map((item) => {
        const encounter = item as Encounter;
        const distance = calculateDistance(
          latitude,
          longitude,
          encounter.location.latitude,
          encounter.location.longitude
        );
        
        return {
          ...encounter,
          distance: distance / 1000 // Convert meters to kilometers
        };
      })
      .filter((encounter) => encounter.distance <= radiusKm);

    console.log(`Filtered to ${encountersWithDistance.length} encounters within ${radiusKm}km`);

    // Sort by distance ascending
    encountersWithDistance.sort((a, b) => a.distance - b.distance);

    // Limit results
    const limitedEncounters = encountersWithDistance.slice(0, limit);

    // Format response with required fields
    const formattedEncounters = limitedEncounters.map((encounter) => ({
      id: encounter.id,
      authorName: encounter.authorName,
      location: {
        latitude: encounter.location.latitude,
        longitude: encounter.location.longitude,
        address: encounter.location.address
      },
      enhancedStory: encounter.enhancedStory || encounter.originalStory,
      encounterTime: encounter.encounterTime,
      imageUrls: encounter.imageUrls || [],
      illustrationUrls: encounter.illustrationUrls || [],
      narrationUrl: encounter.narrationUrl,
      rating: Math.floor(encounter.rating || 0), // Ensure integer
      verificationCount: Math.floor(encounter.verificationCount || 0), // Ensure integer
      distance: Math.round(encounter.distance * 100) / 100 // Round to 2 decimal places
    }));

    console.log(`Returning ${formattedEncounters.length} encounters`);

    return createSuccessApiResponse({
      encounters: formattedEncounters,
      count: formattedEncounters.length
    });

  } catch (error) {
    console.error('Error in GetEncounters Lambda', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'An error occurred while retrieving encounters'
    );
  }
}
