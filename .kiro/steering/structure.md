# Project Structure

## Repository Organization

This is a monorepo containing three main applications:

```
.
├── ghostatlas/              # Flutter mobile app
├── ghostatlas-backend/      # AWS CDK backend infrastructure
└── ghostatlas-web/          # React web application
```

## Mobile App Structure (ghostatlas/)

```
ghostatlas/
├── lib/
│   ├── config/              # API configuration
│   ├── data/                # Mock data for development
│   ├── models/              # Data models (Encounter, Verification, etc.)
│   ├── screens/             # Full-page screens
│   ├── services/            # API and business logic services
│   ├── theme/               # Theme configuration (colors, typography)
│   ├── utils/               # Utilities (animations, effects, transitions)
│   ├── widgets/             # Reusable UI components
│   └── main.dart            # App entry point
├── assets/
│   ├── fonts/               # Creepster font files
│   ├── icons/               # Custom icons and graphics
│   └── onboarding/          # Onboarding screen images
├── android/                 # Android platform code
├── ios/                     # iOS platform code
└── pubspec.yaml             # Dependencies and assets
```

**Key Conventions**:
- Screens are full-page widgets in `screens/`
- Reusable components go in `widgets/`
- Services handle API calls and business logic
- Models are immutable data classes
- Theme uses centralized color and typography definitions

## Backend Structure (ghostatlas-backend/)

```
ghostatlas-backend/
├── bin/                     # CDK app entry point
├── lib/
│   ├── constructs/          # Reusable CDK constructs
│   │   ├── api-gateway.ts
│   │   ├── dynamodb-tables.ts
│   │   ├── lambda-functions.ts
│   │   ├── s3-buckets.ts
│   │   ├── sqs-queues.ts
│   │   └── cloudwatch-alarms.ts
│   ├── config.ts            # Environment configuration
│   └── ghostatlas-backend-stack.ts  # Main CDK stack
├── src/
│   ├── lambdas/
│   │   ├── api/             # API endpoint handlers
│   │   │   ├── submitEncounter.ts
│   │   │   ├── getEncounters.ts
│   │   │   ├── getEncounterById.ts
│   │   │   ├── rateEncounter.ts
│   │   │   ├── verifyLocation.ts
│   │   │   ├── adminListPending.ts
│   │   │   ├── adminApprove.ts
│   │   │   └── adminReject.ts
│   │   └── enhancement/     # AI enhancement pipeline
│   │       ├── enhancementOrchestrator.ts
│   │       ├── generateNarrative.ts
│   │       ├── generateIllustration.ts
│   │       └── generateNarration.ts
│   └── utils/               # Shared utilities
│       ├── errorHandler.ts
│       ├── validation.ts
│       ├── geospatial.ts
│       └── types.ts
├── test/
│   ├── unit/                # Unit tests (Jest)
│   └── integration/         # Integration tests
├── scripts/                 # Deployment and validation scripts
├── openapi.yaml             # API specification
└── cdk.json                 # CDK configuration
```

**Key Conventions**:
- Each Lambda function is a separate file
- Constructs are modular and reusable
- Environment config drives all infrastructure settings
- Error handling is centralized in `utils/errorHandler.ts`
- All API responses follow standardized format

## Web App Structure (ghostatlas-web/)

```
ghostatlas-web/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components (Nav, Footer)
│   │   ├── stories/         # Story browsing components
│   │   ├── map/             # Map components
│   │   ├── submit/          # Submission form components
│   │   ├── profile/         # Profile page components
│   │   ├── admin/           # Admin panel components
│   │   ├── verification/    # Verification components
│   │   └── landing/         # Landing page components
│   ├── pages/               # Page-level components
│   │   ├── LandingPage.tsx
│   │   ├── StoriesPage.tsx
│   │   ├── StoryDetailPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── SubmitPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminPanelPage.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useEncounters.ts
│   │   ├── useAdmin.ts
│   │   ├── useProfile.ts
│   │   └── useFilterState.ts
│   ├── services/            # API client
│   │   └── apiClient.ts
│   ├── stores/              # Zustand stores
│   │   ├── deviceStore.ts
│   │   ├── locationStore.ts
│   │   └── preferencesStore.ts
│   ├── types/               # TypeScript types
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── config.ts
│   │   └── geolocation.ts
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind + custom CSS
│   ├── providers/           # React context providers
│   │   └── QueryProvider.tsx
│   ├── App.tsx              # Root component with routing
│   └── main.tsx             # App entry point
├── public/                  # Static assets
└── tailwind.config.js       # Tailwind configuration
```

**Key Conventions**:
- Components are organized by feature/domain
- Pages are route-level components
- Hooks encapsulate data fetching and state logic
- Zustand stores for client-side state
- React Query for server state
- All API types match backend OpenAPI spec

## Naming Conventions

**Flutter (Dart)**:
- Files: `snake_case.dart`
- Classes: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `camelCase` or `SCREAMING_SNAKE_CASE`
- Private members: prefix with `_`

**TypeScript (Backend & Web)**:
- Files: `camelCase.ts` or `PascalCase.tsx` (React components)
- Classes/Interfaces/Types: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- React components: `PascalCase`

## Code Organization Principles

1. **Separation of Concerns**: UI, business logic, and data access are separated
2. **Reusability**: Common components and utilities are extracted
3. **Type Safety**: Strong typing throughout (Dart, TypeScript)
4. **Testing**: Unit tests alongside source code
5. **Documentation**: README files in key directories
6. **Configuration**: Environment-specific config centralized

## Import Order

**Flutter**:
1. Dart SDK imports
2. Flutter imports
3. Package imports
4. Local imports (relative)

**TypeScript**:
1. External packages
2. Internal absolute imports
3. Relative imports
4. Type imports (if separate)

## File Size Guidelines

- Keep files under 300 lines when possible
- Extract large components into smaller pieces
- Use barrel exports (`index.ts`) for cleaner imports
- Split complex screens into multiple widget/component files
