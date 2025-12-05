# GhostAtlas Backend Deployment Guide

This guide covers deploying the GhostAtlas AWS Backend infrastructure across different environments.

## Prerequisites

### Required Tools

1. **Node.js 20.x or later**
   ```bash
   node --version  # Should be v20.x or higher
   ```

2. **AWS CLI**
   ```bash
   aws --version
   ```

3. **AWS CDK CLI**
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```

### AWS Account Setup

1. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)

2. **Bootstrap CDK** (first time only per account/region)
   ```bash
   cd ghostatlas-backend
   cdk bootstrap aws://ACCOUNT-ID/REGION
   ```

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd ghostatlas-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build TypeScript**
   ```bash
   npm run build
   ```

## Environment Configuration

The backend supports three environments:

- **dev**: Development environment with minimal logging
- **staging**: Pre-production environment with full monitoring
- **prod**: Production environment with full monitoring and alarms

Configuration is managed in `lib/config.ts`. Each environment has:
- Different log retention periods
- X-Ray tracing settings
- Resource naming conventions

## Deployment

### Deploy to Development

```bash
npm run deploy:dev
```

This will:
1. Synthesize CloudFormation templates
2. Deploy the stack to AWS
3. Output API Gateway endpoint URLs

### Deploy to Staging

```bash
npm run deploy:staging
```

### Deploy to Production

```bash
npm run deploy:prod
```

### View Changes Before Deployment

```bash
cdk diff --context environment=dev
cdk diff --context environment=staging
cdk diff --context environment=prod
```

## Post-Deployment

### Get Stack Outputs

After deployment, CDK will output important values:

```
Outputs:
GhostAtlasBackendStack-dev.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
GhostAtlasBackendStack-dev.MediaBucketName = ghostatlas-media-dev-xxxxx
GhostAtlasBackendStack-dev.Environment = dev
```

### Test the API

```bash
# Health check (once implemented)
curl https://your-api-endpoint/api/health

# Submit an encounter (once implemented)
curl -X POST https://your-api-endpoint/api/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "Test User",
    "location": {"latitude": 40.7128, "longitude": -74.0060},
    "originalStory": "I saw something spooky...",
    "encounterTime": "2024-01-15T10:30:00Z",
    "imageCount": 0
  }'
```

## Monitoring

### CloudWatch Logs

View Lambda function logs:
```bash
aws logs tail /aws/lambda/GhostAtlasBackendStack-dev-SubmitEncounter --follow
```

### CloudWatch Alarms

Production and staging environments have alarms for:
- Lambda error rates
- API Gateway 5xx errors
- DynamoDB throttling
- SQS Dead Letter Queue messages

### X-Ray Tracing

X-Ray is enabled in staging and production. View traces in the AWS Console:
- AWS Console → X-Ray → Traces

## Troubleshooting

### Deployment Fails

1. **Check AWS credentials**
   ```bash
   aws sts get-caller-identity
   ```

2. **Verify CDK bootstrap**
   ```bash
   cdk bootstrap
   ```

3. **Check for resource limits**
   - Lambda concurrent executions
   - API Gateway throttling limits
   - DynamoDB capacity

### Lambda Function Errors

1. **View logs**
   ```bash
   aws logs tail /aws/lambda/FUNCTION-NAME --follow
   ```

2. **Check environment variables**
   - Verify table names
   - Verify bucket names
   - Verify queue URLs

3. **Test locally** (once implemented)
   ```bash
   npm test
   ```

### DynamoDB Issues

1. **Check table status**
   ```bash
   aws dynamodb describe-table --table-name ghostatlas-encounters-dev
   ```

2. **Monitor capacity**
   - On-demand billing should auto-scale
   - Check for throttling in CloudWatch

### S3/CloudFront Issues

1. **Verify bucket exists**
   ```bash
   aws s3 ls | grep ghostatlas-media
   ```

2. **Check CORS configuration**
   ```bash
   aws s3api get-bucket-cors --bucket ghostatlas-media-dev-xxxxx
   ```

## Rollback

If a deployment causes issues:

1. **Rollback via CloudFormation**
   ```bash
   aws cloudformation rollback-stack --stack-name GhostAtlasBackendStack-dev
   ```

2. **Or redeploy previous version**
   ```bash
   git checkout <previous-commit>
   npm run deploy:dev
   ```

## Cleanup

To remove all resources:

```bash
npm run destroy
```

**Warning**: This will delete all data in DynamoDB tables and S3 buckets. Use with caution!

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **On Pull Request**: Runs tests and builds
2. **On Push to develop**: Deploys to dev environment
3. **On Push to main**: Deploys to staging, then requires manual approval for production

### Required GitHub Secrets

Configure these in your GitHub repository settings:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Cost Estimation

Approximate monthly costs (varies by usage):

### Development
- API Gateway: ~$3.50 per million requests
- Lambda: ~$0.20 per million requests (512MB, 100ms avg)
- DynamoDB: On-demand, ~$1.25 per million writes
- S3: ~$0.023 per GB
- CloudFront: ~$0.085 per GB
- Bedrock: Pay per use (varies by model)
- Polly: ~$4 per million characters

**Estimated dev cost**: $10-50/month (low traffic)

### Production
**Estimated prod cost**: $100-500/month (moderate traffic)

Use AWS Cost Explorer to monitor actual costs.

## Support

For issues or questions:
1. Check CloudWatch Logs
2. Review X-Ray traces
3. Consult AWS documentation
4. Check GitHub issues

## Next Steps

After successful deployment:
1. Configure Flutter app with API endpoint
2. Set up monitoring dashboards
3. Configure CloudWatch alarms
4. Test all API endpoints
5. Load test with expected traffic patterns
