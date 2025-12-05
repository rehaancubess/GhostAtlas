/**
 * AdminApprove Lambda Function
 * Approves an encounter and triggers AI enhancement pipeline
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter, EnhancementMessage } from '../../utils/types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sqsClient = new SQSClient({});

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const ENHANCEMENT_QUEUE_URL = process.env.ENHANCEMENT_QUEUE_URL || '';

/**
 * Lambda handler for PUT /api/admin/encounters/{id}/approve
 * Approves encounter and publishes to enhancement queue
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('AdminApprove Lambda invoked', { pathParameters: event.pathParameters });

  try {
    // Extract encounter ID from path parameters
    const encounterId = event.pathParameters?.id;
    
    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required'
      );
    }

    console.log('Approving encounter', { encounterId });

    // Retrieve encounter to validate it exists
    const getCommand = new GetCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId }
    });

    const getResult = await docClient.send(getCommand);

    // Return 404 if encounter does not exist
    if (!getResult.Item) {
      console.log('Encounter not found', { encounterId });
      return createErrorApiResponse(
        ErrorCode.NOT_FOUND,
        'Encounter not found'
      );
    }

    const encounter = getResult.Item as Encounter;
    console.log('Encounter retrieved', { encounterId, currentStatus: encounter.status });

    // Update encounter status to "approved"
    const updateCommand = new UpdateCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId },
      UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':status': 'approved',
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const updateResult = await docClient.send(updateCommand);
    const updatedEncounter = updateResult.Attributes as Encounter;

    console.log('Encounter status updated to approved', { encounterId });

    // Prepare enhancement message with encounter data
    const enhancementMessage: EnhancementMessage = {
      encounterId: encounter.id,
      originalStory: encounter.originalStory,
      location: {
        latitude: encounter.location.latitude,
        longitude: encounter.location.longitude,
        address: encounter.location.address
      },
      encounterTime: encounter.encounterTime
    };

    // Publish message to SQS enhancement queue
    const sqsCommand = new SendMessageCommand({
      QueueUrl: ENHANCEMENT_QUEUE_URL,
      MessageBody: JSON.stringify(enhancementMessage),
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

    const sqsResult = await sqsClient.send(sqsCommand);
    console.log('Enhancement message published to SQS', { 
      encounterId, 
      messageId: sqsResult.MessageId 
    });

    // Return success response with updated encounter
    const response = {
      status: 'approved',
      encounterId: updatedEncounter.id,
      message: 'Encounter approved successfully and queued for enhancement',
      encounter: {
        id: updatedEncounter.id,
        authorName: updatedEncounter.authorName,
        status: updatedEncounter.status,
        updatedAt: updatedEncounter.updatedAt
      }
    };

    console.log('Approval completed successfully', { encounterId });

    return createSuccessApiResponse(response);

  } catch (error) {
    console.error('Error in AdminApprove Lambda', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'An error occurred while approving the encounter'
    );
  }
}
