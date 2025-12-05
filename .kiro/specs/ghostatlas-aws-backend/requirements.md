# Requirements Document

## Introduction

The GhostAtlas AWS Backend provides a serverless API infrastructure to support the GhostAtlas mobile application. The system enables users to submit paranormal encounter stories with location data and images, applies AI-powered enhancements to create immersive horror narratives with illustrations and voice narration, and provides an admin approval workflow before publishing stories to a public map. The backend handles media storage, geospatial queries, rating systems, and location-based verification without requiring user authentication.

## Glossary

- **Backend_System**: The serverless AWS infrastructure including API Gateway, Lambda functions, DynamoDB tables, S3 buckets, and AI services
- **Encounter**: A paranormal story submission containing author name, location coordinates, timestamp, narrative text, and optional images
- **Enhancement_Pipeline**: The automated AI workflow that transforms approved encounters into horror narratives with generated illustrations and voice narration
- **Admin_Panel**: The administrative interface for reviewing and approving/rejecting pending encounter submissions
- **Verification**: A user check-in at a haunted location to confirm the encounter occurred at that place and time
- **Rating**: A user-submitted score (1-5) evaluating an encounter's credibility or scariness
- **Geospatial_Query**: A location-based search to retrieve encounters within a specified radius of coordinates
- **Media_Asset**: Images, illustrations, or audio files stored in S3 and delivered via CloudFront CDN
- **Device_ID**: A unique identifier for rate limiting and preventing duplicate ratings without user authentication
- **Spookiness_Score**: A numerical rating (1-5) indicating how scary or credible a verification is

## Requirements

### Requirement 1

**User Story:** As a mobile app user, I want to submit paranormal encounter stories with location and images, so that I can share my experiences with the community

#### Acceptance Criteria

1. WHEN the Backend_System receives a POST request to /api/encounters with encounter data, THE Backend_System SHALL validate the request contains authorName, location coordinates, originalStory text, and encounterTime
2. WHEN the Backend_System validates encounter submission data, THE Backend_System SHALL reject requests with authorName exceeding 100 characters
3. WHEN the Backend_System validates encounter submission data, THE Backend_System SHALL reject requests with originalStory text exceeding 5000 characters
4. WHEN the Backend_System validates location coordinates, THE Backend_System SHALL reject requests with latitude outside -90 to 90 degrees or longitude outside -180 to 180 degrees
5. WHEN the Backend_System receives valid encounter data, THE Backend_System SHALL store the encounter in DynamoDB with status "pending" and return the encounter ID within 2 seconds

### Requirement 2

**User Story:** As a mobile app user, I want to upload images with my encounter submission, so that I can provide visual evidence of my paranormal experience

#### Acceptance Criteria

1. WHEN the Backend_System receives an image upload request, THE Backend_System SHALL generate a presigned S3 URL valid for 15 minutes
2. WHEN the Backend_System generates presigned URLs, THE Backend_System SHALL enforce a maximum file size of 10 megabytes
3. WHEN the Backend_System stores uploaded images, THE Backend_System SHALL save files to the S3 bucket with path pattern "encounters/{encounterId}/images/{timestamp}-{filename}"
4. WHEN the Backend_System stores images in S3, THE Backend_System SHALL configure the bucket to serve images through CloudFront CDN
5. WHEN the Backend_System completes image upload, THE Backend_System SHALL update the encounter record with the CloudFront URL within 1 second

### Requirement 3

**User Story:** As a mobile app user, I want to retrieve approved encounters near my location, so that I can explore haunted places around me

#### Acceptance Criteria

1. WHEN the Backend_System receives a GET request to /api/encounters with latitude and longitude parameters, THE Backend_System SHALL return encounters within 50 kilometers of the specified coordinates
2. WHEN the Backend_System executes geospatial queries, THE Backend_System SHALL return results sorted by distance from the query location
3. WHEN the Backend_System returns encounter lists, THE Backend_System SHALL include only encounters with status "approved"
4. WHEN the Backend_System processes map queries with 100 or more encounters, THE Backend_System SHALL return results within 3 seconds
5. WHEN the Backend_System returns encounter data, THE Backend_System SHALL include id, authorName, location, enhancedStory, encounterTime, imageUrls, illustrationUrl, narrationUrl, rating, and verificationCount fields

### Requirement 4

**User Story:** As a mobile app user, I want to view detailed information about a specific encounter, so that I can read the full story and see all associated media

#### Acceptance Criteria

1. WHEN the Backend_System receives a GET request to /api/encounters/{id}, THE Backend_System SHALL retrieve the encounter from DynamoDB by primary key
2. WHEN the Backend_System retrieves an encounter by ID, THE Backend_System SHALL return HTTP 404 if the encounter does not exist
3. WHEN the Backend_System retrieves an encounter by ID, THE Backend_System SHALL return HTTP 403 if the encounter status is not "approved"
4. WHEN the Backend_System returns encounter details, THE Backend_System SHALL include all encounter fields plus verification details and rating statistics
5. WHEN the Backend_System serves encounter media URLs, THE Backend_System SHALL provide CloudFront CDN URLs with cache headers set to 86400 seconds

