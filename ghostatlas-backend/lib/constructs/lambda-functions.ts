import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';
import * as path from 'path';

export interface LambdaFunctionsProps {
  environment: string;
  config: EnvironmentConfig;
  encountersTable: dynamodb.Table;
  verificationsTable: dynamodb.Table;
  ratingsTable: dynamodb.Table;
  mediaBucket: s3.Bucket;
  enhancementQueue: sqs.Queue;
  distributionDomainName: string;
  apiHandlerRole?: iam.Role;
  enhancementPipelineRole?: iam.Role;
}

/**
 * Construct that creates all Lambda functions for the GhostAtlas backend
 * 
 * API Handler Functions:
 * - SubmitEncounter: Handle encounter submissions
 * - GetEncounters: Geospatial queries for encounters
 * - GetEncounterById: Retrieve specific encounter details
 * - RateEncounter: Submit ratings for encounters
 * - VerifyLocation: Location verification check-ins
 * - AdminListPending: List pending encounters for admin review
 * - AdminApprove: Approve encounters and trigger enhancement
 * - AdminReject: Reject encounter submissions
 */
export class LambdaFunctions extends Construct {
  public readonly submitEncounter: lambda.Function;
  public readonly getEncounters: lambda.Function;
  public readonly getAllEncounters: lambda.Function;
  public readonly getEncounterById: lambda.Function;
  public readonly rateEncounter: lambda.Function;
  public readonly verifyLocation: lambda.Function;
  public readonly triggerEnhancement: lambda.Function;
  public readonly adminListPending: lambda.Function;
  public readonly adminApprove: lambda.Function;
  public readonly adminReject: lambda.Function;
  public readonly enhancementOrchestrator: lambda.Function;
  public readonly generateNarrative: lambda.Function;
  public readonly generateIllustration: lambda.Function;
  public readonly generateNarration: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaFunctionsProps) {
    super(scope, id);

    // Common environment variables for all Lambda functions
    const commonEnvironment = {
      ENCOUNTERS_TABLE: props.encountersTable.tableName,
      VERIFICATIONS_TABLE: props.verificationsTable.tableName,
      RATINGS_TABLE: props.ratingsTable.tableName,
      MEDIA_BUCKET: props.mediaBucket.bucketName,
      CLOUDFRONT_DOMAIN: props.distributionDomainName,
      ENVIRONMENT: props.environment,
    };

    // Common Lambda configuration factory
    const createLambdaProps = (logGroupId: string) => ({
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: props.config.lambda.defaultMemorySize,
      timeout: cdk.Duration.seconds(props.config.lambda.defaultTimeout),
      tracing: props.config.monitoring.enableXRay 
        ? lambda.Tracing.ACTIVE 
        : lambda.Tracing.DISABLED,
      logGroup: new logs.LogGroup(this, logGroupId, {
        retention: props.config.monitoring.logRetentionDays,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      environment: commonEnvironment,
      bundling: {
        minify: false, // Disable minification for better error messages
        sourceMap: true,
        target: 'es2020',
        externalModules: [], // Bundle AWS SDK v3 since it's not included in Node.js 20 runtime
        forceDockerBundling: false, // Allow local bundling when Docker is not available
      },
    });

    // SubmitEncounter Lambda (Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2)
    this.submitEncounter = new nodejs.NodejsFunction(this, 'SubmitEncounter', {
      ...createLambdaProps('SubmitEncounterLogGroup'),
      functionName: `ghostatlas-submit-encounter-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/submitEncounter.ts'),
      handler: 'handler',
      description: 'Handle encounter submissions with validation and presigned URL generation',
      role: props.apiHandlerRole,
    });

    // GetEncounters Lambda (Requirements 3.1, 3.2, 3.3, 3.5)
    this.getEncounters = new nodejs.NodejsFunction(this, 'GetEncounters', {
      ...createLambdaProps('GetEncountersLogGroup'),
      functionName: `ghostatlas-get-encounters-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/getEncounters.ts'),
      handler: 'handler',
      description: 'Geospatial queries for approved encounters',
      memorySize: 1024, // Higher memory for geospatial calculations
      role: props.apiHandlerRole,
    });

    // GetAllEncounters Lambda - Returns all approved encounters without location filtering
    this.getAllEncounters = new nodejs.NodejsFunction(this, 'GetAllEncounters', {
      ...createLambdaProps('GetAllEncountersLogGroup'),
      functionName: `ghostatlas-get-all-encounters-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/getAllEncounters.ts'),
      handler: 'handler',
      description: 'Get all approved encounters without location filtering',
      role: props.apiHandlerRole,
    });

    // GetEncounterById Lambda (Requirements 4.1, 4.2, 4.3, 4.4, 4.5)
    this.getEncounterById = new nodejs.NodejsFunction(this, 'GetEncounterById', {
      ...createLambdaProps('GetEncounterByIdLogGroup'),
      functionName: `ghostatlas-get-encounter-by-id-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/getEncounterById.ts'),
      handler: 'handler',
      description: 'Retrieve specific encounter details with verifications and ratings',
      timeout: cdk.Duration.seconds(5),
      role: props.apiHandlerRole,
    });

    // RateEncounter Lambda (Requirements 5.1, 5.2, 5.3, 5.4, 5.5)
    this.rateEncounter = new nodejs.NodejsFunction(this, 'RateEncounter', {
      ...createLambdaProps('RateEncounterLogGroup'),
      functionName: `ghostatlas-rate-encounter-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/rateEncounter.ts'),
      handler: 'handler',
      description: 'Submit ratings for encounters with duplicate prevention',
      timeout: cdk.Duration.seconds(5),
      role: props.apiHandlerRole,
    });

    // VerifyLocation Lambda (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
    this.verifyLocation = new nodejs.NodejsFunction(this, 'VerifyLocation', {
      ...createLambdaProps('VerifyLocationLogGroup'),
      functionName: `ghostatlas-verify-location-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/verifyLocation.ts'),
      handler: 'handler',
      description: 'Location verification check-ins with distance validation',
      timeout: cdk.Duration.seconds(5),
      role: props.apiHandlerRole,
    });

    // TriggerEnhancement Lambda - Triggers AI enhancement pipeline
    this.triggerEnhancement = new nodejs.NodejsFunction(this, 'TriggerEnhancement', {
      ...createLambdaProps('TriggerEnhancementLogGroup'),
      functionName: `ghostatlas-trigger-enhancement-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/triggerEnhancement.ts'),
      handler: 'handler',
      description: 'Trigger AI enhancement pipeline for submitted encounters',
      timeout: cdk.Duration.seconds(5),
      environment: {
        ...commonEnvironment,
        ENHANCEMENT_QUEUE_URL: props.enhancementQueue.queueUrl,
      },
      role: props.apiHandlerRole,
    });

    // AdminListPending Lambda (Requirements 7.1, 7.2, 7.4, 7.5)
    this.adminListPending = new nodejs.NodejsFunction(this, 'AdminListPending', {
      ...createLambdaProps('AdminListPendingLogGroup'),
      functionName: `ghostatlas-admin-list-pending-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/adminListPending.ts'),
      handler: 'handler',
      description: 'List pending encounters for admin review',
      role: props.apiHandlerRole,
    });

    // AdminApprove Lambda (Requirements 8.1, 8.2, 8.3, 8.4, 8.5)
    this.adminApprove = new nodejs.NodejsFunction(this, 'AdminApprove', {
      ...createLambdaProps('AdminApproveLogGroup'),
      functionName: `ghostatlas-admin-approve-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/adminApprove.ts'),
      handler: 'handler',
      description: 'Approve encounters and trigger AI enhancement pipeline',
      timeout: cdk.Duration.seconds(5),
      environment: {
        ...commonEnvironment,
        ENHANCEMENT_QUEUE_URL: props.enhancementQueue.queueUrl,
      },
      role: props.apiHandlerRole,
    });

    // AdminReject Lambda (Requirements 9.1, 9.2, 9.3, 9.4, 9.5)
    this.adminReject = new nodejs.NodejsFunction(this, 'AdminReject', {
      ...createLambdaProps('AdminRejectLogGroup'),
      functionName: `ghostatlas-admin-reject-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/api/adminReject.ts'),
      handler: 'handler',
      description: 'Reject encounter submissions',
      timeout: cdk.Duration.seconds(5),
      role: props.apiHandlerRole,
    });

    // Enhancement Pipeline Lambda Functions (Requirements 10.1-10.7, 11.1-11.5)
    
    // EnhancementOrchestrator Lambda - Orchestrates the AI enhancement pipeline
    this.enhancementOrchestrator = new nodejs.NodejsFunction(this, 'EnhancementOrchestrator', {
      ...createLambdaProps('EnhancementOrchestratorLogGroup'),
      functionName: `ghostatlas-enhancement-orchestrator-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/enhancement/enhancementOrchestrator.ts'),
      handler: 'handler',
      description: 'Orchestrate AI enhancement pipeline for approved encounters',
      memorySize: 2048, // Increased for multiple image processing
      timeout: cdk.Duration.seconds(90), // Increased for multiple illustrations
      environment: {
        ...commonEnvironment,
        MIN_ILLUSTRATIONS: '1',
        MAX_ILLUSTRATIONS: '3',
        BEDROCK_REGION: props.config.bedrock?.region || 'us-east-1',
      },
      role: props.enhancementPipelineRole,
    });

    // Configure SQS trigger for enhancement orchestrator
    this.enhancementOrchestrator.addEventSource(
      new lambdaEventSources.SqsEventSource(props.enhancementQueue, {
        batchSize: 1,
        maxBatchingWindow: cdk.Duration.seconds(0),
      })
    );

    // GenerateNarrative Lambda - Generate horror narrative using Bedrock Claude
    this.generateNarrative = new nodejs.NodejsFunction(this, 'GenerateNarrative', {
      ...createLambdaProps('GenerateNarrativeLogGroup'),
      functionName: `ghostatlas-generate-narrative-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/enhancement/generateNarrative.ts'),
      handler: 'generateNarrative',
      description: 'Generate horror narrative using AWS Bedrock Claude',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(15),
      environment: {
        ...commonEnvironment,
        BEDROCK_REGION: props.config.bedrock?.region || 'us-east-1',
      },
      role: props.enhancementPipelineRole,
    });

    // GenerateIllustration Lambda - Generate multiple illustrations using Bedrock Titan Image Generator
    this.generateIllustration = new nodejs.NodejsFunction(this, 'GenerateIllustration', {
      ...createLambdaProps('GenerateIllustrationLogGroup'),
      functionName: `ghostatlas-generate-illustration-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/enhancement/generateIllustration.ts'),
      handler: 'generateIllustration',
      description: 'Generate multiple spooky illustrations using AWS Bedrock Titan Image Generator',
      memorySize: 2048,
      timeout: cdk.Duration.seconds(120), // Increased for Titan (slower than SD)
      environment: {
        ...commonEnvironment,
        MIN_ILLUSTRATIONS: '1', // Reduced to get pipeline working
        MAX_ILLUSTRATIONS: '3', // Reduced for faster processing
        BEDROCK_REGION: props.config.bedrock?.region || 'us-east-1',
      },
      role: props.enhancementPipelineRole,
    });

    // GenerateNarration Lambda - Generate voice narration using Polly
    this.generateNarration = new nodejs.NodejsFunction(this, 'GenerateNarration', {
      ...createLambdaProps('GenerateNarrationLogGroup'),
      functionName: `ghostatlas-generate-narration-${props.environment}`,
      entry: path.join(__dirname, '../../src/lambdas/enhancement/generateNarration.ts'),
      handler: 'generateNarration',
      description: 'Generate voice narration using AWS Polly',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(15),
      environment: commonEnvironment,
      role: props.enhancementPipelineRole,
    });

    // Add tags to all Lambda functions
    const lambdaFunctions = [
      this.submitEncounter,
      this.getEncounters,
      this.getAllEncounters,
      this.getEncounterById,
      this.rateEncounter,
      this.verifyLocation,
      this.triggerEnhancement,
      this.adminListPending,
      this.adminApprove,
      this.adminReject,
      this.enhancementOrchestrator,
      this.generateNarrative,
      this.generateIllustration,
      this.generateNarration,
    ];

    lambdaFunctions.forEach((fn) => {
      cdk.Tags.of(fn).add('Project', 'GhostAtlas');
      cdk.Tags.of(fn).add('Environment', props.environment);
      cdk.Tags.of(fn).add('Component', 'api');
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'SubmitEncounterFunctionArn', {
      value: this.submitEncounter.functionArn,
      description: 'ARN of SubmitEncounter Lambda function',
    });

    new cdk.CfnOutput(this, 'GetEncountersFunctionArn', {
      value: this.getEncounters.functionArn,
      description: 'ARN of GetEncounters Lambda function',
    });
  }
}
