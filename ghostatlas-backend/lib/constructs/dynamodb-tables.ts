import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface DynamoDBTablesProps {
  environment: string;
  config: EnvironmentConfig;
}

/**
 * Construct that creates all DynamoDB tables for the GhostAtlas backend
 * 
 * Tables:
 * - Encounters: Main table for paranormal encounter submissions
 * - Verifications: Location verification check-ins
 * - Ratings: User ratings for encounters
 */
export class DynamoDBTables extends Construct {
  public readonly encountersTable: dynamodb.Table;
  public readonly verificationsTable: dynamodb.Table;
  public readonly ratingsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBTablesProps) {
    super(scope, id);

    // Encounters Table
    // Primary Key: id (String, ULID)
    // GSI 1: status-encounterTime-index (status as PK, encounterTime as SK)
    // GSI 2: geohash-status-index (geohash as PK, status as SK)
    this.encountersTable = new dynamodb.Table(this, 'EncountersTable', {
      tableName: `ghostatlas-encounters-${props.environment}`,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: props.config.dynamodb.billingMode === 'PAY_PER_REQUEST'
        ? dynamodb.BillingMode.PAY_PER_REQUEST
        : dynamodb.BillingMode.PROVISIONED,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: props.config.dynamodb.pointInTimeRecovery
        ? { pointInTimeRecoveryEnabled: true }
        : undefined,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // GSI 1: Query encounters by status, sorted by time
    // Used for: Admin panel (pending encounters), public queries (approved encounters)
    this.encountersTable.addGlobalSecondaryIndex({
      indexName: 'status-encounterTime-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'encounterTime',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI 2: Query encounters by geohash for geospatial queries
    // Used for: Optimizing location-based queries
    this.encountersTable.addGlobalSecondaryIndex({
      indexName: 'geohash-status-index',
      partitionKey: {
        name: 'geohash',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Verifications Table
    // Composite Primary Key: encounterId (PK) + verifiedAt (SK)
    // Used for: Storing location verification check-ins
    this.verificationsTable = new dynamodb.Table(this, 'VerificationsTable', {
      tableName: `ghostatlas-verifications-${props.environment}`,
      partitionKey: {
        name: 'encounterId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'verifiedAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: props.config.dynamodb.billingMode === 'PAY_PER_REQUEST'
        ? dynamodb.BillingMode.PAY_PER_REQUEST
        : dynamodb.BillingMode.PROVISIONED,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: props.config.dynamodb.pointInTimeRecovery
        ? { pointInTimeRecoveryEnabled: true }
        : undefined,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Ratings Table
    // Composite Primary Key: encounterId (PK) + deviceId (SK)
    // Used for: Preventing duplicate ratings from same device
    this.ratingsTable = new dynamodb.Table(this, 'RatingsTable', {
      tableName: `ghostatlas-ratings-${props.environment}`,
      partitionKey: {
        name: 'encounterId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'deviceId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: props.config.dynamodb.billingMode === 'PAY_PER_REQUEST'
        ? dynamodb.BillingMode.PAY_PER_REQUEST
        : dynamodb.BillingMode.PROVISIONED,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: props.config.dynamodb.pointInTimeRecovery
        ? { pointInTimeRecoveryEnabled: true }
        : undefined,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add tags to all tables
    cdk.Tags.of(this.encountersTable).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.encountersTable).add('Environment', props.environment);
    cdk.Tags.of(this.verificationsTable).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.verificationsTable).add('Environment', props.environment);
    cdk.Tags.of(this.ratingsTable).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.ratingsTable).add('Environment', props.environment);

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'EncountersTableName', {
      value: this.encountersTable.tableName,
      description: 'Name of the Encounters DynamoDB table',
      exportName: `${props.environment}-EncountersTableName`,
    });

    new cdk.CfnOutput(this, 'VerificationsTableName', {
      value: this.verificationsTable.tableName,
      description: 'Name of the Verifications DynamoDB table',
      exportName: `${props.environment}-VerificationsTableName`,
    });

    new cdk.CfnOutput(this, 'RatingsTableName', {
      value: this.ratingsTable.tableName,
      description: 'Name of the Ratings DynamoDB table',
      exportName: `${props.environment}-RatingsTableName`,
    });
  }
}
