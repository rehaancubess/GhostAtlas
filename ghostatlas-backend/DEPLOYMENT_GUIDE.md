# GhostAtlas Backend - Complete Deployment Guide

This comprehensive guide covers everything you need to deploy, monitor, and troubleshoot the GhostAtlas AWS Backend infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring and Observability](#monitoring-and-observability)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance and Operations](#maintenance-and-operations)

---

## Prerequisites

### Required Tools and Versions

| Tool | Minimum Version | Installation |
|------|----------------|--------------|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) |
| npm | 10.x | Included with Node.js |
| AWS CLI | 2.x | [AWS CLI Install Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| AWS CDK CLI | 2.x | `npm install -g aws-cdk` |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

### Verify Installation

```bash
# Check versions
node --version    # Should be v20.x or higher
npm --version     # Should be 10.x or higher
aws --version     # Should be aws-cli/2.x
cdk --version     # Should be 2.x
git --version     # Should be 2.x
```

### AWS Account Requirements

You'll need:
- **AWS Account(s)**: One or more AWS accounts for dev/staging/prod
- **IAM Permissions**: Administrator access or specific permissions (see below)
- **AWS Credentials**: Access key ID and secret access key

#### Required IAM Permissions

The deployment user/role needs permissions for:
- CloudFormation (full access)
- Lambda (full access)
- API Gateway (full access)
- DynamoDB (full access)
- S3 (full access)
- CloudFront (full access)
- SQS (full access)
- IAM (create/update roles and policies)
- CloudWatch (create/update logs and alarms)
- Bedrock (invoke model)
- Polly (synthesize speech)

**Recommended**: Use the AWS managed policy `AdministratorAccess` for initial setup, then create a custom policy with least privilege for production deployments.

---

## Initial Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ghostatlas-backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Verify build succeeded
npm test
```

### Step 2: Configure AWS Credentials

#### Option A: AWS CLI Configuration (Local Development)

```bash
# Configure default profile
aws configure

# Or configure named profile
aws configure --profile ghostatlas-dev
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

#### Option B: Environment Variables (CI/CD)

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### Step 3: Bootstrap CDK

Bootstrap CDK in each AWS account and region you'll deploy to:

```bash
# Bootstrap for development
cdk bootstrap aws://ACCOUNT-ID/us-east-1

# Bootstrap for staging (if different account)
cdk bootstrap aws://STAGING-ACCOUNT-ID/us-east-1 --profile ghostatlas-staging

# Bootstrap for production (if different account)
cdk bootstrap aws://PROD-ACCOUNT-ID/us-east-1 --profile ghostatlas-prod
```

**Note**: You only need to bootstrap once per account/region combination.

### Step 4: Verify Setup

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Verify CDK can synthesize
npm run synth

# Run tests
npm test
```

---

## Environment Configuration

### Environment Overview

| Environment | Purpose | Deployment Trigger | Approval Required |
|-------------|---------|-------------------|-------------------|
| **dev** | Development and testing | Push to `develop` branch | No |
| **staging** | Pre-production validation | Push to `main` branch | Yes (manual) |
| **prod** | Production | After staging deployment | Yes (manual) |

### Configuration Files

- **`lib/config.ts`**: Environment-specific settings (log retention, X-Ray, etc.)
- **`cdk.json`**: CDK configuration and context values
- **`.github/workflows/deploy.yml`**: CI/CD pipeline configuration

### Environment Variables

Each environment requires these environment variables (set automatically by CDK):

```bash
ENCOUNTERS_TABLE=ghostatlas-encounters-{env}
VERIFICATIONS_TABLE=ghostatlas-verifications-{env}
RATINGS_TABLE=ghostatlas-ratings-{env}
MEDIA_BUCKET=ghostatlas-media-{env}-{hash}
ENHANCEMENT_QUEUE_URL=https://sqs.{region}.amazonaws.com/{account}/ghostatlas-enhancement-queue-{env}
BEDROCK_REGION=us-east-1
ENVIRONMENT=dev|staging|prod
```

### GitHub Secrets (for CI/CD)

Configure these secrets in your GitHub repository (Settings > Secrets and variables > Actions):

#### Development
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCOUNT_ID_DEV`

#### Staging
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCOUNT_ID_STAGING`

#### Production
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_ACCOUNT_ID_PROD`
- `ALARM_EMAIL` (optional, for CloudWatch alarm notifications)

#### Shared
- `AWS_REGION` (default: `us-east-1`)

**Quick Setup**: Use the provided script:
```bash
./scripts/setup-github-secrets.sh
```

### GitHub Environments

Create three GitHub Environments with protection rules:

1. **development**
   - No protection rules
   - Auto-deploys on push to `develop`

2. **staging**
   - Required reviewers: Add team members
   - Auto-deploys on push to `main` after approval

3. **production**
   - Required reviewers: Add senior team members
   - Optional: Wait timer (5 minutes)
   - Auto-deploys after staging with approval

---

## Deployment Process

### Pre-Deployment Checklist

Before deploying to any environment:

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] No TypeScript errors: `npm run build`
- [ ] Review changes: `npm run diff:{env}`
- [ ] Validate configuration: `npm run validate:{env}`
- [ ] Review CloudFormation changeset
- [ ] Notify team of deployment
- [ ] Have rollback plan ready

