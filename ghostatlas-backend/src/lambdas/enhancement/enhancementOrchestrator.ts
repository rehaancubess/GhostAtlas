/**
 * EnhancementOrchestrator Lambda Function
 * Orchestrates the AI enhancement pipeline for approved encounters
 * 
 * Requirements: 10.1, 10.3, 10.5, 11.2, 11.3, 11.4, 11.5
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { generateNarrative } from './generateNarrative';
import { generateIllustration } from './generateIllustration';
import { generateNarration } from './generateNarration';
import { EnhancementMessage } from '../../utils/types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ENCOUNTERS_TABLE = process.env.ENCOUNTERS_TABLE || '';

/**
 * Lambda handler for SQS enhancement queue
 * Orchestrates sequential AI enhancement steps
 */
export async function handler(event: SQSEvent): Promise<void> {
  console.log('EnhancementOrchestrator Lambda invoked', {
    recordCount: event.Records.length,
  });

  // Process each SQS message
  for (const record of event.Records) {
    await processEnhancementMessage(record);
  }
}

/**
 * Process a single enhancement message from SQS
 */
async function processEnhancementMessage(record: SQSRecord): Promise<void> {
  let encounterId: string | undefined;

  try {
    // Parse the SQS message
    const message: EnhancementMessage = JSON.parse(record.body);
    encounterId = message.encounterId;

    console.log('Processing enhancement for encounter', { encounterId });

    // Validate required fields
    if (!message.encounterId || !message.originalStory || !message.location) {
      throw new Error('Invalid enhancement message: missing required fields');
    }

    // Step 1: Generate enhanced narrative using Bedrock Claude (~10s)
    console.log('Step 1: Generating enhanced narrative', { encounterId });
    const narrativeResult = await generateNarrative({
      originalStory: message.originalStory,
      location: message.location,
      encounterTime: message.encounterTime,
    });

    const enhancedStory = narrativeResult.enhancedStory;
    console.log('Enhanced narrative generated', {
      encounterId,
      length: enhancedStory.length,
    });

    // Step 2: Generate multiple illustrations using Bedrock Stable Diffusion (~45s)
    console.log('Step 2: Generating illustrations (3-5 images)', { encounterId });
    const illustrationResult = await generateIllustration({
      encounterId: message.encounterId,
      enhancedStory,
      location: message.location,
    });

    const illustrationUrls = illustrationResult.illustrationUrls;
    console.log('Illustrations generated', { 
      encounterId, 
      count: illustrationUrls.length,
      urls: illustrationUrls 
    });

    // Step 3: Generate narration using Polly (~10s)
    console.log('Step 3: Generating narration', { encounterId });
    const narrationResult = await generateNarration({
      encounterId: message.encounterId,
      enhancedStory,
    });

    const narrationUrl = narrationResult.narrationUrl;
    console.log('Narration generated', { encounterId, narrationUrl });

    // Step 4: Update encounter record with all generated content
    console.log('Step 4: Updating encounter record', { encounterId });
    await updateEncounterWithEnhancements(
      message.encounterId,
      enhancedStory,
      illustrationUrls,
      narrationUrl
    );

    console.log('Enhancement pipeline completed successfully', {
      encounterId,
    });
  } catch (error) {
    console.error('Enhancement pipeline failed', {
      encounterId,
      error,
    });

    // Update encounter status to "enhancement_failed"
    if (encounterId) {
      try {
        await updateEncounterStatus(
          encounterId,
          'enhancement_failed',
          (error as Error).message
        );
        console.log('Encounter status updated to enhancement_failed', {
          encounterId,
        });
      } catch (updateError) {
        console.error('Failed to update encounter status', {
          encounterId,
          updateError,
        });
      }
    }

    // Re-throw the error so SQS can handle retry logic
    throw error;
  }
}

/**
 * Update encounter record with all AI-generated enhancements
 */
async function updateEncounterWithEnhancements(
  encounterId: string,
  enhancedStory: string,
  illustrationUrls: string[],
  narrationUrl: string
): Promise<void> {
  const command = new UpdateCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId },
    UpdateExpression:
      'SET #enhancedStory = :enhancedStory, ' +
      '#illustrationUrls = :illustrationUrls, ' +
      '#narrationUrl = :narrationUrl, ' +
      '#status = :status, ' +
      '#updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#enhancedStory': 'enhancedStory',
      '#illustrationUrls': 'illustrationUrls',
      '#narrationUrl': 'narrationUrl',
      '#status': 'status',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':enhancedStory': enhancedStory,
      ':illustrationUrls': illustrationUrls,
      ':narrationUrl': narrationUrl,
      ':status': 'enhanced',
      ':updatedAt': new Date().toISOString(),
    },
  });

  try {
    await docClient.send(command);
    console.log('Encounter updated with enhancements and status set to enhanced', { encounterId });
  } catch (error) {
    console.error('Failed to update encounter with enhancements', {
      encounterId,
      error,
    });
    throw error;
  }
}

/**
 * Update encounter status to "enhancement_failed" on error
 */
async function updateEncounterStatus(
  encounterId: string,
  status: 'enhancement_failed',
  errorMessage: string
): Promise<void> {
  const command = new UpdateCommand({
    TableName: ENCOUNTERS_TABLE,
    Key: { id: encounterId },
    UpdateExpression:
      'SET #status = :status, ' +
      '#errorMessage = :errorMessage, ' +
      '#updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status',
      '#errorMessage': 'errorMessage',
      '#updatedAt': 'updatedAt',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':errorMessage': errorMessage,
      ':updatedAt': new Date().toISOString(),
    },
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error('Failed to update encounter status', {
      encounterId,
      error,
    });
    throw error;
  }
}
