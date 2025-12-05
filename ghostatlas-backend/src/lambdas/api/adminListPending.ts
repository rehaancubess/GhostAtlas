/**
 * AdminListPending Lambda Function
 * Lists all pending encounters for admin review
 * 
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter } from '../../utils/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Lambda handler for GET /api/admin/encounters
 * Returns list of pending encounters sorted by submission time (newest first)
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('AdminListPending Lambda invoked', { queryStringParameters: event.queryStringParameters });

  try {
    // Extract pagination parameters
    const nextToken = event.queryStringParameters?.nextToken;
    const limitParam = event.queryStringParameters?.limit;
    
    // Parse and validate limit
    let limit = DEFAULT_PAGE_SIZE;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return createErrorApiResponse(
          ErrorCode.VALIDATION_ERROR,
          'Limit must be a positive integer'
        );
      }
      limit = Math.min(parsedLimit, MAX_PAGE_SIZE);
    }

    console.log('Querying pending encounters', { limit, hasNextToken: !!nextToken });

    // Query DynamoDB GSI (status-encounterTime-index) with status="pending"
    const queryCommand = new QueryCommand({
      TableName: ENCOUNTERS_TABLE,
      IndexName: 'status-encounterTime-index',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'pending'
      },
      ScanIndexForward: false, // Sort by encounterTime descending (newest first)
      Limit: limit,
      ExclusiveStartKey: nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : undefined
    });

    const result = await docClient.send(queryCommand);
    const encounters = (result.Items || []) as Encounter[];

    console.log(`Found ${encounters.length} pending encounters`);

    // Format encounters with required fields for admin review
    const formattedEncounters = encounters.map((encounter) => ({
      id: encounter.id,
      authorName: encounter.authorName,
      location: {
        latitude: encounter.location.latitude,
        longitude: encounter.location.longitude,
        address: encounter.location.address
      },
      originalStory: encounter.originalStory,
      encounterTime: encounter.encounterTime,
      imageUrls: encounter.imageUrls || [],
      createdAt: encounter.createdAt,
      status: encounter.status
    }));

    // Prepare response with pagination
    const response: any = {
      encounters: formattedEncounters,
      count: formattedEncounters.length
    };

    // Include nextToken if there are more results
    if (result.LastEvaluatedKey) {
      const encodedToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
      response.nextToken = encodedToken;
      console.log('More results available', { nextToken: encodedToken });
    }

    console.log('Returning pending encounters', { count: formattedEncounters.length, hasNextToken: !!response.nextToken });

    return createSuccessApiResponse(response);

  } catch (error) {
    console.error('Error in AdminListPending Lambda', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'An error occurred while retrieving pending encounters'
    );
  }
}
