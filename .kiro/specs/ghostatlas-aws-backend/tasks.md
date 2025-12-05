# Implementation Plan

- [x] 1. Set up project structure and infrastructure foundation
  - Create CDK project with TypeScript
  - Configure project dependencies (AWS SDK, CDK constructs, testing libraries)
  - Set up directory structure for Lambda functions, constructs, and tests
  - Configure environment-specific settings (dev, staging, prod)
  - Initialize Git repository with .gitignore for Node.js and AWS
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 2. Implement DynamoDB table definitions
- [x] 2.1 Create DynamoDB tables construct
  - Define Encounters table with primary key (id) and GSI (status-encounterTime-index, geohash-status-index)
  - Define Verifications table with composite key (encounterId, verifiedAt)
  - Define Ratings table with composite key (encounterId, deviceId)
  - Configure on-demand billing, encryption, and point-in-time recovery
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ]* 2.2 Write property test for geohash calculation
  - **Property 23: Geohash is calculated correctly**
  - **Validates: Requirements 13.2**

- [x] 3. Implement S3 and CloudFront infrastructure
- [x] 3.1 Create S3 bucket construct
  - Define media bucket with versioning and encryption
  - Configure CORS for Flutter app domain
  - Set up lifecycle policies for Infrequent Access transition after 90 days
  - _Requirements: 14.1, 14.2, 14.5_

- [x] 3.2 Create CloudFront distribution construct
  - Configure CloudFront with S3 origin
  - Set cache behaviors with 86400s default TTL
  - Enable compression and HTTPS-only access
  - _Requirements: 14.3, 14.4_

- [x] 4. Implement shared utility functions
- [x] 4.1 Create geospatial utilities
  - Implement Haversine distance calculation
  - Implement geohash encoding/decoding (precision 6)
  - Implement coordinate validation
  - _Requirements: 1.4, 3.1, 6.2, 6.3_

- [ ]* 4.2 Write property test for distance calculation
  - **Property 12: Verification distance is validated**
  - **Validates: Requirements 6.2, 6.3**

- [x] 4.3 Create validation utilities
  - Implement input sanitization for XSS prevention
  - Implement field length validation
  - Implement coordinate range validation
  - Implement file type validation
  - _Requirements: 1.2, 1.3, 1.4, 12.3, 12.4_

- [ ]* 4.4 Write property test for input validation
  - **Property 1: Input validation rejects invalid data**
  - **Validates: Requirements 1.2, 1.3, 1.4, 2.2, 5.1, 6.1, 12.4**

- [ ]* 4.5 Write property test for input sanitization
  - **Property 21: Input sanitization prevents injection attacks**
  - **Validates: Requirements 12.3**

- [x] 4.6 Create error handler utility
  - Implement standardized error response formatting
  - Implement error logging to CloudWatch
  - Implement error code mapping
  - _Requirements: 12.5_

- [ ]* 4.7 Write property test for error response format
  - **Property 22: Error responses follow standard format**
  - **Validates: Requirements 12.5**

- [x] 5. Implement encounter submission API
- [x] 5.1 Create SubmitEncounter Lambda function
  - Validate encounter data (required fields, field lengths, coordinates)
  - Generate unique encounter ID using ULID
  - Calculate geohash from coordinates
  - Store encounter in DynamoDB with status="pending"
  - Generate presigned S3 URLs for image uploads (15 min expiry)
  - Return encounter ID and upload URLs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2_

- [ ]* 5.2 Write property test for required fields validation
  - **Property 2: Required fields are always present**
  - **Validates: Requirements 1.1**

- [ ]* 5.3 Write property test for pending status storage
  - **Property 3: Valid encounters are stored with pending status**
  - **Validates: Requirements 1.5**

- [ ]* 5.4 Write property test for presigned URL expiration
  - **Property 4: Presigned URLs have correct expiration**
  - **Validates: Requirements 2.1**

- [x] 5.5 Create image upload completion handler
  - Update encounter record with CloudFront URLs after upload
  - Validate S3 path follows pattern "encounters/{id}/images/{timestamp}-{filename}"
  - _Requirements: 2.3, 2.5_

- [ ]* 5.6 Write property test for S3 path patterns
  - **Property 5: S3 paths follow naming conventions**
  - **Validates: Requirements 2.3, 10.4, 11.1**

- [ ]* 5.7 Write property test for encounter update after upload
  - **Property 6: Encounter records are updated after upload**
  - **Validates: Requirements 2.5**

- [ ] 6. Implement geospatial query API
- [x] 6.1 Create GetEncounters Lambda function
  - Validate latitude/longitude parameters
  - Calculate geohash prefix for query optimization
  - Query DynamoDB GSI (status-encounterTime-index) with status="approved"
  - Filter results by distance using Haversine formula
  - Sort by distance ascending
  - Return paginated results with required fields
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 6.2 Write property test for geospatial filtering
  - **Property 7: Geospatial queries return nearby encounters**
  - **Validates: Requirements 3.1**