### Requirement 5

**User Story:** As a mobile app user, I want to rate encounters, so that I can indicate which stories I find most credible or scary

#### Acceptance Criteria

1. WHEN the Backend_System receives a POST request to /api/encounters/{id}/rate with rating and deviceId, THE Backend_System SHALL validate the rating is an integer between 1 and 5
2. WHEN the Backend_System processes a rating submission, THE Backend_System SHALL check if the deviceId has already rated this encounter
3. WHEN the Backend_System detects a duplicate rating from the same deviceId, THE Backend_System SHALL return HTTP 409 with message "Already rated"
4. WHEN the Backend_System stores a new rating, THE Backend_System SHALL update the encounter's average rating and rating count within 2 seconds
5. WHEN the Backend_System calculates average ratings, THE Backend_System SHALL round the result to one decimal place

### Requirement 6

**User Story:** As a mobile app user, I want to verify encounters by checking in at haunted locations, so that I can confirm paranormal activity at specific places

#### Acceptance Criteria

1. WHEN the Backend_System receives a POST request to /api/encounters/{id}/verify with location, spookinessScore, and optional notes, THE Backend_System SHALL validate spookinessScore is between 1 and 5
2. WHEN the Backend_System processes verification submissions, THE Backend_System SHALL calculate the distance between verification location and encounter location
3. WHEN the Backend_System calculates verification distance, THE Backend_System SHALL reject verifications more than 100 meters from the encounter location
4. WHEN the Backend_System stores verification data, THE Backend_System SHALL determine if the verification time matches the encounter's time of day within 2 hours
5. WHEN the Backend_System completes verification storage, THE Backend_System SHALL increment the encounter's verificationCount within 1 second

### Requirement 7

**User Story:** As an administrator, I want to review pending encounter submissions, so that I can approve quality content before it appears on the public map

#### Acceptance Criteria

1. WHEN the Backend_System receives a GET request to /api/admin/encounters, THE Backend_System SHALL return all encounters with status "pending" ordered by submission time
2. WHEN the Backend_System returns pending encounters, THE Backend_System SHALL include originalStory, authorName, location, encounterTime, and imageUrls
3. WHEN the Backend_System serves admin endpoints, THE Backend_System SHALL implement rate limiting of 100 requests per minute per IP address
4. WHEN the Backend_System processes admin list requests, THE Backend_System SHALL support pagination with default page size of 20 encounters
5. WHEN the Backend_System returns paginated results, THE Backend_System SHALL include nextToken for retrieving subsequent pages

### Requirement 8

**User Story:** As an administrator, I want to approve encounter submissions, so that quality paranormal stories appear on the public map with AI enhancements

#### Acceptance Criteria

1. WHEN the Backend_System receives a PUT request to /api/admin/encounters/{id}/approve, THE Backend_System SHALL update the encounter status to "approved"
2. WHEN the Backend_System approves an encounter, THE Backend_System SHALL publish a message to the Enhancement_Pipeline queue within 1 second
3. WHEN the Backend_System publishes to the enhancement queue, THE Backend_System SHALL include the encounter ID and all encounter data
4. WHEN the Backend_System completes approval, THE Backend_System SHALL return HTTP 200 with the updated encounter data
5. WHEN the Backend_System processes approval for non-existent encounters, THE Backend_System SHALL return HTTP 404

### Requirement 9

**User Story:** As an administrator, I want to reject encounter submissions, so that inappropriate or low-quality content does not appear on the public map

#### Acceptance Criteria

1. WHEN the Backend_System receives a PUT request to /api/admin/encounters/{id}/reject, THE Backend_System SHALL update the encounter status to "rejected"
2. WHEN the Backend_System rejects an encounter, THE Backend_System SHALL not trigger the Enhancement_Pipeline
3. WHEN the Backend_System completes rejection, THE Backend_System SHALL return HTTP 200 with confirmation message
4. WHEN the Backend_System processes rejection for non-existent encounters, THE Backend_System SHALL return HTTP 404
5. WHEN the Backend_System stores rejected encounters, THE Backend_System SHALL retain the data for audit purposes but exclude from public queries

### Requirement 10

**User Story:** As the system, I want to automatically enhance approved encounters with AI-generated content, so that users receive immersive horror narratives with multiple illustrations and voice narration

#### Acceptance Criteria

