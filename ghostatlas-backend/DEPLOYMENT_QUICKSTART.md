# Deployment Pipeline Quick Start

Get your GhostAtlas Backend deployment pipeline up and running in minutes.

## Prerequisites

- GitHub repository with admin access
- AWS accounts for dev, staging, and prod (or one account with separate regions)
- GitHub CLI installed: `brew install gh` (macOS) or see [cli.github.com](https://cli.github.com)
- Node.js 20.x or higher
- AWS CDK CLI: `npm install -g aws-cdk`

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
cd ghostatlas-backend
npm install
npm run build
```

### Step 2: Set Up GitHub Secrets

```bash
# Authenticate with GitHub
gh auth login

# Run the interactive setup script
./scripts/setup-github-secrets.sh
```

The script will prompt you for:
- AWS Access Key ID for each environment
- AWS Secret Access Key for each environment
- AWS Account ID for each environment
- Optional: AWS Region and Alarm Email

### Step 3: Configure GitHub Environments

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Environments**
3. Create three environments:

**development:**
- Click "New environment"
- Name: `development`
- No protection rules needed
- Save

**staging:**
- Click "New environment"
- Name: `staging`
- Enable "Required reviewers"
- Add team members who can approve
- Save

**production:**
- Click "New environment"
- Name: `production`
- Enable "Required reviewers"
- Add senior team members who can approve
- Optional: Set "Wait timer" to 5 minutes
- Save

### Step 4: Test the Pipeline

```bash
# Create a test branch
git checkout -b test-deployment

# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "Test deployment pipeline"

# Push to trigger the workflow
git push origin test-deployment

# Create a pull request to develop
gh pr create --base develop --title "Test deployment pipeline"
```

Watch the GitHub Actions workflow run in the Actions tab.

### Step 5: Deploy to Development

```bash
# Merge to develop branch
git checkout develop
git merge test-deployment
git push origin develop
```

This will automatically:
1. Run all tests
2. Build the project
3. Deploy to development environment

Monitor the deployment in GitHub Actions.

## Deployment Workflow

### Automatic Deployments

```
develop branch → Auto-deploy to Development
     ↓
main branch → Auto-deploy to Staging (requires approval)
     ↓
After staging → Auto-deploy to Production (requires approval)
```

### Manual Deployment

```bash
# Validate before deploying
npm run validate:prod

# View what will change
npm run diff:prod

# Deploy
npm run deploy:prod
```

## Verifying Your Setup

### Check GitHub Secrets

```bash
gh secret list
```

You should see:
- AWS_ACCESS_KEY_ID_DEV
- AWS_SECRET_ACCESS_KEY_DEV
- AWS_ACCOUNT_ID_DEV
- AWS_ACCESS_KEY_ID_STAGING
- AWS_SECRET_ACCESS_KEY_STAGING
- AWS_ACCOUNT_ID_STAGING
- AWS_ACCESS_KEY_ID_PROD
- AWS_SECRET_ACCESS_KEY_PROD
- AWS_ACCOUNT_ID_PROD

### Check GitHub Environments

```bash
gh api repos/:owner/:repo/environments | jq '.environments[].name'
```

You should see:
- development
- staging
- production

### Test Local Deployment

```bash
# Set AWS credentials
export AWS_ACCESS_KEY_ID=your_dev_key
export AWS_SECRET_ACCESS_KEY=your_dev_secret
export AWS_REGION=us-east-1

# Validate
npm run validate:dev

# Deploy
npm run deploy:dev
```

## Common Issues

### "gh: command not found"

Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### "Not authenticated with GitHub CLI"

```bash
gh auth login
```

Follow the prompts to authenticate.

### "AWS credentials not configured"

Set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

Or configure AWS CLI:
```bash
aws configure
```

### "Tests failing"

```bash
# Run tests locally
npm test

# Fix any failing tests
# Then commit and push
```

### "CDK deployment failing"

Check CloudFormation in AWS Console:
1. Go to CloudFormation service
2. Find your stack (GhostAtlasBackendStack-dev)
3. Check Events tab for error details

## Next Steps

1. **Review Configuration**: Check `lib/config.ts` for environment settings
2. **Customize Alarms**: Update CloudWatch alarm thresholds if needed
3. **Set Up Monitoring**: Configure CloudWatch dashboards
4. **Document APIs**: Update API_ENDPOINTS.md with your endpoints
5. **Test Thoroughly**: Test all API endpoints in each environment

## Useful Commands

```bash
# Validate deployment
npm run validate:dev
npm run validate:staging
npm run validate:prod

# View what will change
npm run diff:dev
npm run diff:staging
npm run diff:prod

# Deploy manually
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# Run tests
npm test
npm run test:coverage

# Build
npm run build

# View GitHub Actions logs
gh run list
gh run view [run-id]

# View GitHub secrets
gh secret list

# Trigger manual workflow
gh workflow run deploy.yml -f environment=dev
```

## Getting Help

- **Documentation**: See [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) for detailed configuration
- **Checklist**: Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) before each deployment
- **Scripts**: See [scripts/README.md](./scripts/README.md) for script documentation
- **GitHub Actions**: Check the Actions tab in your repository
- **AWS Console**: Check CloudFormation, Lambda, and CloudWatch for deployment status

## Architecture Overview

```
GitHub Repository
    ↓
GitHub Actions (CI/CD)
    ↓
AWS CDK (Infrastructure as Code)
    ↓
AWS Services:
    - API Gateway (REST API)
    - Lambda (Serverless functions)
    - DynamoDB (Database)
    - S3 + CloudFront (Media storage & CDN)
    - SQS (Message queue)
    - Bedrock + Polly (AI services)
    - CloudWatch (Monitoring)
```

## Security Best Practices

✅ Use separate AWS accounts for each environment
✅ Rotate AWS credentials every 90 days
✅ Enable MFA on AWS accounts
✅ Use least privilege IAM policies
✅ Never commit secrets to version control
✅ Enable CloudTrail for audit logging
✅ Review access logs regularly

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review CloudWatch logs in AWS Console
3. Check CloudFormation events
4. Consult the documentation in this directory
5. Contact your DevOps team

---

**Ready to deploy?** Start with Step 1 above! 🚀
