/**
 * AdminReject Lambda Function
 * Rejects an encounter submission
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createErrorApiResponse, createSuccessApiResponse, ErrorCode } from '../../utils/errorHandler';
import { Encounter } from '../../utils/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';

/**
 * Lambda handler for PUT /api/admin/encounters/{id}/reject
 * Rejects encounter without triggering enhancement pipeline
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('AdminReject Lambda invoked', { pathParameters: event.pathParameters });

  try {
    // Extract encounter ID from path parameters
    const encounterId = event.pathParameters?.id;
    
    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required'
      );
    }

    // Parse optional rejection reason from request body
    let rejectionReason: string | undefined;
    if (event.body) {
      try {
        const body = JSON.parse(event.body);
        rejectionReason = body.reason;
      } catch (parseError) {
        console.warn('Failed to parse request body', parseError);
        // Continue without rejection reason
      }
    }

    console.log('Rejecting encounter', { encounterId, hasReason: !!rejectionReason });

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

    // Update encounter status to "rejected"
    // Optionally store rejection reason
    const updateExpression = rejectionReason 
      ? 'SET #status = :status, #updatedAt = :updatedAt, #rejectionReason = :rejectionReason'
      : 'SET #status = :status, #updatedAt = :updatedAt';

    const expressionAttributeNames: Record<string, string> = {
      '#status': 'status',
      '#updatedAt': 'updatedAt'
    };

    const expressionAttributeValues: Record<string, any> = {
      ':status': 'rejected',
      ':updatedAt': new Date().toISOString()
    };

    if (rejectionReason) {
      expressionAttributeNames['#rejectionReason'] = 'rejectionReason';
      expressionAttributeValues[':rejectionReason'] = rejectionReason;
    }

    const updateCommand = new UpdateCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const updateResult = await docClient.send(updateCommand);
    const updatedEncounter = updateResult.Attributes as Encounter;

    console.log('Encounter status updated to rejected', { encounterId });

    // Note: Do NOT trigger Enhancement_Pipeline for rejected encounters

    // Return success response
    const response = {
      status: 'rejected',
      encounterId: updatedEncounter.id,
      message: 'Encounter rejected successfully',
      encounter: {
        id: updatedEncounter.id,
        authorName: updatedEncounter.authorName,
        status: updatedEncounter.status,
        updatedAt: updatedEncounter.updatedAt,
        ...(rejectionReason && { rejectionReason })
      }
    };

    console.log('Rejection completed successfully', { encounterId });

    return createSuccessApiResponse(response);

  } catch (error) {
    console.error('Error in AdminReject Lambda', error);
    return createErrorApiResponse(
      ErrorCode.INTERNAL_ERROR,
      'An error occurred while rejecting the encounter'
    );
  }
}
