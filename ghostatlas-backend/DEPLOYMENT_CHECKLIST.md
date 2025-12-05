# Deployment Checklist

Use this checklist to ensure your deployment pipeline is properly configured.

## Initial Setup (One-time)

### 1. GitHub Repository Setup

- [ ] Repository created and code pushed
- [ ] GitHub Actions enabled in repository settings
- [ ] GitHub CLI installed and authenticated (`gh auth login`)

### 2. GitHub Secrets Configuration

Run the setup script:
```bash
./scripts/setup-github-secrets.sh
```

Or manually set these secrets in GitHub Settings > Secrets and variables > Actions:

**Development:**
- [ ] `AWS_ACCESS_KEY_ID_DEV`
- [ ] `AWS_SECRET_ACCESS_KEY_DEV`
- [ ] `AWS_ACCOUNT_ID_DEV`

**Staging:**
- [ ] `AWS_ACCESS_KEY_ID_STAGING`
- [ ] `AWS_SECRET_ACCESS_KEY_STAGING`
- [ ] `AWS_ACCOUNT_ID_STAGING`

**Production:**
- [ ] `AWS_ACCESS_KEY_ID_PROD`
- [ ] `AWS_SECRET_ACCESS_KEY_PROD`
- [ ] `AWS_ACCOUNT_ID_PROD`

**Optional:**
- [ ] `AWS_REGION` (defaults to us-east-1)
- [ ] `ALARM_EMAIL` (for production CloudWatch alarms)

### 3. GitHub Environments Configuration

Go to Settings > Environments and create:

**Development Environment:**
- [ ] Name: `development`
- [ ] URL: `https://dev-api.ghostatlas.com` (optional)
- [ ] Protection rules: None (auto-deploy)

**Staging Environment:**
- [ ] Name: `staging`
- [ ] URL: `https://staging-api.ghostatlas.com` (optional)
- [ ] Protection rules:
  - [ ] Required reviewers (add team members)
  - [ ] Wait timer: 0 minutes (or as desired)

**Production Environment:**
- [ ] Name: `production`
- [ ] URL: `https://api.ghostatlas.com` (optional)
- [ ] Protection rules:
  - [ ] Required reviewers (add senior team members)
  - [ ] Wait timer: 5 minutes (recommended)

### 4. AWS Account Setup

**Recommended: Separate AWS Accounts**
- [ ] Development AWS account created
- [ ] Staging AWS account created
- [ ] Production AWS account created

**IAM User/Role Permissions:**
- [ ] CloudFormation: Full access
- [ ] Lambda: Full access
- [ ] API Gateway: Full access
- [ ] DynamoDB: Full access
- [ ] S3: Full access
- [ ] CloudFront: Full access
- [ ] SQS: Full access
- [ ] IAM: Create/update roles and policies
- [ ] CloudWatch: Create/update logs and alarms
- [ ] Bedrock: Invoke model access
- [ ] Polly: Synthesize speech access

### 5. Local Development Setup

- [ ] Node.js 20.x or higher installed
- [ ] npm installed
- [ ] AWS CLI installed (optional)
- [ ] AWS CDK CLI installed: `npm install -g aws-cdk`
- [ ] Project dependencies installed: `npm install`
- [ ] TypeScript compiled: `npm run build`
- [ ] Tests passing: `npm test`

## Before Each Deployment

### Pre-Deployment Validation

- [ ] All tests passing locally: `npm test`
- [ ] TypeScript compiles: `npm run build`
- [ ] Validation script passes: `npm run validate:[env]`
- [ ] Review changes: `npm run diff:[env]`
- [ ] Code reviewed and approved (for staging/prod)

### Development Deployment

- [ ] Push to `develop` branch
- [ ] GitHub Actions workflow starts automatically
- [ ] Tests pass in CI
- [ ] Deployment to dev succeeds
- [ ] Verify deployment in AWS Console
- [ ] Test API endpoints

### Staging Deployment

- [ ] Merge to `main` branch
- [ ] GitHub Actions workflow starts automatically
- [ ] Tests pass in CI
- [ ] Approve deployment in GitHub (if required)
- [ ] Deployment to staging succeeds
- [ ] Smoke tests pass
- [ ] Manual testing in staging environment
- [ ] Verify all features work as expected

### Production Deployment

- [ ] Staging deployment successful and tested
- [ ] All stakeholders notified
- [ ] Approve deployment in GitHub
- [ ] Monitor blue/green deployment progress
- [ ] Verify traffic shifting (10% increments)
- [ ] Smoke tests pass
- [ ] Monitor CloudWatch metrics
- [ ] Monitor CloudWatch alarms
- [ ] Verify API endpoints responding
- [ ] Test critical user flows
- [ ] Monitor error rates for 30 minutes

## Post-Deployment

### Verification