### Development Deployment

#### Automatic (via CI/CD)

```bash
# Commit and push to develop branch
git checkout develop
git add .
git commit -m "Your changes"
git push origin develop
```

GitHub Actions will automatically:
1. Run tests
2. Build project
3. Deploy to dev environment
4. Run smoke tests

#### Manual Deployment

```bash
# Validate before deploying
npm run validate:dev

# View what will change
npm run diff:dev

# Deploy
npm run deploy:dev

# Or with specific AWS profile
AWS_PROFILE=ghostatlas-dev npm run deploy:dev
```

### Staging Deployment

#### Automatic (via CI/CD)

```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main
```

GitHub Actions will:
1. Run tests
2. Build project
3. Wait for manual approval
4. Deploy to staging environment
5. Run integration tests

#### Manual Deployment

```bash
# Validate before deploying
npm run validate:staging

# View what will change
npm run diff:staging

# Deploy
npm run deploy:staging
```

### Production Deployment

#### Automatic (via CI/CD)

After staging deployment succeeds:
1. GitHub Actions waits for manual approval
2. Reviewer approves in GitHub Actions UI
3. Deploys to production using blue/green strategy
4. Monitors for errors
5. Completes cutover or rolls back

#### Manual Deployment

```bash
# Validate before deploying
npm run validate:prod

# View what will change
npm run diff:prod

# Deploy with blue/green strategy
npm run deploy:prod
```

### Blue/Green Deployment (Production Only)

Production uses a blue/green deployment strategy:

1. **Initial Traffic Shift**: 10% of traffic to new version
2. **Monitor**: 5 minutes of monitoring
3. **Gradual Rollout**: Increase by 10% every 5 minutes
4. **Automatic Rollback**: If errors detected, revert to previous version
5. **Complete Cutover**: 100% traffic to new version after validation

### Deployment Output

After successful deployment, CDK outputs important values:

```
Outputs:
GhostAtlasBackendStack-dev.ApiEndpoint = https://abc123.execute-api.us-east-1.amazonaws.com/prod
GhostAtlasBackendStack-dev.MediaBucketName = ghostatlas-media-dev-xyz789
GhostAtlasBackendStack-dev.CloudFrontDistributionDomain = d1234567890.cloudfront.net
GhostAtlasBackendStack-dev.EnhancementQueueUrl = https://sqs.us-east-1.amazonaws.com/123456789/ghostatlas-enhancement-queue-dev
GhostAtlasBackendStack-dev.Environment = dev
```

**Save these values** - you'll need them for:
- Configuring the Flutter mobile app
- Testing API endpoints
- Monitoring and troubleshooting

---

## Post-Deployment Verification

### Step 1: Verify Stack Deployment

```bash
# Check CloudFormation stack status
aws cloudformation describe-stacks \
  --stack-name GhostAtlasBackendStack-dev \
  --query 'Stacks[0].StackStatus'

# Should return: "CREATE_COMPLETE" or "UPDATE_COMPLETE"
```

### Step 2: Test API Endpoints