- [ ]* 6.3 Write property test for distance sorting
  - **Property 8: Geospatial results are sorted by distance**
  - **Validates: Requirements 3.2**

- [ ]* 6.4 Write property test for status filtering
  - **Property 9: Status filtering excludes inappropriate encounters**
  - **Validates: Requirements 3.3, 4.3, 7.1, 9.5**

- [x] 7. Implement encounter detail API
- [x] 7.1 Create GetEncounterById Lambda function
  - Retrieve encounter by ID from DynamoDB
  - Return 404 if encounter does not exist
  - Return 403 if status is not "approved"
  - Query verifications and ratings for the encounter
  - Return complete encounter details with all required fields
  - Include CloudFront URLs with cache headers (86400s)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement rating system
- [x] 8.1 Create RateEncounter Lambda function
  - Validate rating (1-5) and deviceId
  - Check for duplicate rating (composite key: encounterId + deviceId)
  - Return 409 if already rated
  - Store rating in Ratings table
  - Update encounter's average rating and count using atomic counter
  - Calculate average rounded to one decimal place
  - Return updated rating statistics
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 8.2 Write property test for duplicate rating prevention
  - **Property 10: Duplicate ratings are prevented**
  - **Validates: Requirements 5.2, 5.3**

- [ ]* 8.3 Write property test for average rating calculation
  - **Property 11: Average ratings are calculated correctly**
  - **Validates: Requirements 5.4, 5.5**

- [x] 9. Implement location verification system
- [x] 9.1 Create VerifyLocation Lambda function
  - Validate spookinessScore (1-5) and location
  - Retrieve encounter to get original location
  - Calculate distance between verification and encounter location
  - Reject if distance > 100 meters
  - Check if verification time matches encounter time of day (±2 hours)
  - Store verification in Verifications table
  - Increment encounter's verificationCount
  - Return verification ID and time match status
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 9.2 Write property test for time matching
  - **Property 13: Time matching uses 2-hour window**
  - **Validates: Requirements 6.4**

- [ ]* 9.3 Write property test for verification counter
  - **Property 14: Verification increments counter**
  - **Validates: Requirements 6.5**

- [x] 10. Implement admin panel APIs
- [x] 10.1 Create AdminListPending Lambda function
  - Query DynamoDB GSI (status-encounterTime-index) with status="pending"
  - Sort by encounterTime descending (newest first)
  - Implement pagination with nextToken (default page size 20)
  - Return list of pending encounters with required fields
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [ ]* 10.2 Write property test for pagination
  - **Property 15: Pagination works correctly**
  - **Validates: Requirements 7.4, 7.5**

- [x] 10.3 Create AdminApprove Lambda function
  - Validate encounter exists
  - Update encounter status to "approved"
  - Publish message to SQS enhancement queue with encounter data
  - Return success response with updated encounter
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 10.4 Write property test for approval workflow
  - **Property 16: Approval updates status and triggers enhancement**
  - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 10.5 Create AdminReject Lambda function
  - Validate encounter exists
  - Update encounter status to "rejected"
  - Do not trigger Enhancement_Pipeline
  - Optionally store rejection reason
  - Return success response
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 10.6 Write property test for rejection workflow
  - **Property 17: Rejection updates status without triggering enhancement**
  - **Validates: Requirements 9.1, 9.2**

- [x] 11. Implement SQS enhancement queue
- [x] 11.1 Create SQS queue construct
  - Define enhancement queue with 14-day retention
  - Configure visibility timeout (60s) and long polling (20s)
  - Set up Dead Letter Queue after 3 retries
  - Enable encryption (SSE-SQS)
  - _Requirements: 8.2, 8.3_

- [x] 12. Implement AI enhancement pipeline
- [x] 12.1 Create GenerateNarrative function
  - Invoke Bedrock with Claude 3 Sonnet model
  - Use prompt template to transform story into horror narrative
  - Maintain factual accuracy while adding atmospheric elements
  - Return enhanced narrative text (max 10,000 chars)
  - Handle errors with retry logic and timeout (15s)
  - _Requirements: 10.1, 10.2_

- [x] 12.2 Create GenerateIllustration function
  - Parse enhanced narrative into 3-5 distinct scenes
  - Invoke Bedrock with Stable Diffusion XL model for each scene
  - Generate scene-specific prompts from enhanced narrative
  - Create 3-5 spooky illustrations (1024x1024 PNG each)
  - Save images to S3 at encounters/{id}/illustrations/{index}.png
  - Return array of CloudFront URLs
  - Maintain visual consistency across the image sequence
  - Handle errors with retry logic and timeout (60s total)
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 12.3 Create GenerateNarration function
  - Invoke Polly with Neural voice (Matthew or Joanna)                           
  - Convert enhanced narrative to speech with SSML
  - Save MP3 to S3 at encounters/{id}/narration.mp3
  - Return CloudFront URL
  - Handle errors with retry logic and timeout (15s)
  - _Requirements: 10.5, 11.1_

