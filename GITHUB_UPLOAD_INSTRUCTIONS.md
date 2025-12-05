# 📤 GitHub Upload Instructions

Follow these steps to upload your GhostAtlas code to GitHub.

## ✅ Pre-Upload Checklist

All sensitive information has been removed:
- ✅ Google Maps API keys replaced with placeholders
- ✅ AWS credentials removed
- ✅ API Gateway URLs replaced with placeholders
- ✅ `.gitignore` configured to exclude sensitive files

## 🚀 Upload Steps

### 1. Initialize Git Repository (if not already done)

```bash
cd /path/to/GhostAtlas
git init
```

### 2. Add All Files

```bash
git add .
```

### 3. Create Initial Commit

```bash
git commit -m "Initial commit: GhostAtlas - Horror-themed paranormal encounter platform

- Flutter mobile app (iOS/Android)
- React web application
- AWS CDK serverless backend
- AI-powered story enhancement with AWS Bedrock
- Complete documentation and setup guides"
```

### 4. Add GitHub Remote

```bash
git remote add origin https://github.com/rehaancubess/GhostAtlas.git
```

### 5. Push to GitHub

```bash
# Push to main branch
git push -u origin main

# Or if your default branch is master
git push -u origin master
```

## 🔐 After Upload - Configure Secrets

Once uploaded, users will need to configure their own credentials:

### For Local Development

1. **Backend** (`ghostatlas-backend/.env`):
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=your-account-id
   ENVIRONMENT=dev
   ```

2. **Web App** (`ghostatlas-web/.env.development`):
   ```bash
   VITE_API_BASE_URL=your-api-gateway-url
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```

3. **Mobile App**:
   - iOS: `ghostatlas/ios/Runner/AppDelegate.swift`
   - Android: `ghostatlas/android/app/src/main/AndroidManifest.xml`
   - API Config: `ghostatlas/lib/config/api_config.dart`

### For GitHub Actions CI/CD

If you want to enable automated deployments, configure these GitHub Secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

**Development:**
- `AWS_ACCESS_KEY_ID_DEV`
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCOUNT_ID_DEV`

**Staging:**
- `AWS_ACCESS_KEY_ID_STAGING`
- `AWS_SECRET_ACCESS_KEY_STAGING`
- `AWS_ACCOUNT_ID_STAGING`

**Production:**
- `AWS_ACCESS_KEY_ID_PROD`
- `AWS_SECRET_ACCESS_KEY_PROD`
- `AWS_ACCOUNT_ID_PROD`
- `ALARM_EMAIL` (optional)

Or use the automated script:
```bash
cd ghostatlas-backend
./scripts/setup-github-secrets.sh
```

## 📝 Repository Settings

### Recommended Settings

1. **Branch Protection** (for main/master):
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

2. **Description**:
   ```
   👻 GhostAtlas - A horror-themed platform for recording, sharing, and exploring real-life paranormal encounters with AI-powered enhancements
   ```

3. **Topics** (for discoverability):
   - `flutter`
   - `react`
   - `aws-cdk`
   - `serverless`
   - `aws-bedrock`
   - `horror`
   - `paranormal`
   - `mobile-app`
   - `web-app`
   - `typescript`
   - `dart`

4. **Website**: Add your deployed web app URL (if available)

## 📄 Files Included

Your repository now includes:

### Documentation
- ✅ `README.md` - Main project overview
- ✅ `SETUP_GUIDE.md` - Detailed setup instructions
- ✅ `LICENSE` - MIT License
- ✅ `SECURITY_CHECKLIST.md` - Security verification
- ✅ `.gitignore` - Ignore patterns for sensitive files

### Applications
- ✅ `ghostatlas/` - Flutter mobile app
- ✅ `ghostatlas-web/` - React web app
- ✅ `ghostatlas-backend/` - AWS CDK backend

### Configuration Templates
- ✅ `ghostatlas-backend/.env.example`
- ✅ `ghostatlas-web/.env.example`
- ✅ All API keys replaced with placeholders

## 🔍 Verification

Before pushing, verify no secrets are included:

```bash
# Search for API keys
grep -r "AIza[0-9A-Za-z_-]\{35\}" --exclude-dir=node_modules --exclude-dir=.git .

# Search for AWS keys
grep -r "AKIA[0-9A-Z]\{16\}" --exclude-dir=node_modules --exclude-dir=.git .

# Check for .env files (should only find .env.example files)
find . -name ".env" -not -path "*/node_modules/*" -not -path "*/.git/*"
```

All searches should return no results (or only example files).

## 🎉 Success!

Your code is now on GitHub! Users can:

1. Clone the repository
2. Follow `SETUP_GUIDE.md` for detailed setup
3. Configure their own API keys and credentials
4. Deploy to their own AWS accounts

## 📞 Support

If users encounter issues:
- Direct them to `SETUP_GUIDE.md` for detailed instructions
- Check `ghostatlas-backend/DEPLOYMENT_GUIDE.md` for backend deployment
- Review component-specific README files in each directory

## 🔄 Keeping Repository Updated

To push future changes:

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

## ⚠️ Important Reminders

1. **Never commit actual API keys or credentials**
2. **Always use `.env.example` files with placeholders**
3. **Keep `.gitignore` up to date**
4. **Review changes before pushing** (`git diff`)
5. **Use GitHub Secrets for CI/CD credentials**

---

**Your repository is ready to share! 🚀**
