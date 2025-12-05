/**
 * GetEncounterById Lambda Function
 * Retrieves detailed information about a specific encounter
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter, Verification, Rating } from '../../utils/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const VERIFICATIONS_TABLE = process.env.VERIFICATIONS_TABLE || '';
const RATINGS_TABLE = process.env.RATINGS_TABLE || '';
const CLOUDFRONT_CACHE_TTL = 86400; // 24 hours in seconds

/**
 * Lambda handler for GET /api/encounters/{id}
 * Returns detailed encounter information with verifications and ratings
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('GetEncounterById Lambda invoked', { pathParameters: event.pathParameters });

  try {
    // Extract encounter ID from path parameters
    const encounterId = event.pathParameters?.id;
    
    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required'
      );
    }

    console.log('Retrieving encounter', { encounterId });

    // Retrieve encounter from DynamoDB
    const getEncounterCommand = new GetCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId }
    });

    const encounterResult = await docClient.send(getEncounterCommand);

    // Return 404 if encounter does not exist
    if (!encounterResult.Item) {
      console.log('Encounter not found', { encounterId });
      return createErrorApiResponse(
        ErrorCode.NOT_FOUND,
        'Encounter not found'
      );
    }

    const encounter = encounterResult.Item as Encounter;
    console.log('Encounter retrieved', { encounterId, status: encounter.status });

    // Return 403 if status is not "approved" or "enhanced"
    if (encounter.status !== 'approved' && encounter.status !== 'enhanced') {
      console.log('Encounter not approved or enhanced', { encounterId, status: encounter.status });
      return createErrorApiResponse(
        ErrorCode.FORBIDDEN,
        'This encounter is not available for viewing'
      );
    }

    // Query verifications for this encounter
    console.log('Querying verifications', { encounterId });
    const verificationsCommand = new QueryCommand({
      TableName: VERIFICATIONS_TABLE,
      KeyConditionExpression: 'encounterId = :encounterId',
      ExpressionAttributeValues: {
        ':encounterId': encounterId
      },
      ScanIndexForward: false // Sort by verifiedAt descending (most recent first)
    });

    const verificationsResult = await docClient.send(verificationsCommand);
    const verifications = (verificationsResult.Items || []) as Verification[];
    console.log(`Found ${verifications.length} verifications`);

    // Query ratings for this encounter
    console.log('Querying ratings', { encounterId });
    const ratingsCommand = new QueryCommand({
      TableName: RATINGS_TABLE,
      KeyConditionExpression: 'encounterId = :encounterId',
      ExpressionAttributeValues: {
        ':encounterId': encounterId
      }
    });

    const ratingsResult = await docClient.send(ratingsCommand);
    const ratings = (ratingsResult.Items || []) as Rating[];
    console.log(`Found ${ratings.length} ratings`);

    // Format verification details
    const verificationDetails = verifications.map((v) => ({
      id: v.id,
      location: {
        latitude: v.location.latitude,
        longitude: v.location.longitude
      },
      spookinessScore: v.spookinessScore,
      notes: v.notes,
      verifiedAt: v.verifiedAt,
      isTimeMatched: v.isTimeMatched,
      distanceMeters: v.distanceMeters
    }));

    // Calculate average spookiness from verifications
    const averageSpookiness = verifications.length > 0
      ? verifications.reduce((sum, v) => sum + v.spookinessScore, 0) / verifications.length
      : 0;

    // Calculate rating statistics
    const ratingStats = {
      averageRating: Math.floor(encounter.rating || 0), // Ensure integer
      ratingCount: Math.floor(encounter.ratingCount || 0), // Ensure integer
      ratingDistribution: {
        1: ratings.filter(r => r.rating === 1).length,
        2: ratings.filter(r => r.rating === 2).length,
        3: ratings.filter(r => r.rating === 3).length,
        4: ratings.filter(r => r.rating === 4).length,
        5: ratings.filter(r => r.rating === 5).length
      }
    };

    // Format complete encounter details with all required fields
    const encounterDetails = {
      id: encounter.id,
      authorName: encounter.authorName,
      location: {
        latitude: encounter.location.latitude,
        longitude: encounter.location.longitude,
        address: encounter.location.address
      },
      originalStory: encounter.originalStory,
      enhancedStory: encounter.enhancedStory,
      encounterTime: encounter.encounterTime,
      imageUrls: encounter.imageUrls || [],
      illustrationUrls: encounter.illustrationUrls || [],
      narrationUrl: encounter.narrationUrl,
      rating: Math.floor(encounter.rating || 0), // Ensure integer
      ratingCount: Math.floor(encounter.ratingCount || 0), // Ensure integer
      verificationCount: Math.floor(encounter.verificationCount || 0), // Ensure integer
      averageSpookiness: Number(averageSpookiness.toFixed(1)),
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt,
      verifications: verificationDetails,
      ratingStats
    };

    console.log('Returning encounter details', { encounterId });

    // Create response with CloudFront cache headers
    const response = createSuccessApiResponse(encounterDetails);
    
    // Add cache control headers for CloudFront CDN (86400s = 24 hours)
    response.headers = {
      ...response.headers,
      'Cache-Control': `public, max-age=${CLOUDFRONT_CACHE_TTL}`,
      'Expires': new Date(Date.now() + CLOUDFRONT_CACHE_TTL * 1000).toUTCString()
    };

    return response;

  } catch (error) {
    console.error('Error in GetEncounterById Lambda', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'An error occurred while retrieving encounter details'
    );
  }
}
