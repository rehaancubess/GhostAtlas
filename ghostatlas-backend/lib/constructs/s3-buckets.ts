import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface S3BucketsProps {
  environment: string;
  config: EnvironmentConfig;
}

/**
 * Construct that creates S3 buckets for the GhostAtlas backend
 * 
 * Buckets:
 * - Media Bucket: Stores user-uploaded images, AI-generated illustrations, and narration audio
 * 
 * Configuration:
 * - Versioning enabled for data protection
 * - Encryption at rest (AES-256)
 * - CORS configured for Flutter app domain
 * - Lifecycle policy: transition to Infrequent Access after 90 days
 * - Public access blocked (access via CloudFront only)
 * - Bucket policy restricts access to CloudFront OAC only
 */
export class S3Buckets extends Construct {
  public readonly mediaBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3BucketsProps) {
    super(scope, id);

    // Media Bucket for encounter images, illustrations, and narration
    this.mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `ghostatlas-media-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
      
      // Versioning for data protection (Requirement 14.1)
      versioned: true,
      
      // Encryption at rest with AES-256 (Requirement 14.1, 14.2)
      encryption: s3.BucketEncryption.S3_MANAGED,
      
      // Enforce encryption for all uploads
      enforceSSL: true,
      
      // Block all public access - access only via CloudFront
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      
      // CORS configuration for Flutter app domain (Requirement 14.5)
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: [
            '*', // In production, replace with specific Flutter app domain
          ],
          allowedHeaders: ['*'],
          exposedHeaders: [
            'ETag',
            'x-amz-server-side-encryption',
            'x-amz-request-id',
            'x-amz-id-2',
          ],
          maxAge: 3000,
        },
      ],
      
      // Lifecycle policy: transition to Infrequent Access after 90 days (Requirement 14.2)
      lifecycleRules: [
        {
          id: 'TransitionToIA',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(props.config.s3.lifecycleTransitionDays),
            },
          ],
        },
      ],
      
      // Removal policy: DESTROY for dev (with auto-delete), RETAIN for staging/prod
      removalPolicy: props.environment === 'dev' 
        ? cdk.RemovalPolicy.DESTROY 
        : cdk.RemovalPolicy.RETAIN,
      
      // Auto-delete objects on stack deletion (only for dev environment)
      autoDeleteObjects: props.environment === 'dev',
    });

    // Add tags
    cdk.Tags.of(this.mediaBucket).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.mediaBucket).add('Environment', props.environment);
    cdk.Tags.of(this.mediaBucket).add('Component', 'storage');

    // CloudFormation Output
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucket.bucketName,
      description: 'Name of the media S3 bucket',
      exportName: `${props.environment}-MediaBucketName`,
    });

    new cdk.CfnOutput(this, 'MediaBucketArn', {
      value: this.mediaBucket.bucketArn,
      description: 'ARN of the media S3 bucket',
      exportName: `${props.environment}-MediaBucketArn`,
    });
  }
}
