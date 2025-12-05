# GhostAtlas Backend API Endpoints

## Base URL
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}/api
```

## Public Endpoints

### 1. Submit Encounter
**POST** `/encounters`

Submit a new paranormal encounter with location and story details.

**Request Body:**
```json
{
  "authorName": "string (max 100 chars)",
  "location": {
    "latitude": "number (-90 to 90)",
    "longitude": "number (-180 to 180)",
    "address": "string (optional)"
  },
  "originalStory": "string (max 5000 chars)",
  "encounterTime": "ISO 8601 timestamp",
  "imageCount": "number (0-5)"
}
```

**Response:** `200 OK`
```json
{
  "encounterId": "string (ULID)",
  "uploadUrls": ["string (presigned S3 URLs)"]
}
```

**Errors:** `400 Bad Request`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 2. Get Encounters (Geospatial Query)
**GET** `/encounters?latitude={lat}&longitude={lon}&radius={km}&limit={n}`

Retrieve approved encounters near a specific location.

**Query Parameters:**
- `latitude` (required): Latitude coordinate (-90 to 90)
- `longitude` (required): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in kilometers (default: 50, max: 100)
- `limit` (optional): Maximum results to return (default: 100, max: 500)

**Response:** `200 OK`
```json
{
  "encounters": [
    {
      "id": "string",
      "authorName": "string",
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      },
      "enhancedStory": "string",
      "encounterTime": "string",
      "imageUrls": ["string"],
      "illustrationUrl": "string",
      "narrationUrl": "string",
      "rating": "number",
      "verificationCount": "number",
      "distance": "number (meters)"
    }
  ],
  "count": "number"
}
```

**Errors:** `400 Bad Request`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 3. Get Encounter by ID
**GET** `/encounters/{id}`

Retrieve detailed information about a specific encounter.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Response:** `200 OK`
```json
{
  "id": "string",
  "authorName": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "originalStory": "string",
  "enhancedStory": "string",
  "encounterTime": "string",
  "imageUrls": ["string"],
  "illustrationUrl": "string",
  "narrationUrl": "string",
  "rating": "number",
  "ratingCount": "number",
  "verificationCount": "number",
  "verifications": [
    {
      "id": "string",
      "spookinessScore": "number",
      "verifiedAt": "string",
      "isTimeMatched": "boolean"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Errors:** `403 Forbidden` (not approved), `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 4. Rate Encounter
**POST** `/encounters/{id}/rate`

Submit a rating for an encounter.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Request Body:**
```json
{
  "deviceId": "string (UUID)",
  "rating": "number (1-5)"
}
```

**Response:** `200 OK`
```json
{
  "averageRating": "number (1 decimal place)",
  "ratingCount": "number"
}
```

**Errors:** `400 Bad Request`, `404 Not Found`, `409 Conflict` (already rated), `429 Too Many Requests`, `500 Internal Server Error`

---

### 5. Verify Location
**POST** `/encounters/{id}/verify`

Submit a location verification check-in for an encounter.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Request Body:**
```json
{
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "spookinessScore": "number (1-5)",
  "notes": "string (optional, max 500 chars)"
}
```

**Response:** `200 OK`
```json
{
  "verificationId": "string (ULID)",
  "isTimeMatched": "boolean",
  "distanceMeters": "number"
}
```

**Errors:** `400 Bad Request` (too far from location), `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 6. Trigger AI Enhancement
**PUT** `/encounters/{id}/upload-complete`

Trigger the AI enhancement pipeline for a submitted encounter. This should be called after encounter submission (and optional image uploads) to start generating AI narrative, narration, and illustration.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Request Body:** None

**Response:** `200 OK`
```json
{
  "message": "AI enhancement pipeline triggered",
  "encounterId": "string (ULID)",
  "status": "enhancing"
}
```

**Notes:**
- Idempotent: Can be called multiple times safely
- If encounter is already enhancing or enhanced, returns success without re-triggering
- Updates encounter status from 'pending' to 'enhancing'
- Queues enhancement jobs for narrative, narration, and illustration generation

**Errors:** `400 Bad Request`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

---

## Admin Endpoints

### 6. List Pending Encounters
**GET** `/admin/encounters?nextToken={token}&limit={n}`

List all pending encounters awaiting admin review.

**Query Parameters:**
- `nextToken` (optional): Pagination token for next page
- `limit` (optional): Results per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "encounters": [
    {
      "id": "string",
      "authorName": "string",
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      },
      "originalStory": "string",
      "encounterTime": "string",
      "imageUrls": ["string"],
      "createdAt": "string"
    }
  ],
  "nextToken": "string (optional)"
}
```

**Errors:** `400 Bad Request`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 7. Approve Encounter
**PUT** `/admin/encounters/{id}/approve`

Approve an encounter and trigger AI enhancement pipeline.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Response:** `200 OK`
```json
{
  "status": "approved",
  "encounterId": "string"
}
```

**Errors:** `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

---

### 8. Reject Encounter
**PUT** `/admin/encounters/{id}/reject`

Reject an encounter submission.

**Path Parameters:**
- `id`: Encounter ID (ULID)

**Request Body (optional):**
```json
{
  "reason": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "status": "rejected",
  "encounterId": "string"
}
```

**Errors:** `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

---

## Rate Limiting

All endpoints are subject to the following rate limits:

- **Burst Limit**: 200 requests
- **Rate Limit**: 100 requests per second
- **Usage Plan**: 100 requests per minute per IP address
- **Daily Quota**: Configurable per environment

When rate limits are exceeded, the API returns:
```json
{
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "timestamp": "ISO 8601 timestamp"
}
```

**Response:** `429 Too Many Requests`
**Headers:** `Retry-After: {seconds}`

---

## Error Response Format

All errors follow a standardized format:

```json
{
  "errorCode": "ERROR_CODE",
  "message": "Human-readable error message",
  "timestamp": "ISO 8601 timestamp",
  "requestId": "string (for tracing)"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Access denied
- `CONFLICT`: Resource conflict (e.g., duplicate rating)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## CORS Configuration

All endpoints support CORS with the following configuration:

- **Allowed Origins**: `*` (configurable for production)
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`, `X-Api-Key`, `X-Amz-*`
- **Max Age**: 3600 seconds (1 hour)

---

## Authentication

Currently, the API does not require authentication. Rate limiting is enforced per IP address.

Future versions may implement:
- API key authentication for admin endpoints
- AWS Cognito integration for user accounts
- OAuth 2.0 for third-party integrations

---

## Monitoring

All API requests are logged to CloudWatch with the following information:

- Request ID
- IP address
- HTTP method
- Resource path
- Status code
- Response time
- User agent

X-Ray tracing is enabled for staging and production environments.

---

## Testing

### Example cURL Commands

**Submit Encounter:**
```bash
curl -X POST https://{api-url}/api/encounters \
  -H "Content-Type: application/json" \
  -d '{
    "authorName": "John Doe",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "New York, NY"
    },
    "originalStory": "I saw a ghost in the old mansion...",
    "encounterTime": "2024-01-15T22:30:00Z",
    "imageCount": 2
  }'
```

**Get Nearby Encounters:**
```bash
curl "https://{api-url}/api/encounters?latitude=40.7128&longitude=-74.0060&radius=10&limit=50"
```

**Rate Encounter:**
```bash
curl -X POST https://{api-url}/api/encounters/{id}/rate \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "550e8400-e29b-41d4-a716-446655440000",
    "rating": 5
  }'
```

---

## Deployment

The API is deployed using AWS CDK:

```bash
# Deploy to dev environment
npm run deploy:dev

# Deploy to staging environment
npm run deploy:staging

# Deploy to production environment
npm run deploy:prod
```

After deployment, the API URL will be output in the CloudFormation stack outputs.