```bash
# Get API endpoint from stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name GhostAtlasBackendStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Test encounter submission
curl -X POST ${API_ENDPOINT}/api/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test User",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "New York, NY"
    },
    "originalStory": "I saw a ghostly figure in the old building...",
    "encounterTime": "2024-01-15T22:30:00Z",
    "imageCount": 0
  }'

# Test geospatial query
curl "${API_ENDPOINT}/api/encounters?latitude=40.7128&longitude=-74.0060&radius=50"
```

### Step 3: Verify DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables | grep ghostatlas

# Describe Encounters table
aws dynamodb describe-table \
  --table-name ghostatlas-encounters-dev \
  --query 'Table.[TableName,TableStatus,ItemCount]'
```

### Step 4: Verify S3 Bucket

```bash
# List buckets
aws s3 ls | grep ghostatlas-media

# Check bucket configuration
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name GhostAtlasBackendStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MediaBucketName`].OutputValue' \
  --output text)

aws s3api get-bucket-versioning --bucket ${BUCKET_NAME}
aws s3api get-bucket-encryption --bucket ${BUCKET_NAME}
```

### Step 5: Verify Lambda Functions

```bash
# List Lambda functions
aws lambda list-functions \
  --query 'Functions[?contains(FunctionName, `GhostAtlasBackendStack-dev`)].FunctionName'

# Test a Lambda function
aws lambda invoke \
  --function-name GhostAtlasBackendStack-dev-SubmitEncounter \
  --payload '{"body": "{}"}' \
  response.json

cat response.json
```

### Step 6: Verify CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/GhostAtlasBackendStack-dev

# Tail logs for a function
aws logs tail /aws/lambda/GhostAtlasBackendStack-dev-SubmitEncounter --follow
```

### Step 7: Run Validation Script

```bash
# Use the provided validation script
./scripts/validate-deployment.sh dev

# Should output:
# ✓ Stack deployed successfully
# ✓ API Gateway endpoint accessible
# ✓ DynamoDB tables created
# ✓ S3 bucket configured
# ✓ Lambda functions deployed
# ✓ CloudWatch logs enabled
```

---

## Monitoring and Observability

### CloudWatch Dashboards

#### Create Custom Dashboard

```bash
# Create dashboard for your environment
aws cloudwatch put-dashboard \
  --dashboard-name GhostAtlas-dev \
  --dashboard-body file://cloudwatch-dashboard.json
```

#### Key Metrics to Monitor

**API Gateway:**
- Request count
- 4xx/5xx error rates
- Latency (p50, p95, p99)
- Integration latency

**Lambda Functions:**
- Invocation count
- Error count and rate
- Duration (p50, p95, p99)
- Throttles
- Concurrent executions

**DynamoDB:**
- Consumed read/write capacity
- Throttled requests
- System errors
- User errors

**SQS:**
- Messages sent
- Messages received
- Messages in queue
- Dead letter queue messages

**S3:**
- Bucket size
- Number of objects
- Request count
- 4xx/5xx errors

### CloudWatch Alarms

Production and staging environments have pre-configured alarms:

#### Lambda Error Rate Alarm
- **Metric**: Errors / Invocations
- **Threshold**: > 5% in 5 minutes
- **Action**: Send SNS notification

#### API Gateway 5xx Errors
- **Metric**: 5XXError count
- **Threshold**: > 10 in 5 minutes
- **Action**: Send SNS notification

#### DynamoDB Throttling
- **Metric**: UserErrors (throttling)
- **Threshold**: > 5 in 5 minutes
- **Action**: Send SNS notification

#### SQS Dead Letter Queue
- **Metric**: ApproximateNumberOfMessagesVisible
- **Threshold**: > 0
- **Action**: Send SNS notification

#### Enhancement Pipeline Failures
- **Metric**: Lambda errors for enhancement functions
- **Threshold**: > 3 in 10 minutes
- **Action**: Send SNS notification

### View Alarms

```bash
# List all alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix GhostAtlasBackendStack-prod

# Get alarm state
aws cloudwatch describe-alarms \
  --alarm-names GhostAtlasBackendStack-prod-LambdaErrorRate \
  --query 'MetricAlarms[0].StateValue'
```

### CloudWatch Logs Insights

Use Logs Insights for advanced log analysis:

```sql
-- Find all errors in the last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- Analyze Lambda cold starts
fields @timestamp, @initDuration
| filter @type = "REPORT"
| stats avg(@initDuration), max(@initDuration), count(@initDuration)

