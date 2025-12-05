# CDK Constructs

This directory contains reusable CDK constructs for infrastructure components.

## Implemented Constructs

### DynamoDBTables (`dynamodb-tables.ts`)

Creates all DynamoDB tables for the GhostAtlas backend:
- **Encounters Table**: Main table for paranormal encounter submissions with GSI for status and geohash queries
- **Verifications Table**: Location verification check-ins
- **Ratings Table**: User ratings for encounters

Features:
- On-demand billing mode
- Point-in-time recovery enabled
- Encryption at rest (AWS managed)
- Global Secondary Indexes for efficient queries

### S3Buckets (`s3-buckets.ts`)

Creates S3 buckets for media storage:
- **Media Bucket**: Stores user-uploaded images, AI-generated illustrations, and narration audio

Features:
- Versioning enabled for data protection
- AES-256 encryption at rest
- CORS configuration for Flutter app
- Lifecycle policy: transition to Infrequent Access after 90 days
- Public access blocked (access via CloudFront only)
- Auto-delete objects for dev environment

### CloudFrontDistribution (`cloudfront-distribution.ts`)

Creates CloudFront CDN distribution for global media delivery:

Features:
- S3 origin with Origin Access Control (OAC) for secure access
- Cache policy with 86400s (24 hours) default TTL
- Compression enabled (Gzip and Brotli)
- HTTPS-only access required
- HTTP/2 and HTTP/3 support
- All edge locations (PriceClass_All) for global performance
- CloudWatch logging enabled for production

### SQSQueues (`sqs-queues.ts`)

Creates SQS queues for the AI enhancement pipeline:
- **Enhancement Queue**: Receives approved encounters for AI enhancement processing
- **Enhancement DLQ**: Dead Letter Queue for failed enhancement messages

Features:
- 14-day message retention period
- 60-second visibility timeout for Lambda processing
- 20-second long polling to reduce API costs
- Dead Letter Queue after 3 failed processing attempts
- SSE-SQS encryption enabled
- Environment-specific removal policies

### LambdaFunctions (`lambda-functions.ts`)

Creates all Lambda functions for the GhostAtlas backend API:

**API Handler Functions:**
- **SubmitEncounter**: Handle encounter submissions with validation and presigned URL generation
- **GetEncounters**: Geospatial queries for approved encounters
- **GetEncounterById**: Retrieve specific encounter details with verifications and ratings
- **RateEncounter**: Submit ratings for encounters with duplicate prevention
- **VerifyLocation**: Location verification check-ins with distance validation
- **AdminListPending**: List pending encounters for admin review
- **AdminApprove**: Approve encounters and trigger AI enhancement pipeline
- **AdminReject**: Reject encounter submissions

Features:
- Node.js 20.x runtime
- Environment-specific memory allocation (512 MB - 1024 MB)
- Configurable timeouts (5-10 seconds)
- X-Ray tracing enabled for staging/prod
- CloudWatch log groups with retention policies
- Automatic bundling with esbuild
- IAM permissions granted per function requirements
- Environment variables for DynamoDB tables, S3 buckets, and SQS queues

### ApiGateway (`api-gateway.ts`)

Creates REST API Gateway with all endpoints and Lambda integrations:

**Public Endpoints:**
- `POST /api/encounters` - Submit new encounter
- `GET /api/encounters` - Get nearby encounters (geospatial query)
- `GET /api/encounters/{id}` - Get encounter details
- `POST /api/encounters/{id}/rate` - Rate an encounter
- `POST /api/encounters/{id}/verify` - Verify encounter location

**Admin Endpoints:**
- `GET /api/admin/encounters` - List pending encounters
- `PUT /api/admin/encounters/{id}/approve` - Approve encounter
- `PUT /api/admin/encounters/{id}/reject` - Reject encounter

Features:
- CORS enabled for all endpoints
- Rate limiting: 100 requests per minute per IP
- Throttling: burst limit 200, rate limit 100/s
- Request validation for all endpoints
- CloudWatch access logs and execution logs
- X-Ray tracing enabled for staging/prod
- Usage plan with daily quota
- Method responses defined for all status codes
- Environment-specific configuration

## Planned Constructs

- `iam-roles.ts` - IAM role and policy definitions (Task 14)
- `monitoring.ts` - CloudWatch alarms and X-Ray configuration (Task 15)

Each construct will be implemented in subsequent tasks.
