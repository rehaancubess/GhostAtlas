# 🚀 GhostAtlas Setup Guide

Complete step-by-step guide to get GhostAtlas running on your machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Backend Deployment](#backend-deployment)
4. [Mobile App Configuration](#mobile-app-configuration)
5. [Web App Configuration](#web-app-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

Install the following before proceeding:

#### 1. Flutter SDK (for mobile app)
```bash
# macOS (using Homebrew)
brew install --cask flutter

# Verify installation
flutter doctor
```
📖 [Official Flutter Installation Guide](https://docs.flutter.dev/get-started/install)

#### 2. Node.js and npm (for backend and web)
```bash
# macOS (using Homebrew)
brew install node@20

# Verify installation
node --version  # Should be 20.x or higher
npm --version
```
📖 [Official Node.js Download](https://nodejs.org/)

#### 3. AWS CLI
```bash
# macOS (using Homebrew)
brew install awscli

# Configure with your credentials
aws configure
```
📖 [AWS CLI Installation Guide](https://aws.amazon.com/cli/)

#### 4. AWS CDK
```bash
# Install globally
npm install -g aws-cdk

# Verify installation
cdk --version  # Should be 2.x
```
📖 [AWS CDK Getting Started](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)

### Required Accounts & Keys

1. **AWS Account** - [Sign up here](https://aws.amazon.com/)
2. **Google Cloud Account** - [Sign up here](https://cloud.google.com/)
3. **Google Maps API Key** - [Get key here](https://console.cloud.google.com/google/maps-apis)

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/rehaancubess/GhostAtlas.git
cd GhostAtlas
```

### 2. Verify Prerequisites

```bash
# Check Flutter
flutter doctor

# Check Node.js
node --version

# Check AWS CLI
aws --version

# Check CDK
cdk --version
```

## Backend Deployment

### Step 1: Install Dependencies

```bash
cd ghostatlas-backend
npm install
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env file
nano .env
```

Set these values in `.env`:
```bash
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-12-digit-account-id
ENVIRONMENT=dev
```

**Finding your AWS Account ID:**
```bash
aws sts get-caller-identity --query Account --output text
```

### Step 3: Enable AWS Bedrock Models

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Enable these models:
   - ✅ Claude 3.5 Sonnet
   - ✅ Titan Image Generator G1
5. Click "Save changes"
6. Wait for access to be granted (usually instant)

📖 See [ghostatlas-backend/BEDROCK_ACCESS_SETUP.md](ghostatlas-backend/BEDROCK_ACCESS_SETUP.md) for details.

### Step 4: Bootstrap CDK (First Time Only)

```bash
npx cdk bootstrap aws://YOUR-ACCOUNT-ID/us-east-1
```

### Step 5: Deploy Backend

```bash
# Deploy to development environment
npm run deploy:dev
```

This will take 5-10 minutes. Watch for the output at the end:

```
✅  GhostAtlasBackendStack-dev

Outputs:
GhostAtlasBackendStack-dev.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/api
GhostAtlasBackendStack-dev.MediaBucketName = ghostatlas-media-dev-xxxxx
```

**⚠️ IMPORTANT**: Copy the `ApiEndpoint` URL - you'll need it for mobile and web apps!

### Step 6: Verify Deployment

```bash
# Test the API
curl https://your-api-endpoint/health

# Should return: {"status":"healthy"}
```

## Mobile App Configuration

### Step 1: Install Dependencies

```bash
cd ../ghostatlas
flutter pub get
```

### Step 2: Configure Google Maps API Key

#### For iOS:

Edit `ios/Runner/AppDelegate.swift`:
```swift
GMSServices.provideAPIKey("YOUR_ACTUAL_GOOGLE_MAPS_KEY")
```

#### For Android:

Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ACTUAL_GOOGLE_MAPS_KEY" />
```

### Step 3: Configure API Endpoint

Edit `lib/config/api_config.dart`:
```dart
class ApiConfig {
  static const String baseUrl = 'https://your-api-endpoint-from-backend';
}
```

### Step 4: Run the App

```bash
# List available devices
flutter devices

# Run on connected device/simulator
flutter run

# Or specify a device
flutter run -d <device-id>
```

### iOS-Specific Setup

If running on iOS, you may need to:

```bash
cd ios
pod install
cd ..
```

## Web App Configuration

### Step 1: Install Dependencies

```bash
cd ../ghostatlas-web
npm install
```

### Step 2: Configure Environment

```bash
# Copy template
cp .env.example .env.development

# Edit .env.development
nano .env.development
```

Set these values:
```bash
VITE_API_BASE_URL=https://your-api-endpoint-from-backend
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_GOOGLE_MAPS_KEY
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 4: Build for Production (Optional)

```bash
npm run build
npm run preview
```

## Verification

### Test Backend

```bash
cd ghostatlas-backend

# Run tests
npm test

# Check deployment
npm run validate:dev
```

### Test Mobile App

```bash
cd ghostatlas

# Run tests
flutter test

# Analyze code
flutter analyze
```

### Test Web App

```bash
cd ghostatlas-web

# Run tests
npm test

# Lint code
npm run lint
```

### End-to-End Test

1. **Submit an Encounter**:
   - Open mobile or web app
   - Navigate to Submit tab
   - Fill in story details
   - Add location
   - Submit

2. **Check Admin Panel**:
   - Navigate to Admin tab
   - Verify encounter appears in pending list
   - Approve the encounter

3. **Verify Enhancement**:
   - Wait 2-3 minutes for AI processing
   - Check CloudWatch logs for enhancement progress
   - Refresh the story to see AI-generated content

## Troubleshooting

### Backend Issues

#### CDK Bootstrap Failed
```bash
# Ensure AWS credentials are configured
aws configure list

# Try bootstrapping with explicit credentials
cdk bootstrap --profile your-profile-name
```

#### Deployment Failed
```bash
# Check CDK diff to see what's changing
npm run diff:dev

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name GhostAtlasBackendStack-dev
```

#### Bedrock Access Denied
- Verify models are enabled in Bedrock console
- Check IAM role has `bedrock:InvokeModel` permission
- Ensure you're in a supported region (us-east-1, us-west-2)

### Mobile App Issues

#### Flutter Doctor Issues
```bash
# Run doctor and follow recommendations
flutter doctor -v

# Accept Android licenses
flutter doctor --android-licenses
```

#### Google Maps Not Showing
- Verify API key is correct
- Check API key restrictions in Google Cloud Console
- Ensure Maps SDK is enabled for your platform
- Check console logs for error messages

#### Build Failed
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

### Web App Issues

#### CORS Errors
- Verify API endpoint URL is correct
- Check API Gateway CORS configuration
- Ensure you're using the correct environment

#### Map Not Loading
- Check Google Maps API key
- Verify Maps JavaScript API is enabled
- Check browser console for errors

### Common Issues

#### "Command not found"
- Ensure all prerequisites are installed
- Check PATH environment variable
- Restart terminal after installations

#### Port Already in Use
```bash
# Web app (port 5173)
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

#### AWS Credentials Not Found
```bash
# Reconfigure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_DEFAULT_REGION=us-east-1
```

## Next Steps

Once everything is running:

1. **Explore the App**: Try all features (submit, browse, rate, verify)
2. **Read Documentation**: Check component-specific READMEs
3. **Customize**: Modify theme, add features, adjust configuration
4. **Deploy to Production**: Follow [DEPLOYMENT_GUIDE.md](ghostatlas-backend/DEPLOYMENT_GUIDE.md)

## Getting Help

- **Backend Issues**: See [ghostatlas-backend/README.md](ghostatlas-backend/README.md)
- **Mobile Issues**: See [ghostatlas/README.md](ghostatlas/README.md)
- **Web Issues**: See [ghostatlas-web/README.md](ghostatlas-web/README.md)
- **API Reference**: See [ghostatlas-backend/openapi.yaml](ghostatlas-backend/openapi.yaml)

## Additional Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [React Documentation](https://react.dev/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Need help?** Open an issue on GitHub with:
- Your operating system
- Error messages (full output)
- Steps you've already tried
- Relevant configuration (with secrets removed)