-- Track API response times
fields @timestamp, @message
| filter @message like /Duration/
| parse @message /Duration: (?<duration>\d+\.\d+) ms/
| stats avg(duration), max(duration), min(duration)

-- Find slow DynamoDB queries
fields @timestamp, @message
| filter @message like /DynamoDB/
| parse @message /latency: (?<latency>\d+)/
| filter latency > 100
| sort @timestamp desc
```

### X-Ray Tracing

X-Ray is enabled in staging and production for distributed tracing.

#### View Traces

```bash
# Get trace summaries
aws xray get-trace-summaries \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s)

# Get specific trace
aws xray batch-get-traces --trace-ids <trace-id>
```

#### Analyze Service Map

1. Go to AWS Console → X-Ray → Service Map
2. Select time range
3. View service dependencies and latencies
4. Click on nodes to see detailed metrics

### Cost Monitoring

#### Set Up Budget Alerts

```bash
# Create monthly budget
aws budgets create-budget \
  --account-id 123456789012 \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

#### Monitor Costs by Service

```bash
# Get cost by service for last month
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

#### Cost Optimization Tips

1. **Review Lambda memory allocation**: Over-provisioned memory wastes money
2. **Enable S3 Intelligent-Tiering**: Automatically moves objects to cheaper storage
3. **Use DynamoDB on-demand wisely**: Switch to provisioned if traffic is predictable
4. **Optimize CloudFront caching**: Reduce origin requests
5. **Clean up old logs**: Set appropriate retention periods
6. **Monitor Bedrock usage**: AI services can be expensive

---

## Troubleshooting

### Common Deployment Issues

#### Issue: CDK Bootstrap Failed

**Symptoms:**
```
Error: This stack uses assets, so the toolkit stack must be deployed
```

**Solution:**
```bash
# Bootstrap CDK in the target account/region
cdk bootstrap aws://ACCOUNT-ID/REGION
```

#### Issue: Insufficient IAM Permissions

**Symptoms:**
```
User: arn:aws:iam::123456789:user/deployer is not authorized to perform: cloudformation:CreateStack
```

**Solution:**
1. Verify IAM permissions
2. Ensure user has `AdministratorAccess` or required permissions
3. Check if there are any SCPs (Service Control Policies) blocking actions

```bash
# Check current user permissions
aws sts get-caller-identity
aws iam get-user
```

#### Issue: Stack Rollback

**Symptoms:**
```
Stack GhostAtlasBackendStack-dev is in ROLLBACK_COMPLETE state
```

**Solution:**
```bash
# Delete the failed stack
aws cloudformation delete-stack --stack-name GhostAtlasBackendStack-dev

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name GhostAtlasBackendStack-dev

# Redeploy
npm run deploy:dev
```

#### Issue: Resource Limit Exceeded

**Symptoms:**
```
LimitExceededException: Cannot create more Lambda functions
```

**Solution:**
1. Request limit increase via AWS Support
2. Or clean up unused resources
3. Check Service Quotas in AWS Console

```bash
# View Lambda limits
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-B99A9384
```

### Runtime Issues

#### Issue: Lambda Function Timeout

**Symptoms:**
- CloudWatch logs show "Task timed out after X seconds"
- API returns 504 Gateway Timeout

**Solution:**
1. Increase Lambda timeout in `lib/constructs/lambda-functions.ts`
2. Optimize function code
3. Check for slow external API calls
4. Review DynamoDB query performance

```bash
# View function configuration
aws lambda get-function-configuration \
  --function-name GhostAtlasBackendStack-dev-SubmitEncounter \
  --query '[Timeout,MemorySize]'
```

#### Issue: DynamoDB Throttling

**Symptoms:**
- CloudWatch shows `ProvisionedThroughputExceededException`
- API returns 500 errors

**Solution:**
1. Check if on-demand mode is enabled (should auto-scale)
2. Review access patterns for hot partitions
3. Implement exponential backoff in Lambda code
4. Consider using DynamoDB Accelerator (DAX)

```bash
# Check table capacity mode
aws dynamodb describe-table \
  --table-name ghostatlas-encounters-dev \
  --query 'Table.BillingModeSummary'
