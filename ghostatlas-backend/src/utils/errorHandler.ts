/**
 * Error handling utility functions for GhostAtlas Backend
 * Provides standardized error response formatting, error logging, and error code mapping
 */

import { ApiResponse, ErrorResponse } from './types';

/**
 * Standard error codes used throughout the application
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR'
}

/**
 * Maps error codes to HTTP status codes
 */
const ERROR_CODE_TO_HTTP_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ALREADY_EXISTS]: 409,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.STORAGE_ERROR]: 500,
  [ErrorCode.AI_SERVICE_ERROR]: 500
};

/**
 * Creates a standardized error response
 * 
 * @param errorCode - Error code from ErrorCode enum
 * @param message - Human-readable error message
 * @param requestId - Optional request ID for tracing
 * @returns Formatted error response object
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  message: string,
  requestId?: string
): ErrorResponse {
  return {
    errorCode,
    message,
    timestamp: new Date().toISOString(),
    requestId
  };
}

/**
 * Creates an API Gateway response with error details
 * 
 * @param errorCode - Error code from ErrorCode enum
 * @param message - Human-readable error message
 * @param requestId - Optional request ID for tracing
 * @returns API Gateway response object
 */
export function createErrorApiResponse(
  errorCode: ErrorCode,
  message: string,
  requestId?: string
): ApiResponse {
  const statusCode = ERROR_CODE_TO_HTTP_STATUS[errorCode] || 500;
  const errorResponse = createErrorResponse(errorCode, message, requestId);
  
  return {
    statusCode,
    body: JSON.stringify(errorResponse),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
  };
}

/**
 * Creates a success API Gateway response
 * 
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 * @returns API Gateway response object
 */
export function createSuccessApiResponse(
  data: any,
  statusCode: number = 200
): ApiResponse {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
  };
}

/**
 * Logs error to CloudWatch with context
 * 
 * @param error - Error object or message
 * @param context - Additional context information
 * @param requestId - Optional request ID for tracing
 */
export function logError(
  error: Error | string,
  context?: Record<string, any>,
  requestId?: string
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: errorMessage,
    stack: errorStack,
    context,
    requestId
  };
  
  console.error(JSON.stringify(logEntry));
}

/**
 * Logs warning to CloudWatch with context
 * 
 * @param message - Warning message
 * @param context - Additional context information
 * @param requestId - Optional request ID for tracing
 */
export function logWarning(
  message: string,
  context?: Record<string, any>,
  requestId?: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'WARNING',
    message,
    context,
    requestId
  };
  
  console.warn(JSON.stringify(logEntry));
}

/**
 * Logs info to CloudWatch with context
 * 
 * @param message - Info message
 * @param context - Additional context information
 * @param requestId - Optional request ID for tracing
 */
export function logInfo(
  message: string,
  context?: Record<string, any>,
  requestId?: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    context,
    requestId
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * Maps common AWS SDK errors to application error codes
 * 
 * @param error - AWS SDK error
 * @returns Mapped error code
 */
export function mapAwsErrorToErrorCode(error: any): ErrorCode {
  const errorName = error.name || error.code || '';
  
  // DynamoDB errors
  if (errorName.includes('ResourceNotFoundException')) {
    return ErrorCode.NOT_FOUND;
  }
  if (errorName.includes('ConditionalCheckFailedException')) {
    return ErrorCode.ALREADY_EXISTS;
  }
  if (errorName.includes('ProvisionedThroughputExceededException')) {
    return ErrorCode.RATE_LIMIT_EXCEEDED;
  }
  if (errorName.includes('ValidationException')) {
    return ErrorCode.VALIDATION_ERROR;
  }
  
  // S3 errors
  if (errorName.includes('NoSuchKey')) {
    return ErrorCode.NOT_FOUND;
  }
  if (errorName.includes('AccessDenied')) {
    return ErrorCode.FORBIDDEN;
  }
  
  // Bedrock/Polly errors
  if (errorName.includes('ThrottlingException')) {
    return ErrorCode.RATE_LIMIT_EXCEEDED;
  }
  if (errorName.includes('ServiceUnavailable')) {
    return ErrorCode.SERVICE_UNAVAILABLE;
  }
  
  // Default to internal error
  return ErrorCode.INTERNAL_ERROR;
}

/**
 * Handles errors in Lambda functions with standardized logging and response
 * 
 * @param error - Error object
 * @param context - Lambda context or additional information
 * @param requestId - Optional request ID for tracing
 * @returns API Gateway error response
 */
export function handleLambdaError(
  error: any,
  context?: Record<string, any>,
  requestId?: string
): ApiResponse {
  // Log the error
  logError(error, context, requestId);
  
  // Map AWS errors to application error codes
  const errorCode = mapAwsErrorToErrorCode(error);
  
  // Create user-friendly error message
  let message = 'An unexpected error occurred';
  
  if (error.message) {
    // For validation and known errors, use the original message
    if (errorCode === ErrorCode.VALIDATION_ERROR || 
        errorCode === ErrorCode.NOT_FOUND ||
        errorCode === ErrorCode.ALREADY_EXISTS) {
      message = error.message;
    }
  }
  
  return createErrorApiResponse(errorCode, message, requestId);
}

/**
 * Creates a rate limit exceeded response with Retry-After header
 * 
 * @param retryAfterSeconds - Number of seconds to wait before retrying
 * @param requestId - Optional request ID for tracing
 * @returns API Gateway response with rate limit error
 */
export function createRateLimitResponse(
  retryAfterSeconds: number = 60,
  requestId?: string
): ApiResponse {
  const response = createErrorApiResponse(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Please try again later.',
    requestId
  );
  
  // Add Retry-After header
  response.headers = {
    ...response.headers,
    'Retry-After': retryAfterSeconds.toString()
  };
  
  return response;
}
