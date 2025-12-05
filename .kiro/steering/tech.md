# Technology Stack

## Mobile App (ghostatlas/)

**Framework**: Flutter 3.7+ with Dart SDK

**Key Dependencies**:
- `google_maps_flutter` - Map integration
- `geolocator` - Location services
- `geocoding` - Address lookup
- `image_picker` - Camera/gallery access
- `flutter_image_compress` - Image optimization
- `http` - API requests
- `audioplayers` - Audio playback
- `shared_preferences` - Local storage
- `google_fonts` - Typography (Creepster font)
- `speech_to_text` - Voice narration

**Common Commands**:
```bash
# Install dependencies
flutter pub get

# Run on device/simulator
flutter run

# Build for iOS
flutter build ios

# Build for Android
flutter build apk
flutter build appbundle

# Run tests
flutter test

# Analyze code
flutter analyze
```

**Platform Setup**:
- iOS: Requires Xcode, CocoaPods, Google Maps API key in `ios/Runner/AppDelegate.swift`
- Android: Requires Android Studio, Google Maps API key in `android/app/src/main/AndroidManifest.xml`

## Web App (ghostatlas-web/)

**Framework**: React 18 + TypeScript + Vite

**Key Dependencies**:
- `react-router-dom` - Routing
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management
- `axios` - HTTP client
- `@react-google-maps/api` - Google Maps
- `framer-motion` - Animations
- `tailwindcss` - Styling

**Testing**: Vitest + React Testing Library + fast-check (property-based testing)

**Common Commands**:
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
npm run test:watch
npm run test:ui

# Lint and format
npm run lint
npm run format
```

## Backend (ghostatlas-backend/)

**Framework**: AWS CDK (TypeScript) + Node.js 20

**Infrastructure**:
- API Gateway (REST API with rate limiting)
- Lambda (Node.js 20 runtime)
- DynamoDB (3 tables: Encounters, Verifications, Ratings)
- S3 + CloudFront (media storage and CDN)
- SQS (enhancement queue)
- Bedrock (AI narrative and illustration generation)
- Polly (text-to-speech narration)

**Key Dependencies**:
- `aws-cdk-lib` - Infrastructure as code
- `@aws-sdk/client-*` - AWS service clients
- `ulid` - Unique ID generation

**Testing**: Jest + fast-check (property-based testing)

**Common Commands**:
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Synthesize CloudFormation
npm run synth

# Deploy to environments
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod

# View deployment diff
npm run diff:dev
npm run diff:staging
npm run diff:prod

# Validate before deployment
npm run validate:dev
npm run validate:staging
npm run validate:prod

# Destroy stack (use with caution)
npm run destroy
```

**Environment Configuration**:
- Environments: `dev`, `staging`, `prod`
- Config file: `lib/config.ts`
- Context: `--context environment=<env>`

## API Documentation

OpenAPI 3.0.3 specification: `ghostatlas-backend/openapi.yaml`

## Development Tools

- **Version Control**: Git
- **CI/CD**: GitHub Actions (auto-deploy on branch push)
- **Monitoring**: CloudWatch Logs, X-Ray (staging/prod)
- **Code Quality**: ESLint, Prettier, Flutter Lints

## Environment Variables

**Mobile App**: Configure in `lib/config/api_config.dart`

**Web App**: `.env.development` file
```
VITE_API_BASE_URL=<api-url>
VITE_GOOGLE_MAPS_API_KEY=<key>
```

**Backend**: Set via CDK context and AWS Systems Manager Parameter Store