```

#### Issue: S3 Access Denied

**Symptoms:**
- Lambda logs show "Access Denied" when accessing S3
- Image uploads fail

**Solution:**
1. Verify Lambda execution role has S3 permissions
2. Check S3 bucket policy
3. Verify presigned URL hasn't expired

```bash
# Check Lambda role permissions
ROLE_NAME=$(aws lambda get-function-configuration \
  --function-name GhostAtlasBackendStack-dev-SubmitEncounter \
  --query 'Role' --output text | cut -d'/' -f2)

aws iam get-role-policy \
  --role-name ${ROLE_NAME} \
  --policy-name S3Access
```

#### Issue: Bedrock/Polly Invocation Failed

**Symptoms:**
- Enhancement pipeline fails
- CloudWatch logs show "AccessDeniedException" or "ThrottlingException"

**Solution:**
1. Verify Bedrock is enabled in your region
2. Request model access in Bedrock console
3. Check Lambda execution role has Bedrock permissions
4. Implement retry logic with exponential backoff

```bash
# Check Bedrock model access
aws bedrock list-foundation-models --region us-east-1

# Test Bedrock invocation
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --body '{"prompt":"Test","max_tokens":100}' \
  --region us-east-1 \
  output.json
```

### Debugging Techniques

#### Enable Detailed Logging

Add debug logging to Lambda functions:

```typescript
// In Lambda function
console.log('DEBUG:', JSON.stringify(event, null, 2));
console.log('DEBUG: Environment:', process.env);
```

#### Use Lambda Test Events

```bash
# Invoke Lambda with test event
aws lambda invoke \
  --function-name GhostAtlasBackendStack-dev-SubmitEncounter \
  --payload file://test-event.json \
  --log-type Tail \
  response.json

# View logs
cat response.json
```

#### Check CloudWatch Logs

```bash
# Tail logs in real-time
aws logs tail /aws/lambda/GhostAtlasBackendStack-dev-SubmitEncounter --follow

# Search logs for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/GhostAtlasBackendStack-dev-SubmitEncounter \
  --filter-pattern "ERROR"
```

#### Use X-Ray for Distributed Tracing

1. Go to AWS Console → X-Ray
2. Select time range
3. Find slow or failed requests
4. Analyze trace details to identify bottlenecks

### Performance Issues

#### Slow API Response Times

**Diagnosis:**
1. Check CloudWatch metrics for API Gateway latency
2. Review Lambda duration metrics
3. Analyze X-Ray traces for bottlenecks
4. Check DynamoDB query performance

**Solutions:**
- Optimize DynamoDB queries (use indexes)
- Increase Lambda memory (CPU scales with memory)
- Enable API Gateway caching
- Optimize Lambda cold starts
- Use Lambda SnapStart

#### High Costs

**Diagnosis:**
1. Review AWS Cost Explorer
2. Check CloudWatch metrics for usage
3. Identify expensive services

**Solutions:**
- Optimize Lambda memory allocation
- Reduce CloudWatch log retention
- Enable S3 Intelligent-Tiering
- Review Bedrock/Polly usage
- Implement caching strategies

---

## Maintenance and Operations

### Regular Maintenance Tasks

#### Weekly
- [ ] Review CloudWatch alarms
- [ ] Check error rates in CloudWatch Logs
- [ ] Monitor costs in Cost Explorer
- [ ] Review X-Ray traces for performance issues

#### Monthly
- [ ] Review and optimize Lambda memory allocation
- [ ] Clean up old CloudWatch log groups
- [ ] Review DynamoDB capacity and optimize
- [ ] Update dependencies (`npm audit`, `npm update`)
- [ ] Review and rotate AWS credentials

#### Quarterly
- [ ] Review and update IAM policies
- [ ] Conduct disaster recovery drill
- [ ] Review and optimize costs
- [ ] Update CDK and AWS SDK versions
- [ ] Review security best practices

### Backup and Disaster Recovery

#### DynamoDB Backups

Point-in-time recovery is enabled automatically. To restore:

```bash
# Restore table to specific point in time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name ghostatlas-encounters-prod \
  --target-table-name ghostatlas-encounters-prod-restored \
  --restore-date-time 2024-01-15T10:00:00Z
```

#### S3 Versioning

S3 versioning is enabled. To restore a deleted object:

```bash
# List object versions
aws s3api list-object-versions \
  --bucket ghostatlas-media-prod \
  --prefix encounters/

