import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';
import { DynamoDBTables } from './constructs/dynamodb-tables';
import { S3Buckets } from './constructs/s3-buckets';
import { CloudFrontDistribution } from './constructs/cloudfront-distribution';
import { SQSQueues } from './constructs/sqs-queues';
import { IAMRoles } from './constructs/iam-roles';
import { LambdaFunctions } from './constructs/lambda-functions';
import { ApiGateway } from './constructs/api-gateway';
import { CloudWatchAlarms } from './constructs/cloudwatch-alarms';

export interface GhostAtlasBackendStackProps extends cdk.StackProps {
  environment: string;
  config: EnvironmentConfig;
}

export class GhostAtlasBackendStack extends cdk.Stack {
  public readonly dynamoDBTables: DynamoDBTables;
  public readonly s3Buckets: S3Buckets;
  public readonly cloudFrontDistribution: CloudFrontDistribution;
  public readonly sqsQueues: SQSQueues;
  public readonly iamRoles: IAMRoles;
  public readonly lambdaFunctions: LambdaFunctions;
  public readonly apiGateway: ApiGateway;
  public readonly cloudWatchAlarms: CloudWatchAlarms;

  constructor(scope: Construct, id: string, props: GhostAtlasBackendStackProps) {
    super(scope, id, props);

    // Create DynamoDB tables
    this.dynamoDBTables = new DynamoDBTables(this, 'DynamoDBTables', {
      environment: props.environment,
      config: props.config,
    });

    // Create S3 buckets
    this.s3Buckets = new S3Buckets(this, 'S3Buckets', {
      environment: props.environment,
      config: props.config,
    });

    // Create CloudFront distribution
    this.cloudFrontDistribution = new CloudFrontDistribution(this, 'CloudFrontDistribution', {
      environment: props.environment,
      config: props.config,
      mediaBucket: this.s3Buckets.mediaBucket,
    });

    // Create SQS queues for enhancement pipeline
    this.sqsQueues = new SQSQueues(this, 'SQSQueues', {
      environment: props.environment,
      config: props.config,
    });

    // Create IAM roles for Lambda functions
    this.iamRoles = new IAMRoles(this, 'IAMRoles', {
      environment: props.environment,
      config: props.config,
      encountersTable: this.dynamoDBTables.encountersTable,
      verificationsTable: this.dynamoDBTables.verificationsTable,
      ratingsTable: this.dynamoDBTables.ratingsTable,
      mediaBucket: this.s3Buckets.mediaBucket,
      enhancementQueue: this.sqsQueues.enhancementQueue,
    });

    // Create Lambda functions
    this.lambdaFunctions = new LambdaFunctions(this, 'LambdaFunctions', {
      environment: props.environment,
      config: props.config,
      encountersTable: this.dynamoDBTables.encountersTable,
      verificationsTable: this.dynamoDBTables.verificationsTable,
      ratingsTable: this.dynamoDBTables.ratingsTable,
      mediaBucket: this.s3Buckets.mediaBucket,
      enhancementQueue: this.sqsQueues.enhancementQueue,
      distributionDomainName: this.cloudFrontDistribution.distribution.distributionDomainName,
      apiHandlerRole: this.iamRoles.apiHandlerRole,
      enhancementPipelineRole: this.iamRoles.enhancementPipelineRole,
    });

    // Create API Gateway
    this.apiGateway = new ApiGateway(this, 'ApiGateway', {
      environment: props.environment,
      config: props.config,
      lambdaFunctions: {
        submitEncounter: this.lambdaFunctions.submitEncounter,
        getEncounters: this.lambdaFunctions.getEncounters,
        getAllEncounters: this.lambdaFunctions.getAllEncounters,
        getEncounterById: this.lambdaFunctions.getEncounterById,
        rateEncounter: this.lambdaFunctions.rateEncounter,
        verifyLocation: this.lambdaFunctions.verifyLocation,
        triggerEnhancement: this.lambdaFunctions.triggerEnhancement,
        adminListPending: this.lambdaFunctions.adminListPending,
        adminApprove: this.lambdaFunctions.adminApprove,
        adminReject: this.lambdaFunctions.adminReject,
      },
    });

    // Create CloudWatch Alarms for monitoring
    this.cloudWatchAlarms = new CloudWatchAlarms(this, 'CloudWatchAlarms', {
      environment: props.environment,
      config: props.config,
      lambdaFunctions: {
        submitEncounter: this.lambdaFunctions.submitEncounter,
        getEncounters: this.lambdaFunctions.getEncounters,
        getAllEncounters: this.lambdaFunctions.getAllEncounters,
        getEncounterById: this.lambdaFunctions.getEncounterById,
        rateEncounter: this.lambdaFunctions.rateEncounter,
        verifyLocation: this.lambdaFunctions.verifyLocation,
        adminListPending: this.lambdaFunctions.adminListPending,
        adminApprove: this.lambdaFunctions.adminApprove,
        adminReject: this.lambdaFunctions.adminReject,
      },
      api: this.apiGateway.api,
      encountersTable: this.dynamoDBTables.encountersTable,
      verificationsTable: this.dynamoDBTables.verificationsTable,
      ratingsTable: this.dynamoDBTables.ratingsTable,
      enhancementDLQ: this.sqsQueues.enhancementDLQ,
    });

    // Output the environment
    new cdk.CfnOutput(this, 'Environment', {
      value: props.environment,
      description: 'Deployment environment',
    });
  }
}
