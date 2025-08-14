# Project Structure

## Root Directory
- **src/**: Frontend React application
- **convex/**: Backend functions and schema
- **dist/**: Production build output
- **.kiro/**: Kiro AI assistant configuration and specs

## Frontend Structure (`src/`)

### Core Files
- **App.tsx**: Main application component with routing logic
- **main.tsx**: React application entry point
- **index.css**: Global styles and Tailwind imports

### Components (`src/components/`)
- **Main tabs**: `StreamTab.tsx`, `UploadTab.tsx`, `PlaylistsTab.tsx`, `SearchTab.tsx`
- **Core components**: `MusicApp.tsx`, `MusicWidget.tsx`, `TrackCard.tsx`
- **Auth components**: `AuthComponent.tsx`, `AutoLogin.tsx`, `AdminLogin.tsx`
- **Providers**: `AudioProvider.tsx` for global audio state
- **index.ts**: Centralized component exports

### Enhanced Components (`src/components/enhanced/`)
- Mobile-specific enhancements and responsive components
- Gesture controls and mobile navigation
- Audio visualizers and enhanced UI elements

### Feedback System (`src/components/feedback/`)
- User interaction and rating components

### Utilities (`src/utils/`)
- Helper functions and shared utilities
- Color extraction and audio processing utilities

### Hooks (`src/hooks/`)
- **useGestures.ts**: Touch and gesture handling
- **useBeatDetection.ts**: Audio analysis
- **useDeviceDetection.ts**: Device type detection

## Backend Structure (`convex/`)

### Core Files
- **schema.ts**: Database schema definitions
- **auth.ts** & **auth.config.ts**: Authentication configuration
- **router.ts**: HTTP API routes
- **http.ts**: HTTP handlers

### Data Models
- **tracks.ts**: Music track operations
- **feedback.ts**: User feedback and rating system

### Database Tables
- **tracks**: Music metadata and file references
- **feedback**: User reactions and ratings
- **feedbackStats**: Aggregated statistics
- **trendingTracks**: Calculated trending scores

## Configuration Files
- **package.json**: Dependencies and scripts
- **vite.config.ts**: Vite build configuration
- **tailwind.config.js**: Tailwind CSS customization
- **tsconfig.json**: TypeScript configuration
- **eslint.config.js**: Linting rules

## Naming Conventions
- **Components**: PascalCase (e.g., `MusicWidget.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGestures.ts`)
- **Utilities**: camelCase (e.g., `colorExtraction.ts`)
- **Database operations**: camelCase functions in kebab-case files