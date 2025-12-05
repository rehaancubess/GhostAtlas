import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface SQSQueuesProps {
  environment: string;
  config: EnvironmentConfig;
}

/**
 * Construct that creates SQS queues for the GhostAtlas backend
 * 
 * Queues:
 * - Enhancement Queue: Receives approved encounters for AI enhancement processing
 * - Enhancement DLQ: Dead Letter Queue for failed enhancement messages
 * 
 * Configuration:
 * - 14-day message retention (Requirement 8.2, 8.3)
 * - 60-second visibility timeout
 * - 20-second long polling
 * - Dead Letter Queue after 3 retries
 * - SSE-SQS encryption enabled
 */
export class SQSQueues extends Construct {
  public readonly enhancementQueue: sqs.Queue;
  public readonly enhancementDLQ: sqs.Queue;

  constructor(scope: Construct, id: string, props: SQSQueuesProps) {
    super(scope, id);

    // Dead Letter Queue for failed enhancement messages
    // Messages are sent here after 3 failed processing attempts
    this.enhancementDLQ = new sqs.Queue(this, 'EnhancementDLQ', {
      queueName: `ghostatlas-enhancement-dlq-${props.environment}`,
      
      // Retention period: 14 days (same as main queue)
      retentionPeriod: cdk.Duration.days(props.config.sqs.messageRetentionDays),
      
      // Encryption at rest using SSE-SQS
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      
      // Removal policy: DESTROY for dev, RETAIN for staging/prod
      removalPolicy: props.environment === 'dev' 
        ? cdk.RemovalPolicy.DESTROY 
        : cdk.RemovalPolicy.RETAIN,
    });

    // Main Enhancement Queue
    // Receives messages when encounters are approved for AI enhancement
    this.enhancementQueue = new sqs.Queue(this, 'EnhancementQueue', {
      queueName: `ghostatlas-enhancement-queue-${props.environment}`,
      
      // Message retention: 14 days (Requirement 8.2, 8.3)
      retentionPeriod: cdk.Duration.days(props.config.sqs.messageRetentionDays),
      
      // Visibility timeout: 60 seconds
      // Time window for Lambda to process message before it becomes visible again
      visibilityTimeout: cdk.Duration.seconds(props.config.sqs.visibilityTimeout),
      
      // Long polling: 20 seconds
      // Reduces empty responses and API costs
      receiveMessageWaitTime: cdk.Duration.seconds(props.config.sqs.receiveWaitTime),
      
      // Dead Letter Queue configuration
      // Messages are sent to DLQ after 3 failed processing attempts
      deadLetterQueue: {
        queue: this.enhancementDLQ,
        maxReceiveCount: props.config.sqs.maxReceiveCount,
      },
      
      // Encryption at rest using SSE-SQS
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      
      // Removal policy: DESTROY for dev, RETAIN for staging/prod
      removalPolicy: props.environment === 'dev' 
        ? cdk.RemovalPolicy.DESTROY 
        : cdk.RemovalPolicy.RETAIN,
    });

    // Add tags to queues
    cdk.Tags.of(this.enhancementQueue).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.enhancementQueue).add('Environment', props.environment);
    cdk.Tags.of(this.enhancementQueue).add('Component', 'enhancement-pipeline');
    
    cdk.Tags.of(this.enhancementDLQ).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.enhancementDLQ).add('Environment', props.environment);
    cdk.Tags.of(this.enhancementDLQ).add('Component', 'enhancement-pipeline');

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'EnhancementQueueUrl', {
      value: this.enhancementQueue.queueUrl,
      description: 'URL of the Enhancement SQS queue',
      exportName: `${props.environment}-EnhancementQueueUrl`,
    });

    new cdk.CfnOutput(this, 'EnhancementQueueArn', {
      value: this.enhancementQueue.queueArn,
      description: 'ARN of the Enhancement SQS queue',
      exportName: `${props.environment}-EnhancementQueueArn`,
    });

    new cdk.CfnOutput(this, 'EnhancementDLQUrl', {
      value: this.enhancementDLQ.queueUrl,
      description: 'URL of the Enhancement Dead Letter Queue',
      exportName: `${props.environment}-EnhancementDLQUrl`,
    });

    new cdk.CfnOutput(this, 'EnhancementDLQArn', {
      value: this.enhancementDLQ.queueArn,
      description: 'ARN of the Enhancement Dead Letter Queue',
      exportName: `${props.environment}-EnhancementDLQArn`,
    });
  }
}