# Restore specific version
aws s3api copy-object \
  --bucket ghostatlas-media-prod \
  --copy-source ghostatlas-media-prod/encounters/file.jpg?versionId=VERSION_ID \
  --key encounters/file.jpg
```

#### Infrastructure Backup

Infrastructure is defined in code (CDK). To backup:

```bash
# Commit and push to version control
git add .
git commit -m "Backup infrastructure state"
git push origin main

# Export CloudFormation template
cdk synth > cloudformation-backup.yaml
```

### Rollback Procedures

#### Rollback via CloudFormation

```bash
# Rollback to previous stack version
aws cloudformation rollback-stack \
  --stack-name GhostAtlasBackendStack-prod
```

#### Rollback via Git

```bash
# Find last good commit
git log --oneline

# Checkout previous version
git checkout <commit-hash>

# Redeploy
npm run deploy:prod
```

### Security Updates

#### Update Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Test after updates
npm test
npm run build
```

#### Rotate AWS Credentials

```bash
# Create new access key
aws iam create-access-key --user-name deployer

# Update GitHub secrets with new credentials

# Delete old access key
aws iam delete-access-key \
  --user-name deployer \
  --access-key-id OLD_ACCESS_KEY_ID
```

### Scaling Considerations

#### Increase Lambda Concurrency

```typescript
// In lib/constructs/lambda-functions.ts
submitEncounterFn.addReservedConcurrentExecutions(100);
```

#### Optimize DynamoDB

```bash
# Switch to provisioned capacity if traffic is predictable
aws dynamodb update-table \
  --table-name ghostatlas-encounters-prod \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=100,WriteCapacityUnits=50
```

#### Add CloudFront Caching

```typescript
// In lib/constructs/cloudfront-distribution.ts
distribution.addBehavior('/api/encounters', origin, {
  cachePolicy: CachePolicy.CACHING_OPTIMIZED,
  allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
});
```

---

## Additional Resources

### Documentation
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)

### Internal Documentation
- [DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md) - Quick setup guide
- [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) - Configuration details
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API endpoint documentation
- [openapi.yaml](./openapi.yaml) - OpenAPI specification

### Scripts
- `scripts/setup-github-secrets.sh` - Configure GitHub secrets
- `scripts/validate-deployment.sh` - Validate deployment

### Support Contacts
- **DevOps Team**: devops@ghostatlas.com
- **AWS Support**: [AWS Support Center](https://console.aws.amazon.com/support/)
- **On-Call**: See PagerDuty rotation

---

## Appendix

### Useful Commands Reference

```bash
# Deployment
npm run deploy:dev              # Deploy to development
npm run deploy:staging          # Deploy to staging
npm run deploy:prod             # Deploy to production

# Validation
npm run validate:dev            # Validate dev environment
npm run diff:dev                # Show changes for dev

# Testing
npm test                        # Run all tests
npm run test:watch              # Run tests in watch mode
npm run test:coverage           # Run tests with coverage

# Building
npm run build                   # Build TypeScript
npm run synth                   # Synthesize CloudFormation

# Cleanup
npm run destroy                 # Destroy stack (use with caution!)

# AWS CLI
aws cloudformation describe-stacks --stack-name <stack-name>
aws lambda list-functions
aws dynamodb list-tables
aws s3 ls
aws logs tail <log-group> --follow
```

### Environment Variables Reference

```bash
# CDK
CDK_DEFAULT_ACCOUNT=123456789012
CDK_DEFAULT_REGION=us-east-1

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_PROFILE=ghostatlas-dev

# Application
ENVIRONMENT=dev|staging|prod
```

### Troubleshooting Checklist

When things go wrong, check:

- [ ] AWS credentials are valid and not expired
- [ ] IAM permissions are sufficient
- [ ] CDK is bootstrapped in target account/region
- [ ] All tests pass locally
- [ ] CloudFormation stack status
- [ ] CloudWatch logs for errors
- [ ] X-Ray traces for performance issues
- [ ] DynamoDB table status
- [ ] S3 bucket exists and is accessible
- [ ] Lambda function configuration (timeout, memory)
- [ ] API Gateway configuration
- [ ] Environment variables are set correctly
- [ ] Dependencies are up to date
- [ ] No resource limits exceeded

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintained By**: GhostAtlas DevOps Team
