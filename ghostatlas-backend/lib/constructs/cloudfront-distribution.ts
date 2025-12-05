import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface CloudFrontDistributionProps {
  environment: string;
  config: EnvironmentConfig;
  mediaBucket: s3.Bucket;
}

/**
 * Construct that creates CloudFront distribution for the GhostAtlas backend
 * 
 * Configuration:
 * - S3 origin with Origin Access Control (OAC) for secure access
 * - Cache behaviors with 86400s (24 hours) default TTL
 * - Compression enabled for text-based assets
 * - HTTPS-only access required
 * - All edge locations for global performance
 */
export class CloudFrontDistribution extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontDistributionProps) {
    super(scope, id);

    // Create CloudFront distribution with S3 bucket origin
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `GhostAtlas Media CDN (${props.environment})`,
      
      // S3 origin configuration using S3BucketOrigin (recommended approach)
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.mediaBucket),
        
        // Cache policy with 86400s (24 hours) default TTL (Requirement 14.3)
        cachePolicy: new cloudfront.CachePolicy(this, 'CachePolicy', {
          cachePolicyName: `ghostatlas-media-cache-${props.environment}`,
          comment: 'Cache policy for GhostAtlas media assets',
          defaultTtl: cdk.Duration.seconds(props.config.cloudfront.defaultTtl),
          minTtl: cdk.Duration.seconds(props.config.cloudfront.minTtl),
          maxTtl: cdk.Duration.seconds(props.config.cloudfront.maxTtl),
          
          // Cache based on query strings for dynamic content
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          
          // Cache based on headers
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
            'Origin',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
          ),
          
          // Enable compression (Requirement 14.4)
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        }),
        
        // Viewer protocol policy: HTTPS only (Requirement 14.4)
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        
        // Allowed HTTP methods
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        
        // Compress objects automatically
        compress: true,
      },
      
      // Price class: Use all edge locations for best performance
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      
      // Enable IPv6
      enableIpv6: true,
      
      // HTTP version
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      
      // Minimum TLS version
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      
      // Enable logging (optional, can be configured per environment)
      enableLogging: props.environment === 'prod',
      logBucket: props.environment === 'prod' 
        ? new s3.Bucket(this, 'LogBucket', {
            bucketName: `ghostatlas-cloudfront-logs-${props.environment}-${cdk.Aws.ACCOUNT_ID}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            lifecycleRules: [
              {
                id: 'DeleteOldLogs',
                enabled: true,
                expiration: cdk.Duration.days(90),
              },
            ],
          })
        : undefined,
      logFilePrefix: 'cloudfront-logs/',
    });

    // Add bucket policy to restrict access to CloudFront only (Requirement 14.2)
    // Note: S3BucketOrigin.withOriginAccessControl() automatically adds the necessary
    // bucket policy to allow CloudFront access. We add an additional policy to deny
    // non-HTTPS requests for extra security.
    props.mediaBucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: 'DenyInsecureTransport',
        effect: cdk.aws_iam.Effect.DENY,
        principals: [new cdk.aws_iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [
          props.mediaBucket.bucketArn,
          `${props.mediaBucket.bucketArn}/*`,
        ],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false',
          },
        },
      })
    );

    // Add tags
    cdk.Tags.of(this.distribution).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.distribution).add('Environment', props.environment);
    cdk.Tags.of(this.distribution).add('Component', 'cdn');

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `${props.environment}-DistributionId`,
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: `${props.environment}-DistributionDomainName`,
    });

    new cdk.CfnOutput(this, 'MediaBaseUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Base URL for media assets',
      exportName: `${props.environment}-MediaBaseUrl`,
    });
  }
}