- [ ] API Gateway endpoints responding
- [ ] Lambda functions executing successfully
- [ ] DynamoDB tables accessible
- [ ] S3 bucket accessible via CloudFront
- [ ] SQS queue processing messages
- [ ] CloudWatch logs being written
- [ ] X-Ray traces appearing (staging/prod)
- [ ] No CloudWatch alarms triggered

### Monitoring (First 24 Hours)

- [ ] Monitor Lambda error rates
- [ ] Monitor API Gateway 5xx errors
- [ ] Monitor DynamoDB throttling
- [ ] Monitor SQS Dead Letter Queue
- [ ] Monitor enhancement pipeline success rate
- [ ] Check CloudWatch Logs for errors
- [ ] Verify cost is within expected range

### Documentation

- [ ] Update API documentation if endpoints changed
- [ ] Update CHANGELOG.md with changes
- [ ] Document any configuration changes
- [ ] Update runbooks if procedures changed

## Rollback Procedure

If issues are detected after deployment:

### Immediate Actions

- [ ] Stop traffic to new version (if blue/green)
- [ ] Identify the issue from logs/metrics
- [ ] Determine if rollback is necessary

### Rollback Steps

```bash
# Option 1: Rollback via CDK
cd ghostatlas-backend
cdk deploy --context environment=prod --rollback

# Option 2: Redeploy previous version
git checkout <previous-commit>
npm run deploy:prod
```

### Post-Rollback

- [ ] Verify rollback successful
- [ ] Monitor metrics return to normal
- [ ] Notify stakeholders
- [ ] Create incident report
- [ ] Fix issue in development
- [ ] Test fix in staging
- [ ] Schedule new production deployment

## Troubleshooting

### GitHub Actions Failing

- [ ] Check workflow logs in GitHub Actions tab
- [ ] Verify secrets are set correctly
- [ ] Verify AWS credentials have necessary permissions
- [ ] Check if AWS service limits reached

### CDK Deployment Failing

- [ ] Check CloudFormation events in AWS Console
- [ ] Review CDK diff output
- [ ] Verify IAM permissions
- [ ] Check for resource naming conflicts
- [ ] Verify AWS service quotas

### Lambda Functions Failing

- [ ] Check CloudWatch Logs
- [ ] Verify environment variables set correctly
- [ ] Check IAM role permissions
- [ ] Verify DynamoDB table names
- [ ] Check S3 bucket access

### API Gateway Issues

- [ ] Verify API Gateway deployment
- [ ] Check API Gateway logs
- [ ] Verify Lambda integrations
- [ ] Check CORS configuration
- [ ] Verify rate limiting settings

## Security Checklist

- [ ] AWS credentials rotated regularly (every 90 days)
- [ ] MFA enabled on AWS accounts
- [ ] CloudTrail enabled for audit logging
- [ ] S3 buckets not publicly accessible
- [ ] DynamoDB encryption at rest enabled
- [ ] Lambda functions use least privilege IAM roles
- [ ] API Gateway uses HTTPS only
- [ ] Secrets never committed to version control
- [ ] Production access restricted to authorized personnel

## Cost Optimization

- [ ] Review AWS Cost Explorer monthly
- [ ] Verify S3 lifecycle policies working
- [ ] Check Lambda reserved concurrency usage
- [ ] Monitor DynamoDB on-demand usage
- [ ] Review CloudWatch Logs retention
- [ ] Check for unused resources
- [ ] Verify CloudFront cache hit ratio

## Compliance

- [ ] All resources properly tagged
- [ ] Environment tags correct (dev/staging/prod)
- [ ] Cost center tags applied
- [ ] Backup policies in place
- [ ] Disaster recovery plan documented
- [ ] Incident response plan documented

## Support Contacts

- **DevOps Team**: [email/slack channel]
- **AWS Support**: [support plan details]
- **On-Call Engineer**: [contact info]
- **Escalation Path**: [escalation procedure]

---

## Quick Reference

### Useful Commands

```bash
# Validate deployment
npm run validate:prod

# View what will change
npm run diff:prod

# Deploy manually
npm run deploy:prod

# View logs
aws logs tail /aws/lambda/[function-name] --follow

# Check stack status
aws cloudformation describe-stacks --stack-name GhostAtlasBackendStack-prod

# List GitHub secrets
gh secret list

# Trigger manual deployment
gh workflow run deploy.yml -f environment=prod
```

### Important URLs

- GitHub Actions: `https://github.com/[org]/[repo]/actions`
- AWS Console: `https://console.aws.amazon.com/`
- CloudWatch Logs: `https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups`
- API Gateway: `https://console.aws.amazon.com/apigateway/`
- CloudFormation: `https://console.aws.amazon.com/cloudformation/`

---

**Last Updated**: [Date]
**Maintained By**: [Team Name]
