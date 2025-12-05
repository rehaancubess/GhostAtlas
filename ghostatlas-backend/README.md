# GhostAtlas AWS Backend

Serverless AWS infrastructure for the GhostAtlas mobile application, providing API endpoints for paranormal encounter submissions, AI-powered content enhancement, and geospatial queries.

## Architecture

The backend uses AWS CDK to define infrastructure as code with the following components:

- **API Gateway**: REST API with rate limiting and CORS
- **Lambda Functions**: Serverless compute for API handlers and AI enhancement pipeline
- **DynamoDB**: NoSQL database for encounters, verifications, and ratings
- **S3 + CloudFront**: Media storage and CDN delivery
- **SQS**: Message queue for asynchronous AI enhancement
- **Bedrock**: AI services for narrative generation and illustrations
- **Polly**: Text-to-speech for voice narration

## Project Structure

```
ghostatlas-backend/
├── bin/                          # CDK app entry point
│   └── ghostatlas-backend.ts
├── lib/                          # CDK stack and constructs
│   ├── ghostatlas-backend-stack.ts
│   ├── config.ts                 # Environment-specific configuration
│   └── constructs/               # Reusable CDK constructs
├── src/                          # Lambda function source code
│   ├── lambdas/
│   │   ├── api/                  # API handler functions
│   │   └── enhancement/          # AI enhancement pipeline
│   └── utils/                    # Shared utilities
└── test/                         # Tests
    ├── unit/                     # Unit tests
    └── integration/              # Integration tests
```

## Prerequisites

- Node.js 20.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK CLI: `npm install -g aws-cdk`

## Installation

```bash
npm install
```

## Configuration

The backend supports three environments: `dev`, `staging`, and `prod`. Configuration is managed in `lib/config.ts`.

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

### Synthesize CloudFormation

```bash
npm run synth            # Default (dev)
cdk synth --context environment=staging
```

## Deployment

### Documentation

Complete deployment documentation is available:
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide (recommended)
- **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - 5-minute quick start
- **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** - Configuration details
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

### Quick Start

```bash
# Validate environment before deployment
npm run validate:dev

# Deploy to development
npm run deploy:dev
```

### Environment-Specific Deployment

```bash
# Development (automatic from develop branch)
npm run deploy:dev

# Staging (requires manual approval in GitHub)
npm run deploy:staging

# Production (requires manual approval in GitHub)
npm run deploy:prod
```

### Pre-Deployment Validation

```bash
# Validate specific environment
npm run validate:dev
npm run validate:staging
npm run validate:prod

# View what will change
npm run diff:dev
npm run diff:staging
npm run diff:prod
```

### CI/CD Pipeline

The project uses GitHub Actions for automated deployment:
- **Development**: Auto-deploys on push to `develop` branch
- **Staging**: Auto-deploys on push to `main` branch (requires approval)
- **Production**: Auto-deploys after staging (requires approval)

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Manual Deployment

```bash
# Deploy with validation
npm run validate:prod && npm run deploy:prod

# View differences before deploying
npm run diff:prod

# Destroy stack (use with caution!)
npm run destroy
```

## Environment Variables

Lambda functions use the following environment variables (automatically set by CDK):

- `ENCOUNTERS_TABLE`: DynamoDB Encounters table name
- `VERIFICATIONS_TABLE`: DynamoDB Verifications table name
- `RATINGS_TABLE`: DynamoDB Ratings table name
- `MEDIA_BUCKET`: S3 media bucket name
- `ENHANCEMENT_QUEUE_URL`: SQS enhancement queue URL
- `BEDROCK_REGION`: AWS region for Bedrock services

## API Documentation

### OpenAPI Specification

Complete API documentation is available in OpenAPI 3.0.3 format:
- **File**: [openapi.yaml](./openapi.yaml)
- **Interactive Docs**: Generate with `npx swagger-ui-watcher openapi.yaml`

### API Endpoints

#### Public Endpoints

- `POST /api/encounters` - Submit new encounter
- `GET /api/encounters` - List approved encounters (geospatial)
- `GET /api/encounters/{id}` - Get encounter details
- `POST /api/encounters/{id}/rate` - Rate an encounter
- `POST /api/encounters/{id}/verify` - Verify encounter location

#### Admin Endpoints

- `GET /api/admin/encounters` - List pending encounters
- `PUT /api/admin/encounters/{id}/approve` - Approve encounter
- `PUT /api/admin/encounters/{id}/reject` - Reject encounter

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for quick reference or [openapi.yaml](./openapi.yaml) for complete specification.

## Testing Strategy

The project uses Jest for unit testing and fast-check for property-based testing:

- **Unit Tests**: Test individual functions and modules
- **Property-Based Tests**: Verify correctness properties across random inputs
- **Integration Tests**: Test end-to-end workflows

## License

MIT