1. WHEN the Enhancement_Pipeline receives an approved encounter, THE Enhancement_Pipeline SHALL invoke AWS Bedrock to transform the originalStory into a horror narrative within 10 seconds
2. WHEN the Enhancement_Pipeline generates horror narratives, THE Enhancement_Pipeline SHALL use a prompt that maintains the original story facts while adding atmospheric horror elements
3. WHEN the Enhancement_Pipeline completes narrative generation, THE Enhancement_Pipeline SHALL invoke AWS Bedrock to generate multiple spooky illustrations based on the enhanced story within 45 seconds
4. WHEN the Enhancement_Pipeline generates illustrations, THE Enhancement_Pipeline SHALL create 3 to 5 images representing different scenes from the story
5. WHEN the Enhancement_Pipeline generates illustrations, THE Enhancement_Pipeline SHALL save each image to S3 with path "encounters/{encounterId}/illustrations/{index}.png"
6. WHEN the Enhancement_Pipeline completes illustration generation, THE Enhancement_Pipeline SHALL invoke AWS Polly to create voice narration of the enhanced story within 10 seconds
7. WHEN the Enhancement_Pipeline processes any approved encounter, THE Enhancement_Pipeline SHALL always generate narrative, illustrations, and narration regardless of whether user-uploaded images exist

### Requirement 11

**User Story:** As the system, I want to store AI-generated media assets and update encounter records, so that enhanced content is available to mobile app users

#### Acceptance Criteria

1. WHEN the Enhancement_Pipeline generates voice narration, THE Enhancement_Pipeline SHALL save the audio file to S3 with path "encounters/{encounterId}/narration.mp3"
2. WHEN the Enhancement_Pipeline stores media assets in S3, THE Enhancement_Pipeline SHALL configure files with public-read ACL and CloudFront distribution
3. WHEN the Enhancement_Pipeline completes all AI enhancements, THE Enhancement_Pipeline SHALL update the encounter record with enhancedStory, illustrationUrls array, and narrationUrl
4. WHEN the Enhancement_Pipeline updates encounter records, THE Enhancement_Pipeline SHALL complete all updates within 60 seconds of receiving the approval message
5. IF the Enhancement_Pipeline encounters errors during processing, THEN THE Enhancement_Pipeline SHALL log the error and update encounter status to "enhancement_failed"

### Requirement 12

**User Story:** As the system, I want to implement rate limiting and input validation, so that the API remains secure and performant under load

#### Acceptance Criteria

1. WHEN the Backend_System receives API requests, THE Backend_System SHALL enforce rate limiting of 100 requests per minute per IP address for public endpoints
2. WHEN the Backend_System detects rate limit violations, THE Backend_System SHALL return HTTP 429 with Retry-After header
3. WHEN the Backend_System validates request payloads, THE Backend_System SHALL sanitize input to prevent SQL injection and XSS attacks
4. WHEN the Backend_System processes file uploads, THE Backend_System SHALL validate file types are JPEG, PNG, or WebP formats
5. WHEN the Backend_System handles errors, THE Backend_System SHALL return standardized error responses with error code, message, and timestamp

### Requirement 13

**User Story:** As the system, I want to optimize DynamoDB queries with appropriate indexes, so that geospatial and status-based queries perform efficiently

#### Acceptance Criteria

1. WHEN the Backend_System creates the Encounters table, THE Backend_System SHALL define a Global Secondary Index on status with encounterTime as sort key
2. WHEN the Backend_System creates the Encounters table, THE Backend_System SHALL store location as a geohash attribute for efficient spatial queries
3. WHEN the Backend_System creates the Verifications table, THE Backend_System SHALL define encounterId as partition key and verifiedAt as sort key
4. WHEN the Backend_System creates the Ratings table, THE Backend_System SHALL define a composite key of encounterId and deviceId
5. WHEN the Backend_System executes queries, THE Backend_System SHALL use consistent reads only when data consistency is critical

### Requirement 14

**User Story:** As the system, I want to configure S3 buckets with lifecycle policies and CDN distribution, so that media assets are delivered efficiently and cost-effectively

#### Acceptance Criteria

1. WHEN the Backend_System creates the media S3 bucket, THE Backend_System SHALL enable versioning for data protection
2. WHEN the Backend_System configures S3 lifecycle policies, THE Backend_System SHALL transition objects to Infrequent Access storage after 90 days
3. WHEN the Backend_System configures CloudFront distribution, THE Backend_System SHALL set default TTL to 86400 seconds for media assets
4. WHEN the Backend_System serves media through CloudFront, THE Backend_System SHALL enable compression for text-based assets
5. WHEN the Backend_System configures S3 CORS, THE Backend_System SHALL allow GET and PUT methods from the mobile app domain

### Requirement 15

**User Story:** As a developer, I want infrastructure defined as code, so that the backend can be deployed consistently across environments

#### Acceptance Criteria

1. WHEN the Backend_System infrastructure is deployed, THE Backend_System SHALL use AWS SAM or CDK for infrastructure as code
2. WHEN the Backend_System defines Lambda functions, THE Backend_System SHALL configure appropriate memory allocation between 512 MB and 3008 MB based on function requirements
3. WHEN the Backend_System defines Lambda functions, THE Backend_System SHALL set timeout values between 10 seconds and 300 seconds based on function complexity
4. WHEN the Backend_System configures API Gateway, THE Backend_System SHALL enable CORS for all endpoints with appropriate allowed origins
5. WHEN the Backend_System deploys resources, THE Backend_System SHALL tag all resources with environment, project, and cost-center tags
