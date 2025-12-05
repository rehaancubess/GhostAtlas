import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface IAMRolesProps {
  environment: string;
  config: EnvironmentConfig;
  encountersTable: dynamodb.Table;
  verificationsTable: dynamodb.Table;
  ratingsTable: dynamodb.Table;
  mediaBucket: s3.Bucket;
  enhancementQueue: sqs.Queue;
}

/**
 * Construct that creates IAM roles for Lambda functions following least privilege principle
 * 
 * Roles:
 * - API Handler Role: DynamoDB read/write, S3 presigned URL generation
 * - Enhancement Pipeline Role: Bedrock, Polly, S3, SQS, DynamoDB access
 * 
 * Requirements: 15.1 (Principle of least privilege)
 */
export class IAMRoles extends Construct {
  public readonly apiHandlerRole: iam.Role;
  public readonly enhancementPipelineRole: iam.Role;

  constructor(scope: Construct, id: string, props: IAMRolesProps) {
    super(scope, id);

    // ============================================
    // API Handler Role
    // ============================================
    // Used by: SubmitEncounter, GetEncounters, GetEncounterById, 
    //          RateEncounter, VerifyLocation, AdminListPending, 
    //          AdminApprove, AdminReject
    
    this.apiHandlerRole = new iam.Role(this, 'ApiHandlerRole', {
      roleName: `ghostatlas-api-handler-${props.environment}`,
      description: 'IAM role for GhostAtlas API handler Lambda functions',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      
      // Basic Lambda execution permissions
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions - scoped to specific tables
    this.apiHandlerRole.addToPolicy(new iam.PolicyStatement({
      sid: 'DynamoDBAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:BatchGetItem',
        'dynamodb:BatchWriteItem',
      ],
      resources: [
        props.encountersTable.tableArn,
        `${props.encountersTable.tableArn}/index/*`,
        props.verificationsTable.tableArn,
        `${props.verificationsTable.tableArn}/index/*`,
        props.ratingsTable.tableArn,
        `${props.ratingsTable.tableArn}/index/*`,
      ],
    }));

    // S3 permissions - scoped to media bucket
    // Allows presigned URL generation and object operations
    this.apiHandlerRole.addToPolicy(new iam.PolicyStatement({
      sid: 'S3MediaBucketAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:GetObject',
        's3:GetObjectAcl',
        's3:DeleteObject',
      ],
      resources: [
        `${props.mediaBucket.bucketArn}/*`,
      ],
    }));

    // S3 bucket-level permissions for presigned URL generation
    this.apiHandlerRole.addToPolicy(new iam.PolicyStatement({
      sid: 'S3BucketLevelAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        's3:ListBucket',
        's3:GetBucketLocation',
      ],
      resources: [
        props.mediaBucket.bucketArn,
      ],
    }));

    // SQS permissions - only for AdminApprove to send messages
    this.apiHandlerRole.addToPolicy(new iam.PolicyStatement({
      sid: 'SQSEnhancementQueueAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:SendMessage',
        'sqs:GetQueueUrl',
        'sqs:GetQueueAttributes',
      ],
      resources: [
        props.enhancementQueue.queueArn,
      ],
    }));

    // X-Ray tracing permissions (if enabled)
    if (props.config.monitoring.enableXRay) {
      this.apiHandlerRole.addToPolicy(new iam.PolicyStatement({
        sid: 'XRayAccess',
        effect: iam.Effect.ALLOW,
        actions: [
          'xray:PutTraceSegments',
          'xray:PutTelemetryRecords',
        ],
        resources: ['*'],
      }));
    }

    // ============================================
    // Enhancement Pipeline Role
    // ============================================
    // Used by: EnhancementOrchestrator, GenerateNarrative, 
    //          GenerateIllustration, GenerateNarration
    
    this.enhancementPipelineRole = new iam.Role(this, 'EnhancementPipelineRole', {
      roleName: `ghostatlas-enhancement-pipeline-${props.environment}`,
      description: 'IAM role for GhostAtlas AI enhancement pipeline Lambda functions',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      
      // Basic Lambda execution permissions
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions - only needs to update encounters table
    this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
      sid: 'DynamoDBEncountersAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
        'dynamodb:PutItem',
      ],
      resources: [
        props.encountersTable.tableArn,
      ],
    }));

    // S3 permissions - write AI-generated media assets
    this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
      sid: 'S3MediaBucketWrite',
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:GetObject',
      ],
      resources: [
        `${props.mediaBucket.bucketArn}/*`,
      ],
    }));

    // SQS permissions - receive and delete messages from enhancement queue
    this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
      sid: 'SQSEnhancementQueueConsume',
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
        'sqs:ChangeMessageVisibility',
      ],
      resources: [
        props.enhancementQueue.queueArn,
      ],
    }));

    // AWS Bedrock permissions - for Nova (narrative) and Titan Image (illustration)
    this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
      sid: 'BedrockAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: [
        // Amazon Nova Pro for narrative generation
        `arn:aws:bedrock:*::foundation-model/amazon.nova-*`,
        // Amazon Titan Image Generator for illustration generation
        `arn:aws:bedrock:*::foundation-model/amazon.titan-image-*`,
        // Stable Diffusion XL for illustration generation (fallback)
        `arn:aws:bedrock:*::foundation-model/stability.stable-diffusion-xl-*`,
      ],
    }));

    // AWS Polly permissions - for voice narration
    this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
      sid: 'PollyAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        'polly:SynthesizeSpeech',
        'polly:DescribeVoices',
      ],
      resources: ['*'], // Polly doesn't support resource-level permissions
    }));

    // X-Ray tracing permissions (if enabled)
    if (props.config.monitoring.enableXRay) {
      this.enhancementPipelineRole.addToPolicy(new iam.PolicyStatement({
        sid: 'XRayAccess',
        effect: iam.Effect.ALLOW,
        actions: [
          'xray:PutTraceSegments',
          'xray:PutTelemetryRecords',
        ],
        resources: ['*'],
      }));
    }

    // Add tags to roles
    cdk.Tags.of(this.apiHandlerRole).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.apiHandlerRole).add('Environment', props.environment);
    cdk.Tags.of(this.apiHandlerRole).add('Component', 'iam');

    cdk.Tags.of(this.enhancementPipelineRole).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.enhancementPipelineRole).add('Environment', props.environment);
    cdk.Tags.of(this.enhancementPipelineRole).add('Component', 'iam');

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiHandlerRoleArn', {
      value: this.apiHandlerRole.roleArn,
      description: 'ARN of API handler IAM role',
      exportName: `${props.environment}-ApiHandlerRoleArn`,
    });

    new cdk.CfnOutput(this, 'EnhancementPipelineRoleArn', {
      value: this.enhancementPipelineRole.roleArn,
      description: 'ARN of enhancement pipeline IAM role',
      exportName: `${props.environment}-EnhancementPipelineRoleArn`,
    });
  }
}
