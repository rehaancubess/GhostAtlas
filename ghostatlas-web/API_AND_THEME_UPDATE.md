# API Configuration and Neon Red Theme Update

## Overview
This document outlines the fixes applied to resolve API connectivity issues and enhance the web UI with neon red accents.

## API Configuration Fixes

### Issue
The web application was using an incorrect API base URL (`http://localhost:3000/api`) which doesn't match the deployed AWS API Gateway endpoint.

### Solution

#### 1. Updated Default API URL
**File**: `ghostatlas-web/src/utils/config.ts`
- Changed default `apiBaseUrl` from `http://localhost:3000/api` to `https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api`
- This ensures the app works out of the box without environment variables

#### 2. Updated Development Environment
**File**: `ghostatlas-web/.env.development`
- Updated `VITE_API_BASE_URL` to point to AWS API Gateway
- Added comments explaining the configuration

### API Endpoint Structure
The correct API structure is:
```
Base URL: https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev
API Prefix: /api

Full endpoint examples:
- GET /api/encounters?latitude=X&longitude=Y&radius=Z
- GET /api/encounters/:id
- POST /api/encounters
- POST /api/encounters/:id/rate
```

## Neon Red Theme Enhancement

### New Color Palette
Added neon red (#FF0040) as a complementary accent color to the existing neon green theme.

### CSS Variables Added
**File**: `ghostatlas-web/src/styles/index.css`

```css
--color-ghost-red: #FF0040;
--color-ghost-red-dark: #CC0033;
--shadow-red-glow: 0 0 10px rgba(255, 0, 64, 0.5);
--shadow-red-glow-md: 0 0 15px rgba(255, 0, 64, 0.5);
--shadow-red-glow-lg: 0 0 20px rgba(255, 0, 64, 0.6);
--shadow-red-glow-xl: 0 0 30px rgba(255, 0, 64, 0.7);
```

### Tailwind Configuration
**File**: `ghostatlas-web/tailwind.config.js`

Added to color palette:
- `ghost-red`: #FF0040
- `ghost-red-dark`: #CC0033

Added to box shadows:
- `red-glow`, `red-glow-md`, `red-glow-lg`, `red-glow-xl`

### Component Updates

#### 1. Button Component
**File**: `ghostatlas-web/src/components/common/Button.tsx`
- Added new `neon-red` variant
- Usage: `<Button variant="neon-red">Click Me</Button>`

#### 2. Story Card
**File**: `ghostatlas-web/src/components/stories/StoryCard.tsx`
- Hover effect now shows red glow instead of green
- Author name displays in red
- Border changes to red on hover
- Subtle red gradient overlay on hover

#### 3. Navigation Bar
**File**: `ghostatlas-web/src/components/layout/NavigationBar.tsx`
- Logo changes to red with red glow on hover
- Bottom border transitions from green to red on hover

#### 4. Hero Section
**File**: `ghostatlas-web/src/components/landing/HeroSection.tsx`
- "Atlas" in logo displays in red
- "paranormal" keyword highlighted in red
- Alternating particle colors (green and red)
- Secondary button uses red accent

### Utility Classes
New utility classes available:

**Text Glow:**
- `.text-glow-red`
- `.text-glow-red-md`
- `.text-glow-red-lg`
- `.text-glow-red-xl`

**Box Glow:**
- `.box-glow-red`
- `.box-glow-red-md`
- `.box-glow-red-lg`
- `.box-glow-red-xl`

**Borders:**
- `.border-glow-red`
- `.border-glow-red-lg`

## Testing the Changes

### 1. Test API Connectivity
```bash
cd ghostatlas-web
npm run dev
```

Navigate to `/stories` and verify encounters are loading from AWS.

### 2. Test Theme Updates
- Visit the landing page - logo should show "Atlas" in red
- Hover over story cards - should glow red
- Hover over navigation logo - should turn red
- Check button variants work correctly

## Flutter App API Configuration

The Flutter app already uses the correct AWS endpoint:

**File**: `ghostatlas/lib/config/api_config.dart`
```dart
case Environment.dev:
  return 'https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev';
```

Note: Flutter doesn't include `/api` prefix in the base URL, it's added in the service methods.

## Environment Variables

To override the default API URL, create a `.env.local` file:

```bash
# .env.local
VITE_API_BASE_URL=https://your-custom-api-url.com/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## Next Steps

1. **Test API endpoints** - Verify all CRUD operations work correctly
2. **Add more red accents** - Consider adding red to:
   - Error states
   - Warning messages
   - Featured/highlighted content
   - Loading states
3. **Performance testing** - Ensure API calls are optimized
4. **Mobile responsiveness** - Test theme on various devices

## Color Usage Guidelines

### When to Use Green
- Primary actions
- Success states
- Main branding
- Positive feedback
- Default highlights

### When to Use Red
- Secondary actions
- Attention-grabbing elements
- Hover states
- Featured content
- Warnings (when appropriate)

### Combining Green and Red
- Use sparingly to avoid visual clash
- Alternate in patterns (like particles)
- Use for emphasis on key elements
- Maintain hierarchy (green primary, red accent)
