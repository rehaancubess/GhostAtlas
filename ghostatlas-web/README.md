# GhostAtlas Web Application

A responsive web-based horror experience platform for recording, sharing, and exploring real-life ghost encounters.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom horror theme
- **Routing**: React Router v6
- **State Management**: 
  - React Query (TanStack Query) for server state
  - Zustand for client state
- **Maps**: Google Maps JavaScript API
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library + fast-check (PBT)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.development` and configure:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Building

```bash
npm run build
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── components/       # React components
│   ├── common/      # Reusable UI components
│   ├── layout/      # Layout components
│   ├── stories/     # Story browsing components
│   ├── map/         # Map components
│   ├── submit/      # Submission form components
│   ├── profile/     # Profile components
│   └── admin/       # Admin panel components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # API services
├── stores/          # Zustand stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── styles/          # Global styles
└── test/            # Test utilities and setup
```

## Horror Theme

The application uses a dark horror aesthetic with:
- Background: Pure black (#000000) or near-black (#0A0A0A)
- Accent: Eerie green (#00FF41)
- Typography: Creepster font for headings
- Effects: Green glows, fog, vignettes, and atmospheric animations

## License

Private - All rights reserved
