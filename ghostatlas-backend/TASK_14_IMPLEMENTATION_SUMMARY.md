# Task 14 Implementation Summary: IAM Roles and Security

## Overview

Implemented comprehensive IAM roles and security policies for the GhostAtlas backend following the principle of least privilege. This ensures that Lambda functions have only the permissions they need to perform their specific tasks.

## Completed Subtasks

### 14.1 Create IAM roles for Lambda functions ✅

Created two distinct IAM roles with scoped permissions:

#### API Handler Role (`ghostatlas-api-handler-{env}`)

**Used by:**
- SubmitEncounter
- GetEncounters
- GetEncounterById
- RateEncounter
- VerifyLocation
- AdminListPending
- AdminApprove
- AdminReject

**Permissions:**
- **DynamoDB**: Read/write access to Encounters, Verifications, and Ratings tables (including GSI access)
- **S3**: Object operations (Put, Get, Delete) on media bucket for presigned URL generation
- **S3**: Bucket-level operations (ListBucket, GetBucketLocation) for presigned URLs
- **SQS**: Send messages to enhancement queue (for AdminApprove function)
- **X-Ray**: Tracing permissions (when enabled in config)
- **CloudWatch Logs**: Basic Lambda execution logging

**Security Features:**
- Scoped to specific table ARNs and indexes
- Scoped to specific S3 bucket ARN
- Scoped to specific SQS queue ARN
- No wildcard permissions except for X-Ray (AWS limitation)

#### Enhancement Pipeline Role (`ghostatlas-enhancement-pipeline-{env}`)

**Used by:**
- EnhancementOrchestrator
- GenerateNarrative
- GenerateIllustration
- GenerateNarration

**Permissions:**
- **DynamoDB**: Read/write access to Encounters table only (for updating enhancement status)
- **S3**: Write access to media bucket for AI-generated assets (illustrations, narration)
- **SQS**: Receive and delete messages from enhancement queue
- **Bedrock**: Invoke Claude 3 Sonnet model for narrative generation
- **Bedrock**: Invoke Stable Diffusion XL model for illustration generation
- **Polly**: Synthesize speech for voice narration
- **X-Ray**: Tracing permissions (when enabled in config)
- **CloudWatch Logs**: Basic Lambda execution logging

**Security Features:**
- Scoped to specific Bedrock foundation models (Claude, Stable Diffusion)
- Scoped to specific DynamoDB table (Encounters only)
- Scoped to specific S3 bucket ARN
- Scoped to specific SQS queue ARN
- Polly permissions are service-wide (AWS limitation - no resource-level permissions)

### 14.2 Configure S3 bucket policies ✅

Enhanced S3 bucket security with multiple layers:

#### Encryption Configuration
- **Encryption at rest**: AES-256 (S3-managed encryption)
- **Enforce SSL**: All requests must use HTTPS
- **Bucket policy**: Explicit deny for non-HTTPS requests

#### Access Control
- **Public access**: Completely blocked (BlockPublicAccess.BLOCK_ALL)
- **CloudFront access**: Configured via Origin Access Control (OAC)
- **Bucket policy**: Automatically added by S3BucketOrigin.withOriginAccessControl()
- **Additional policy**: Denies all S3 operations over non-secure transport

#### Security Policy Details

```typescript
// Deny non-HTTPS requests
{
  Sid: 'DenyInsecureTransport',
  Effect: 'DENY',
  Principal: '*',
  Action: 's3:*',
  Resource: [
    'arn:aws:s3:::ghostatlas-media-{env}-{account}',
    'arn:aws:s3:::ghostatlas-media-{env}-{account}/*'
  ],
  Condition: {
    Bool: {
      'aws:SecureTransport': 'false'
    }
  }
}
```

## Implementation Details

### File Changes

1. **Created**: `lib/constructs/iam-roles.ts`
   - New construct for centralized IAM role management
   - Two roles with least privilege permissions
   - Comprehensive inline policies with specific resource ARNs
   - Tagged for cost tracking and organization

2. **Modified**: `lib/constructs/lambda-functions.ts`
   - Added optional `apiHandlerRole` and `enhancementPipelineRole` props
   - Updated all Lambda function definitions to use the shared roles
   - Removed individual `grantXxx` calls (permissions now in IAM roles)

3. **Modified**: `lib/constructs/s3-buckets.ts`
   - Added `enforceSSL: true` to bucket configuration
   - Added import for IAM module
   - Enhanced encryption configuration

4. **Modified**: `lib/constructs/cloudfront-distribution.ts`
   - Added bucket policy to deny non-HTTPS requests
   - Added import for IAM module
   - Policy applied after CloudFront distribution creation

