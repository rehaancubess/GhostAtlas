# GhostAtlas Web Application - Spec Summary

## Overview

This spec defines a complete web application version of GhostAtlas that mirrors the Flutter mobile app's functionality while optimizing for browser-based experiences. The web app shares the same AWS Backend API, ensuring data consistency across platforms.

## Key Features

- **Horror-Themed UI**: Dark design with eerie green accents (#00FF41), Creepster font, atmospheric effects
- **Story Browsing**: Card-based grid with infinite scroll, sorting, and filtering
- **Interactive Map**: Google Maps integration with custom ghost markers and hotspots
- **Encounter Submission**: Multi-step form with location picker, image upload, and AI enhancement
- **Location Verification**: Browser geolocation-based check-ins with spookiness ratings
- **Community Ratings**: 5-star rating system with duplicate prevention via device ID
- **Admin Panel**: Hidden interface at /admin/panel for content moderation
- **Responsive Design**: Optimized for desktop, tablet, and mobile browsers
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **State Management**: React Query (server state) + Zustand (client state)
- **Styling**: Tailwind CSS with custom horror theme
- **Animations**: Framer Motion
- **Maps**: Google Maps JavaScript API
- **Testing**: Vitest + React Testing Library + fast-check (property-based)
- **Deployment**: Vercel / Netlify / AWS S3+CloudFront

## Project Structure

```
ghostatlas-web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components (Landing, Stories, Map, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API client and services
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helper functions
│   └── styles/         # Global styles and Tailwind config
├── public/             # Static assets (fonts, icons)
└── tests/              # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Maps API key
- AWS Backend API URL (from ghostatlas-backend deployment)

### Setup Steps

1. **Initialize Project** (Task 1)
   ```bash
   npm create vite@latest ghostatlas-web -- --template react-ts
   cd ghostatlas-web
   npm install
   ```

2. **Install Dependencies**
   ```bash
   npm install react-router-dom @tanstack/react-query zustand
   npm install framer-motion @react-google-maps/api
   npm install axios react-dropzone
   npm install -D tailwindcss postcss autoprefixer
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D fast-check
   ```

3. **Configure Environment**
   ```bash
   # Create .env.local
   VITE_API_BASE_URL=https://your-api-url.com/api
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Set Up Tailwind** (Task 2)
   ```bash
   npx tailwindcss init -p
   ```
   Configure with horror theme colors and Creepster font

5. **Start Development**
   ```bash
   npm run dev
   ```

## Implementation Order

Follow the tasks in `tasks.md` sequentially:

1. **Phase 1: Foundation** (Tasks 1-6)
   - Set up project structure and theme
   - Build common components
   - Implement API service layer
   - Create layout components

2. **Phase 2: Core Features** (Tasks 7-15)
   - Build landing page
   - Implement story browsing and detail views
   - Create interactive map
   - Build submission form
   - Add verification feature
   - Implement search and filters
   - Create profile and admin panels

3. **Phase 3: Polish** (Tasks 16-22)
   - Make responsive
   - Add accessibility features
   - Implement animations
   - Add social sharing
   - Optimize performance
   - Handle errors gracefully

4. **Phase 4: Deploy** (Tasks 23-25)
   - Set up CI/CD pipeline
   - Deploy to hosting platform
   - Add monitoring and analytics
   - Final testing and documentation

## API Integration

The web app uses the same AWS Backend API as the mobile app. Key endpoints:

- `GET /api/encounters` - Fetch encounters with geospatial filtering
- `POST /api/encounters` - Submit new encounter
- `POST /api/encounters/:id/rate` - Rate an encounter
- `POST /api/encounters/:id/verify` - Verify location
- `GET /admin/encounters` - List pending encounters (admin)
- `PUT /admin/encounters/:id/approve` - Approve encounter (admin)

See `ghostatlas-backend/API_ENDPOINTS.md` for full API documentation.

## Design System

### Colors

- **Background**: `#000000` (pure black) or `#0A0A0A` (near-black)
- **Accent**: `#00FF41` (eerie green)
- **Text Primary**: `#FFFFFF` (white)
- **Text Secondary**: `#E0E0E0` (light gray)
- **Text Muted**: `#666666` (gray)
- **Error**: `#FF4444` (red)

### Typography

- **Headings**: Creepster (Google Fonts)
- **Body**: System sans-serif stack
- **Minimum Size**: 14px for body text

### Effects

- **Green Glow**: `box-shadow: 0 0 20px rgba(0, 255, 65, 0.3)`
- **Vignette**: Radial gradient overlay on images
- **Transitions**: 200-400ms duration
- **Hover Scale**: `transform: scale(1.02)`

## Testing Strategy

### Unit Tests (Optional)
- Test individual components and functions
- Use Vitest + React Testing Library
- Run with: `npm test`

### Property-Based Tests (Optional)
- Test correctness properties with fast-check
- 12 properties defined in design document
- Run 100 iterations per property

### E2E Tests (Optional)
- Test critical user flows
- Use Playwright or Cypress
- Run in multiple browsers

### Accessibility Tests (Optional)
- Use @axe-core/react for automated checks
- Manual keyboard navigation testing
- Screen reader compatibility testing

## Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push to main

### Alternative: AWS S3 + CloudFront

1. Build production bundle: `npm run build`
2. Upload `dist/` to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain with Route 53

### Alternative: Netlify

1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy automatically on push

## Monitoring

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4
- **Performance**: Lighthouse CI
- **Uptime**: Pingdom or UptimeRobot

## Next Steps

1. Review the requirements document (`requirements.md`)
2. Review the design document (`design.md`)
3. Start implementing tasks from `tasks.md`
4. Begin with Task 1: Set up project structure

## Support

- Mobile App Code: `ghostatlas/` directory
- Backend API: `ghostatlas-backend/` directory
- API Documentation: `ghostatlas-backend/API_ENDPOINTS.md`
- Backend Deployment: `ghostatlas-backend/DEPLOYMENT_GUIDE.md`

## Notes

- The web app shares the same backend as the mobile app
- Device IDs are stored in browser localStorage (not cookies)
- Admin panel is accessible at `/admin/panel` (no authentication required)
- All images are uploaded directly to S3 using presigned URLs
- AI enhancement is triggered after image upload completes
- Geolocation requires HTTPS in production browsers