- [x] 12.4 Create EnhancementOrchestrator Lambda function
  - Receive encounter data from SQS
  - Orchestrate sequential AI enhancement steps (narrative → multiple illustrations → narration)
  - ALWAYS generate narrative, illustrations, and narration regardless of user-uploaded images
  - Update encounter record with enhancedStory, illustrationUrls array (3-5 URLs), and narrationUrl
  - Handle errors and update status to "enhancement_failed" on failure
  - Log all operations to CloudWatch
  - Increase Lambda timeout to 90 seconds and memory to 2048 MB
  - _Requirements: 10.1, 10.3, 10.4, 10.5, 10.6, 10.7, 11.2, 11.3, 11.4, 11.5_

- [ ]* 12.5 Write property test for enhancement pipeline execution
  - **Property 18: Enhancement pipeline invokes all AI services**
  - **Validates: Requirements 10.1, 10.3, 10.4, 10.5, 10.6, 10.7**

- [ ]* 12.6 Write property test for encounter update after enhancement
  - **Property 19: Enhancement updates encounter with all media URLs**
  - **Validates: Requirements 11.3**

- [ ]* 12.8 Write property test for multiple illustrations generation
  - **Property 24: Multiple illustrations are generated**
  - **Validates: Requirements 10.4, 10.5**

- [ ]* 12.7 Write property test for enhancement error handling
  - **Property 20: Enhancement errors update status to failed**
  - **Validates: Requirements 11.5**

- [ ] 13. Implement API Gateway configuration
- [x] 13.1 Create API Gateway construct
  - Define REST API with CORS configuration
  - Configure rate limiting (100 req/min per IP)
  - Set up request validation
  - Define all API endpoints with Lambda integrations
  - Configure throttling (burst: 200, rate: 100/s)
  - _Requirements: 12.1, 12.2, 15.4_

- [x] 13.2 Configure API Gateway routes
  - POST /api/encounters → SubmitEncounter
  - GET /api/encounters → GetEncounters
  - GET /api/encounters/{id} → GetEncounterById
  - POST /api/encounters/{id}/rate → RateEncounter
  - POST /api/encounters/{id}/verify → VerifyLocation
  - GET /api/admin/encounters → AdminListPending
  - PUT /api/admin/encounters/{id}/approve → AdminApprove
  - PUT /api/admin/encounters/{id}/reject → AdminReject
  - _Requirements: 1.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1_

- [x] 14. Implement IAM roles and security
- [x] 14.1 Create IAM roles for Lambda functions
  - Define role for API handlers with DynamoDB and S3 permissions
  - Define role for enhancement pipeline with Bedrock, Polly, S3, and SQS permissions
  - Apply principle of least privilege
  - _Requirements: 15.1_

- [x] 14.2 Configure S3 bucket policies
  - Restrict access to CloudFront OAI only
  - Configure encryption at rest (AES-256)
  - _Requirements: 14.1_

- [ ] 15. Implement monitoring and logging
- [x] 15.1 Configure CloudWatch Logs
  - Enable logging for all Lambda functions
  - Set log retention to 30 days
  - _Requirements: 11.5, 12.5_

- [x] 15.2 Create CloudWatch Alarms
  - Alarm for Lambda error rates >5% in 5 minutes
  - Alarm for API Gateway 5xx errors
  - Alarm for DynamoDB throttling
  - Alarm for SQS DLQ messages
  - Alarm for enhancement pipeline failures
  - _Requirements: 11.5_

- [x] 15.3 Configure X-Ray tracing
  - Enable X-Ray for all Lambda functions
  - Enable X-Ray for API Gateway
  - _Requirements: 15.1_

- [x] 16. Create deployment pipeline
- [x] 16.1 Set up GitHub Actions workflow
  - Configure CI/CD pipeline with test, build, and deploy stages
  - Run unit tests and property tests on every commit
  - Deploy to dev environment automatically
  - Require manual approval for staging and production
  - _Requirements: 15.1_

- [x] 16.2 Configure environment-specific deployments
  - Create separate CDK stacks for dev, staging, and prod
  - Configure environment variables and secrets per environment
  - Implement blue/green deployment strategy for production
  - _Requirements: 15.1, 15.5_

- [ ] 17. Write infrastructure tests
- [ ]* 17.1 Write CDK assertion tests
  - Verify DynamoDB table schemas and indexes
  - Verify S3 bucket policies and CORS configuration
  - Verify Lambda function configurations (memory, timeout)
  - Verify API Gateway rate limiting settings
  - Verify CloudFront distribution configuration
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.3, 14.4, 14.5, 15.2, 15.3, 15.4_

- [x] 18. Create API documentation
- [x] 18.1 Generate OpenAPI specification
  - Document all API endpoints with request/response schemas
  - Include authentication requirements (none for public, rate limiting)
  - Document error responses
  - _Requirements: All API requirements_

- [x] 18.2 Create deployment guide
  - Document prerequisites (AWS account, Node.js, CDK)
  - Document deployment steps for each environment
  - Document environment variable configuration
  - Document monitoring and troubleshooting
  - _Requirements: 15.1_

- [x] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