5. **Modified**: `lib/ghostatlas-backend-stack.ts`
   - Added IAMRoles construct instantiation
   - Passes IAM roles to Lambda functions construct
   - Proper dependency ordering (IAM roles before Lambda functions)

### Architecture Benefits

#### Security
- **Least privilege**: Each role has only the permissions needed for its functions
- **Resource scoping**: All permissions scoped to specific resources (no wildcards except where AWS requires)
- **Defense in depth**: Multiple layers of security (IAM, bucket policies, encryption)
- **Audit trail**: All actions logged to CloudWatch with proper IAM context

#### Maintainability
- **Centralized management**: All IAM policies in one construct
- **Reusable roles**: Multiple Lambda functions share the same role
- **Clear separation**: API handlers vs. enhancement pipeline roles
- **Easy updates**: Change permissions in one place, affects all functions

#### Cost Optimization
- **Reduced IAM entities**: 2 roles instead of 8+ individual roles
- **Simplified billing**: Tagged resources for cost allocation
- **Efficient permissions**: No over-provisioning of access

## Requirements Validation

### Requirement 15.1: Infrastructure as Code
✅ All IAM roles and policies defined in CDK TypeScript
✅ Principle of least privilege applied throughout
✅ Resource-level permissions where supported by AWS

### Requirement 14.1: S3 Encryption
✅ AES-256 encryption at rest enabled
✅ SSL/TLS enforcement for all requests
✅ Bucket policy denies non-HTTPS access

### Requirement 14.2: CloudFront Access Control
✅ S3 bucket restricted to CloudFront OAC only
✅ Public access completely blocked
✅ Automatic bucket policy via S3BucketOrigin.withOriginAccessControl()

## Testing Recommendations

### Unit Tests
- Verify IAM role policies contain expected permissions
- Verify S3 bucket has encryption enabled
- Verify S3 bucket policy denies non-HTTPS requests
- Verify CloudFront uses Origin Access Control

### Integration Tests
- Test Lambda functions can access DynamoDB with assigned role
- Test Lambda functions can access S3 with assigned role
- Test enhancement pipeline can invoke Bedrock and Polly
- Test direct S3 access is denied (only CloudFront works)
- Test non-HTTPS S3 requests are denied

### Security Tests
- Attempt to access S3 bucket directly (should fail)
- Attempt to invoke Bedrock without proper role (should fail)
- Verify X-Ray tracing works when enabled
- Verify CloudWatch logs are created with proper IAM context

## Deployment Notes

### Prerequisites
- AWS account with permissions to create IAM roles
- CDK bootstrap completed in target account/region
- Bedrock models enabled in target region (Claude, Stable Diffusion)

### Deployment Steps
1. Review IAM policies in `lib/constructs/iam-roles.ts`
2. Run `npm run build` to compile TypeScript
3. Run `cdk synth` to generate CloudFormation template
4. Review generated IAM policies in cdk.out/
5. Run `cdk deploy` to create resources

### Post-Deployment Validation
1. Check IAM roles created in AWS Console
2. Verify Lambda functions use the correct roles
3. Test S3 bucket access via CloudFront URL
4. Verify direct S3 access is blocked
5. Check CloudWatch logs for proper IAM context

## Security Best Practices Implemented

1. **Least Privilege**: Each role has minimal permissions needed
2. **Resource Scoping**: Permissions limited to specific ARNs
3. **Encryption**: Data encrypted at rest and in transit
4. **Access Control**: S3 accessible only via CloudFront
5. **Audit Logging**: All actions logged to CloudWatch
6. **Tagging**: Resources tagged for governance and cost tracking
7. **Separation of Duties**: API handlers and enhancement pipeline have separate roles
8. **Defense in Depth**: Multiple security layers (IAM, bucket policies, encryption)

## Future Enhancements

1. **Secrets Management**: Use AWS Secrets Manager for API keys (if needed)
2. **KMS Encryption**: Upgrade to customer-managed KMS keys for enhanced control
3. **VPC Integration**: Deploy Lambda functions in VPC for network isolation
4. **WAF Integration**: Add AWS WAF rules to API Gateway
5. **GuardDuty**: Enable GuardDuty for threat detection
6. **CloudTrail**: Enable CloudTrail for comprehensive audit logging
7. **IAM Access Analyzer**: Use Access Analyzer to validate least privilege
8. **Service Control Policies**: Add SCPs for organization-wide governance

## Conclusion

Task 14 successfully implements comprehensive IAM roles and S3 security policies following AWS best practices. The implementation ensures:

- ✅ Least privilege access for all Lambda functions
- ✅ Secure S3 bucket configuration with encryption and access control
- ✅ CloudFront-only access to media assets
- ✅ Proper separation of concerns between API handlers and enhancement pipeline
- ✅ Maintainable and auditable security configuration

All requirements (15.1, 14.1, 14.2) have been satisfied.
