# 👻 GhostAtlas

A horror-themed platform for recording, sharing, and exploring real-life paranormal encounters. Users can submit ghost stories with location data and images, which are enhanced with AI-generated horror narratives, illustrations, and voice narration.

![GhostAtlas Banner](https://img.shields.io/badge/Flutter-3.7+-02569B?logo=flutter)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![AWS CDK](https://img.shields.io/badge/AWS_CDK-TypeScript-FF9900?logo=amazon-aws)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

- **📍 Geospatial Discovery**: Browse paranormal encounters on an interactive map
- **📱 Cross-Platform**: Native mobile apps (iOS/Android) and responsive web interface
- **🤖 AI Enhancement**: Automatic generation of horror narratives, illustrations, and voice narration using AWS Bedrock
- **⭐ Community Engagement**: Rate encounters and verify locations by visiting them
- **👻 Ghostbuster Mode**: Special verification feature for checking in at haunted locations
- **🔐 Admin Moderation**: Review and approve/reject submissions before publication

## 🏗️ Architecture

This is a monorepo containing three main applications:

```
ghostatlas/
├── ghostatlas/              # Flutter mobile app (iOS/Android)
├── ghostatlas-backend/      # AWS CDK serverless backend
└── ghostatlas-web/          # React web application
```

### Technology Stack

- **Mobile**: Flutter 3.7+ with Dart
- **Web**: React 18 + TypeScript + Vite
- **Backend**: AWS CDK (API Gateway, Lambda, DynamoDB, S3, Bedrock, Polly)
- **AI**: AWS Bedrock (Claude 3.5 Sonnet for narratives, Titan Image for illustrations)
- **Maps**: Google Maps API

## 🚀 Quick Start

### Prerequisites

- **Flutter SDK** 3.7 or higher ([Install Flutter](https://docs.flutter.dev/get-started/install))
- **Node.js** 20+ and npm ([Install Node](https://nodejs.org/))
- **AWS CLI** configured with credentials ([Install AWS CLI](https://aws.amazon.com/cli/))
- **AWS CDK** 2.x ([Install CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html))
- **Google Maps API Key** ([Get API Key](https://console.cloud.google.com/google/maps-apis))

### 1. Clone the Repository

```bash
git clone https://github.com/rehaancubess/GhostAtlas.git
cd GhostAtlas
```

### 2. Backend Setup

```bash
cd ghostatlas-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your AWS account details
# AWS_REGION=us-east-1
# AWS_ACCOUNT_ID=your-account-id
# ENVIRONMENT=dev

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy to AWS
npm run deploy:dev
```

**Note**: After deployment, copy the API Gateway URL from the output. You'll need it for the mobile and web apps.

📖 **Detailed Backend Setup**: See [ghostatlas-backend/DEPLOYMENT_QUICKSTART.md](ghostatlas-backend/DEPLOYMENT_QUICKSTART.md)

### 3. Mobile App Setup

```bash
cd ../ghostatlas

# Install dependencies
flutter pub get

# Configure Google Maps API Key
# iOS: Edit ios/Runner/AppDelegate.swift
# Android: Edit android/app/src/main/AndroidManifest.xml
# Replace YOUR_GOOGLE_MAPS_API_KEY_HERE with your actual key

# Configure API endpoint
# Edit lib/config/api_config.dart
# Set baseUrl to your API Gateway URL from backend deployment

# Run on device/simulator
flutter run
```

📖 **Detailed Mobile Setup**: See [ghostatlas/GOOGLE_MAPS_SETUP.md](ghostatlas/GOOGLE_MAPS_SETUP.md)

### 4. Web App Setup

```bash
cd ../ghostatlas-web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.development

# Edit .env.development with your configuration
# VITE_API_BASE_URL=your-api-gateway-url
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Start development server
npm run dev
```

📖 **Detailed Web Setup**: See [ghostatlas-web/README.md](ghostatlas-web/README.md)

## 📱 Mobile App

The Flutter mobile app provides the full GhostAtlas experience with native performance.

### Key Features
- Camera integration for capturing paranormal evidence
- Real-time location tracking
- Offline support with local storage
- Push notifications (planned)
- Dark horror-themed UI with custom animations

### Development Commands

```bash
# Run on device
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

### Project Structure

```
lib/
├── config/          # API configuration
├── models/          # Data models
├── screens/         # Full-page screens
├── services/        # API and business logic
├── theme/           # Theme configuration
├── utils/           # Utilities and effects
├── widgets/         # Reusable UI components
└── main.dart        # App entry point
```

## 🌐 Web App

The React web app provides a responsive browser-based experience.

### Key Features
- Responsive design (mobile, tablet, desktop)
- Interactive map with clustering
- Real-time story browsing
- Admin panel for moderation
- Profile dashboard

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## ☁️ Backend

The AWS CDK backend provides a fully serverless infrastructure.

### Infrastructure Components

- **API Gateway**: REST API with rate limiting
- **Lambda**: Node.js 20 functions for all endpoints
- **DynamoDB**: 3 tables (Encounters, Verifications, Ratings)
- **S3 + CloudFront**: Media storage and CDN
- **SQS**: Enhancement queue for AI processing
- **Bedrock**: AI narrative and illustration generation
- **Polly**: Text-to-speech narration

### API Endpoints

See [ghostatlas-backend/API_ENDPOINTS.md](ghostatlas-backend/API_ENDPOINTS.md) for complete API documentation.

### Deployment Commands

```bash
# Deploy to development
npm run deploy:dev

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod

# View deployment diff
npm run diff:dev

# Run tests
npm test
```

## 🔑 Configuration

### Environment Variables

#### Backend (.env)
```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id
ENVIRONMENT=dev
ALARM_EMAIL=your-email@example.com  # Optional
```

#### Web App (.env.development)
```bash
VITE_API_BASE_URL=your-api-gateway-url
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

#### Mobile App (lib/config/api_config.dart)
```dart
class ApiConfig {
  static const String baseUrl = 'your-api-gateway-url';
}
```

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the key to your app's bundle ID/package name

### AWS Bedrock Setup

1. Request access to models in AWS Bedrock console:
   - Claude 3.5 Sonnet (for narratives)
   - Titan Image Generator (for illustrations)
2. Enable Polly service for text-to-speech
3. Ensure your IAM role has necessary permissions

See [ghostatlas-backend/BEDROCK_ACCESS_SETUP.md](ghostatlas-backend/BEDROCK_ACCESS_SETUP.md) for details.

## 🧪 Testing

### Backend Tests
```bash
cd ghostatlas-backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Web Tests
```bash
cd ghostatlas-web
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:ui             # Vitest UI
```

### Mobile Tests
```bash
cd ghostatlas
flutter test                # Run all tests
flutter test --coverage     # Coverage report
```

## 📚 Documentation

- **Backend**: [ghostatlas-backend/README.md](ghostatlas-backend/README.md)
- **Web App**: [ghostatlas-web/README.md](ghostatlas-web/README.md)
- **Mobile App**: [ghostatlas/README.md](ghostatlas/README.md)
- **API Specification**: [ghostatlas-backend/openapi.yaml](ghostatlas-backend/openapi.yaml)
- **Deployment Guide**: [ghostatlas-backend/DEPLOYMENT_GUIDE.md](ghostatlas-backend/DEPLOYMENT_GUIDE.md)

## 🎨 Design System

GhostAtlas uses a dark horror theme with:
- **Colors**: Pure black backgrounds with eerie green accents (#00FF41)
- **Typography**: Creepster font for headings, system fonts for body
- **Effects**: Green glow, fog overlays, atmospheric animations
- **Components**: Custom buttons, cards, and form elements

## 🔒 Security

- API keys are never committed to version control
- AWS credentials use IAM roles in production
- Rate limiting on all API endpoints
- Input validation and sanitization
- CORS configuration for web app
- Content moderation before publication

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- AWS Bedrock for AI capabilities
- Google Maps for geospatial features
- Flutter and React communities
- All contributors and testers

---

**Built with 👻 by the GhostAtlas team**
