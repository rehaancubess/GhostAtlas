# Deployment Configuration Guide

This document describes how to configure and deploy the GhostAtlas Backend across different environments.

## Environment Overview

The backend supports three environments:
- **Development (dev)**: Automatic deployment from `develop` branch
- **Staging (staging)**: Automatic deployment from `main` branch (requires manual approval in GitHub)
- **Production (prod)**: Automatic deployment from `main` branch after staging (requires manual approval in GitHub)

## GitHub Secrets Configuration

### Required Secrets per Environment

#### Development Environment
- `AWS_ACCESS_KEY_ID_DEV`: AWS access key for dev account
- `AWS_SECRET_ACCESS_KEY_DEV`: AWS secret key for dev account
- `AWS_ACCOUNT_ID_DEV`: AWS account ID for dev
- `AWS_REGION`: AWS region (default: us-east-1)

#### Staging Environment
- `AWS_ACCESS_KEY_ID_STAGING`: AWS access key for staging account
- `AWS_SECRET_ACCESS_KEY_STAGING`: AWS secret key for staging account
- `AWS_ACCOUNT_ID_STAGING`: AWS account ID for staging

#### Production Environment
- `AWS_ACCESS_KEY_ID_PROD`: AWS access key for prod account
- `AWS_SECRET_ACCESS_KEY_PROD`: AWS secret key for prod account
- `AWS_ACCOUNT_ID_PROD`: AWS account ID for prod
- `ALARM_EMAIL`: Email address for CloudWatch alarms (optional)

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret listed above

### Setting Up GitHub Environments

GitHub Environments provide protection rules and manual approval gates:

1. Go to Settings > Environments
2. Create three environments: `development`, `staging`, `production`
3. For `staging` and `production`:
   - Enable "Required reviewers"
   - Add team members who can approve deployments
   - Optionally set "Wait timer" for additional safety

## Environment-Specific Configuration

### Development
- **Purpose**: Rapid iteration and testing
- **Deployment**: Automatic on push to `develop` branch
- **Features**:
  - 7-day log retention
  - X-Ray tracing disabled
  - No reserved Lambda concurrency
  - No blue/green deployment

### Staging
- **Purpose**: Pre-production testing and validation
- **Deployment**: Automatic on push to `main` branch (with manual approval)
- **Features**:
  - 30-day log retention
  - X-Ray tracing enabled
  - Detailed CloudWatch metrics
  - No blue/green deployment

### Production
- **Purpose**: Live production environment
- **Deployment**: Automatic after staging deployment (with manual approval)
- **Features**:
  - 30-day log retention
  - X-Ray tracing enabled
  - Detailed CloudWatch metrics
  - Reserved Lambda concurrency (100)
  - Blue/green deployment strategy
  - Termination protection enabled
  - CloudWatch alarms with email notifications

## Blue/Green Deployment Strategy (Production Only)

Production deployments use a blue/green strategy to minimize downtime and enable quick rollback:

1. **Traffic Shifting**: New version receives 10% of traffic initially
2. **Monitoring**: System monitors for 5 minutes between shifts
3. **Gradual Rollout**: Traffic shifts in 10% increments
4. **Automatic Rollback**: If errors detected, traffic shifts back to previous version
5. **Complete Cutover**: After all health checks pass, 100% traffic goes to new version

### Rollback Procedure

If issues are detected after deployment:

```bash
# Rollback to previous version
cd ghostatlas-backend
cdk deploy --context environment=prod --rollback
```

## Manual Deployment

### Deploy Specific Environment

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

### Deploy with Custom Parameters

```bash
# Deploy with specific AWS profile
AWS_PROFILE=ghostatlas-prod npm run deploy:prod

# Deploy with custom region
CDK_DEFAULT_REGION=eu-west-1 npm run deploy:prod
```

## Environment Variables

### Lambda Function Environment Variables

All Lambda functions automatically receive:
- `ENCOUNTERS_TABLE`: DynamoDB table name
- `VERIFICATIONS_TABLE`: DynamoDB table name
- `RATINGS_TABLE`: DynamoDB table name
- `MEDIA_BUCKET`: S3 bucket name
- `ENHANCEMENT_QUEUE_URL`: SQS queue URL
- `BEDROCK_REGION`: AWS region for Bedrock
- `ENVIRONMENT`: Current environment (dev/staging/prod)

### CDK Context Variables

Pass context variables during deployment:

```bash
cdk deploy --context environment=prod --context alarmEmail=ops@example.com
```

## Stack Naming Convention

Stacks are named based on environment:
- Development: `GhostAtlasBackendStack-dev`
- Staging: `GhostAtlasBackendStack-staging`
- Production: `GhostAtlasBackendStack-prod`

This allows multiple environments to coexist in the same AWS account if needed.

## Resource Tagging

All resources are automatically tagged with:
- `Environment`: dev/staging/prod
- `Project`: GhostAtlas
- `CostCenter`: GhostAtlas-Backend
- `ManagedBy`: CDK

Use these tags for cost allocation and resource management.

## Monitoring and Alarms

### CloudWatch Alarms

Production environment includes alarms for:
- Lambda error rates >5% in 5 minutes
- API Gateway 5xx errors
- DynamoDB throttling
- SQS Dead Letter Queue messages
- Enhancement pipeline failures

Alarms send notifications to the email specified in `ALARM_EMAIL` secret.

### Viewing Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/GhostAtlasBackendStack-prod-SubmitEncounter --follow

# View API Gateway logs
aws logs tail /aws/apigateway/GhostAtlasBackendStack-prod --follow
```

## Cost Optimization

### Development
- Uses on-demand billing for all services
- Short log retention (7 days)
- No reserved concurrency

### Staging
- Uses on-demand billing
- 30-day log retention
- Minimal reserved resources

### Production
- Reserved Lambda concurrency for predictable performance
- 30-day log retention
- S3 lifecycle policies transition to Infrequent Access after 90 days

## Troubleshooting

### Deployment Failures

1. Check GitHub Actions logs for error messages
2. Verify AWS credentials are correct and have necessary permissions
3. Check CloudFormation stack events in AWS Console
4. Review CDK diff before deployment: `npm run diff`

### Stack Drift

Detect configuration drift:

```bash
aws cloudformation detect-stack-drift --stack-name GhostAtlasBackendStack-prod
```

### Permission Issues

Ensure IAM user/role has these permissions:
- CloudFormation: Full access
- Lambda: Full access
- API Gateway: Full access
- DynamoDB: Full access
- S3: Full access
- CloudFront: Full access
- SQS: Full access
- IAM: Create/update roles and policies
- CloudWatch: Create/update logs and alarms

## Security Best Practices

1. **Separate AWS Accounts**: Use different AWS accounts for dev, staging, and prod
2. **Least Privilege**: Grant minimum required permissions to deployment credentials
3. **Rotate Credentials**: Regularly rotate AWS access keys
4. **Enable MFA**: Require MFA for production deployments
5. **Audit Logs**: Enable CloudTrail for all environments
6. **Secrets Management**: Never commit secrets to version control

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery enabled
- S3: Versioning enabled
- CloudFormation: Stack templates stored in version control

### Recovery Procedure
1. Identify the last known good deployment
2. Checkout that commit in git
3. Deploy using CDK
4. Restore DynamoDB data from point-in-time backup if needed
5. Verify all services are operational

## Support

For deployment issues or questions:
1. Check GitHub Actions logs
2. Review CloudWatch logs
3. Check AWS CloudFormation console
4. Contact DevOps team
