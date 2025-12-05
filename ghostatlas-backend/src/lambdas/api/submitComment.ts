/**
 * SubmitComment Lambda Function
 * Handles comment/experience submissions for encounters
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import {
  sanitizeInput,
  validateRequiredField,
  validateFieldLength,
  createErrorApiResponse,
  createSuccessApiResponse,
  logInfo,
  logError,
  ErrorCode,
  Comment
} from '../../utils';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';
const COMMENTS_TABLE = process.env.COMMENTS_TABLE || '';

interface SubmitCommentRequest {
  authorName: string;
  deviceId: string;
  commentText: string;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext.requestId;
  const encounterId = event.pathParameters?.id;

  try {
    logInfo('Processing comment submission', { encounterId, requestId });

    if (!encounterId) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Encounter ID is required',
        requestId
      );
    }

    if (!event.body) {
      return createErrorApiResponse(
        ErrorCode.VALIDATION_ERROR,
        'Request body is required',
        requestId
      );
    }

    let requestData: SubmitCommentRequest;
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
    const authorNameCheck = validateRequiredField(requestData.authorName, 'authorName');
    if (!authorNameCheck.isValid) {
      return createErrorApiResponse(ErrorCode.VALIDATION_ERROR, authorNameCheck.error!, requestId);
    }

    const deviceIdCheck = validateRequiredField(requestData.deviceId, 'deviceId');
    if (!deviceIdCheck.isValid) {
      return createErrorApiResponse(ErrorCode.VALIDATION_ERROR, deviceIdCheck.error!, requestId);
    }

    const commentTextCheck = validateRequiredField(requestData.commentText, 'commentText');
    if (!commentTextCheck.isValid) {
      return createErrorApiResponse(ErrorCode.VALIDATION_ERROR, commentTextCheck.error!, requestId);
    }

    // Validate field lengths
    const authorNameLength = validateFieldLength(requestData.authorName, 100, 'authorName');
    if (!authorNameLength.isValid) {
      return createErrorApiResponse(ErrorCode.VALIDATION_ERROR, authorNameLength.error!, requestId);
    }

    const commentTextLength = validateFieldLength(requestData.commentText, 1000, 'commentText');
    if (!commentTextLength.isValid) {
      return createErrorApiResponse(ErrorCode.VALIDATION_ERROR, commentTextLength.error!, requestId);
    }

    // Sanitize inputs
    const sanitizedAuthorName = sanitizeInput(requestData.authorName);
    const sanitizedCommentText = sanitizeInput(requestData.commentText);

    // Create comment
    const commentId = ulid();
    const now = new Date().toISOString();

    const comment: Comment = {
      id: commentId,
      encounterId,
      authorName: sanitizedAuthorName,
      deviceId: requestData.deviceId,
      commentText: sanitizedCommentText,
      createdAt: now
    };

    // Store comment
    await docClient.send(new PutCommand({
      TableName: COMMENTS_TABLE,
      Item: comment
    }));

    // Increment encounter comment count
    await docClient.send(new UpdateCommand({
      TableName: ENCOUNTERS_TABLE,
      Key: { id: encounterId },
      UpdateExpression: 'SET commentCount = if_not_exists(commentCount, :zero) + :inc, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':zero': 0,
        ':updatedAt': now
      }
    }));

    logInfo('Comment submitted successfully', { commentId, encounterId, requestId });

    return createSuccessApiResponse({ commentId, comment }, 201);

  } catch (error) {
    logError(error as Error, { encounterId, requestId });
    return createErrorApiResponse(ErrorCode.INTERNAL_ERROR, 'Failed to submit comment', requestId);
  }
}
