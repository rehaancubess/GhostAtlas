/**
 * TriggerEnhancement Lambda Function
 * Handles the upload-complete API call and triggers the AI enhancement pipeline
 * 
 * This is called by the Flutter app after encounter submission to start AI processing
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import {
  createErrorApiResponse,
  createSuccessApiResponse,
  logInfo,
  logError,
  ErrorCode
} from '../../utils';

// Initialize AWS clients
const sqsClient = new SQSClient({});
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const ENHANCEMENT_QUEUE_URL = process.env.ENHANCEMENT_QUEUE_URL || '';

/**
 * Main Lambda handler
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;
  const encounterId = event.pathParameters?.id;

  try {
    logInfo('Triggering AI enhancement', { encounterId, requestId });

    // Validate encounter ID
    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required',
        requestId
      );
    }

    // Get encounter from DynamoDB
    const getCommand = new GetCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId }
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      return createErrorApiResponse(
        ErrorCode.NOT_FOUND,
        'Encounter not found',
        requestId
      );
    }

    const encounter = result.Item;

    // Check if already enhancing or enhanced
    if (encounter.status === 'enhancing' || encounter.status === 'enhanced') {
      logInfo('Encounter already in enhancement pipeline', {
        encounterId,
        status: encounter.status
      });
      return createSuccessApiResponse({
        message: 'Enhancement already in progress or complete',
        status: encounter.status
      });
    }

    // Update status to 'enhancing'
    const now = new Date().toISOString();
    const updateCommand = new UpdateCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'enhancing',
        ':updatedAt': now
      }
    });

    await docClient.send(updateCommand);

    // Send message to enhancement queue
    const sqsMessage = {
      encounterId,
      originalStory: encounter.originalStory,
      location: encounter.location,
      encounterTime: encounter.encounterTime,
      timestamp: now
    };

    const sendCommand = new SendMessageCommand({
      QueueUrl: ENHANCEMENT_QUEUE_URL,
      MessageBody: JSON.stringify(sqsMessage),
      MessageAttributes: {
        encounterId: {
          DataType: 'String',
          StringValue: encounterId
        },
        action: {
          DataType: 'String',
          StringValue: 'enhance'
        }
      }
    });

    await sqsClient.send(sendCommand);

    logInfo('Enhancement triggered successfully', {
      encounterId,
      requestId
    });

    return createSuccessApiResponse({
      message: 'AI enhancement pipeline triggered',
      encounterId,
      status: 'enhancing'
    });

  } catch (error) {
    logError(error as Error, { encounterId, requestId });
    
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'Failed to trigger enhancement',
      requestId
    );
  }
}
