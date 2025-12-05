# Deployment Scripts

This directory contains helper scripts for deployment and configuration management.

## Available Scripts

### validate-deployment.sh

Validates that all prerequisites and configuration are in place before deployment.

**Usage:**
```bash
./scripts/validate-deployment.sh [environment]
```

**Examples:**
```bash
# Validate development environment
./scripts/validate-deployment.sh dev

# Validate staging environment
./scripts/validate-deployment.sh staging

# Validate production environment
./scripts/validate-deployment.sh prod
```

**What it checks:**
- Node.js version (20.x or higher)
- npm installation
- AWS CLI installation
- CDK CLI installation
- Project dependencies
- TypeScript compilation
- AWS credentials configuration
- Test status
- Environment-specific warnings

### setup-github-secrets.sh

Interactive script to set up GitHub secrets for CI/CD deployment.

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Repository access with admin permissions

**Usage:**
```bash
./scripts/setup-github-secrets.sh
```

**What it sets up:**
- Development environment secrets
- Staging environment secrets
- Production environment secrets
- Shared configuration (AWS region, alarm email)

**Secrets configured:**
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCOUNT_ID_DEV`
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCOUNT_ID_STAGING`
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_ACCOUNT_ID_PROD`
- `AWS_REGION` (optional)
- `ALARM_EMAIL` (optional)

## Workflow

### Initial Setup

1. Install GitHub CLI and authenticate:
   ```bash
   brew install gh  # macOS
   gh auth login
   ```

2. Run the secrets setup script:
   ```bash
   ./scripts/setup-github-secrets.sh
   ```

3. Configure GitHub Environments in repository settings:
   - Go to Settings > Environments
   - Create: `development`, `staging`, `production`
   - For staging and production:
     - Enable "Required reviewers"
     - Add team members who can approve
     - Optionally set wait timer

### Before Each Deployment

1. Validate your environment:
   ```bash
   ./scripts/validate-deployment.sh [environment]
   ```

2. Review what will change:
   ```bash
   npm run diff
   # or for specific environment
   cdk diff --context environment=staging
   ```

3. Deploy:
   ```bash
   npm run deploy:dev
   # or
   npm run deploy:staging
   # or
   npm run deploy:prod
   ```

## Troubleshooting

### "Command not found: gh"

Install GitHub CLI:
- macOS: `brew install gh`
- Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
- Windows: See https://github.com/cli/cli/releases

### "Not authenticated with GitHub CLI"

Run:
```bash
gh auth login
```

### "Permission denied"

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

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

## Security Notes

- Never commit AWS credentials to version control
- Use separate AWS accounts for dev, staging, and prod
- Rotate credentials regularly
- Use IAM roles with least privilege
- Enable MFA for production deployments
- Review CloudTrail logs regularly

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Deployment Configuration Guide](../DEPLOYMENT_CONFIG.md)
