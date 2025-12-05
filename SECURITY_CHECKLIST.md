# 🔒 Security Checklist for GitHub Upload

Before pushing to GitHub, verify all items are complete:

## ✅ API Keys Removed

- [x] Google Maps API key removed from `ghostatlas/android/app/src/main/AndroidManifest.xml`
- [x] Google Maps API key removed from `ghostatlas/ios/Runner/AppDelegate.swift`
- [x] Google Maps API key removed from `ghostatlas-web/.env.development`
- [x] Google Maps API key removed from `ghostatlas-web/.env.example`
- [x] API Gateway URL removed from `ghostatlas-web/.env.development`

## ✅ AWS Credentials

- [x] No AWS access keys in code
- [x] No AWS secret keys in code
- [x] `.env.example` files contain only placeholders
- [x] All documentation references credentials as examples only

## ✅ Configuration Files

- [x] `.gitignore` includes `.env` files
- [x] `.gitignore` includes `*.env` pattern
- [x] `.gitignore` includes secrets directories
- [x] All `.env.example` files use placeholder values

## ✅ Documentation

- [x] README.md created with setup instructions
- [x] SETUP_GUIDE.md created with detailed steps
- [x] LICENSE file added
- [x] All documentation references placeholder values

## 🔍 Files to Replace Before Running

Users must configure these files with their own credentials:

### Backend
```bash
ghostatlas-backend/.env
```
Required values:
- `AWS_REGION`
- `AWS_ACCOUNT_ID`
- `ENVIRONMENT`

### Web App
```bash
ghostatlas-web/.env.development
```
Required values:
- `VITE_API_BASE_URL` (from backend deployment)
- `VITE_GOOGLE_MAPS_API_KEY`

### Mobile App

**iOS**: `ghostatlas/ios/Runner/AppDelegate.swift`
```swift
GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY_HERE")
```

**Android**: `ghostatlas/android/app/src/main/AndroidManifest.xml`
```xml
android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"
```

**API Config**: `ghostatlas/lib/config/api_config.dart`
```dart
static const String baseUrl = 'YOUR_API_GATEWAY_URL_HERE';
```

## 🚫 Never Commit

- Actual API keys
- AWS credentials
- `.env` files (only `.env.example` is safe)
- Personal notes with sensitive info
- Database dumps with user data
- SSL certificates or private keys

## ✅ Safe to Commit

- Code files
- Configuration templates (`.env.example`)
- Documentation
- Tests
- Build configurations
- `.gitignore` files

## 🔐 GitHub Secrets (for CI/CD)

If setting up GitHub Actions, configure these secrets:

### Development
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCOUNT_ID_DEV`

### Staging
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCOUNT_ID_STAGING`

### Production
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_ACCOUNT_ID_PROD`
- `ALARM_EMAIL` (optional)

See [ghostatlas-backend/scripts/setup-github-secrets.sh](ghostatlas-backend/scripts/setup-github-secrets.sh) for automated setup.

## 📋 Pre-Push Checklist

Run these commands before pushing:

```bash
# Search for potential API keys
grep -r "AIza" --exclude-dir=node_modules --exclude-dir=.git .
grep -r "AKIA" --exclude-dir=node_modules --exclude-dir=.git .

# Search for AWS credentials
grep -r "aws_secret_access_key" --exclude-dir=node_modules --exclude-dir=.git .

# Check for .env files
find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.git/*"

# Verify .gitignore is working
git status --ignored
```

## ✅ All Clear!

All sensitive information has been removed. The repository is safe to push to GitHub.

Users will need to:
1. Get their own Google Maps API key
2. Deploy the backend to get an API Gateway URL
3. Configure all three applications with their credentials
4. Follow SETUP_GUIDE.md for complete instructions
