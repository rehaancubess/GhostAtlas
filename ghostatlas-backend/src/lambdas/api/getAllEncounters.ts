/**
 * GetAllEncounters Lambda Function
 * Returns all approved encounters without location filtering
 * Used for the Stories tab to show all stories
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter } from '../../utils/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/**
 * Lambda handler for GET /api/encounters/all
 * Returns all approved encounters
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('GetAllEncounters Lambda invoked');

  try {
    // Parse limit parameter
    const queryParams = event.queryStringParameters || {};
    const limit = Math.min(
      parseInt(queryParams.limit || String(DEFAULT_LIMIT)),
      MAX_LIMIT
    );

    // Scan for all enhanced encounters (approved + AI enhancement complete)
    const scanCommand = new ScanCommand({
      TableName: ENCOUNTERS_TABLE,
      FilterExpression: '#status = :enhanced',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':enhanced': 'enhanced',
      },
      Limit: limit,
    });

    const result = await docClient.send(scanCommand);
    const allEncounters = (result.Items || []) as Encounter[];

    // Filter out encounters missing required fields
    const encounters = allEncounters.filter(encounter => {
      return encounter.location && 
             encounter.authorName && 
             encounter.originalStory &&
             encounter.enhancedStory;
    });

    // Sort by creation date (most recent first)
    encounters.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.updatedAt).getTime();
      const dateB = new Date(b.createdAt || b.updatedAt).getTime();
      return dateB - dateA;
    });

    console.log(`Found ${encounters.length} valid encounters out of ${allEncounters.length} total`);

    // Format encounters to ensure proper types (integers as integers, not doubles)
    const formattedEncounters = encounters.map(encounter => ({
      ...encounter,
      rating: Math.floor(encounter.rating || 0), // Ensure integer
      ratingCount: Math.floor(encounter.ratingCount || 0), // Ensure integer
      verificationCount: Math.floor(encounter.verificationCount || 0), // Ensure integer
    }));

    return createSuccessApiResponse({
      encounters: formattedEncounters,
      count: formattedEncounters.length,
    });
  } catch (error) {
    console.error('Error fetching all encounters:', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to fetch encounters'
    );
  }
}
