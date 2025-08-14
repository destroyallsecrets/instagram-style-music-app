# Technology Stack

## Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for animations and transitions
- **Lucide React** for icons

## Backend
- **Convex** for real-time database and backend functions
- **Convex Auth** for authentication (anonymous auth enabled)
- **File Storage** via Convex for audio files and cover art

## UI Components
- **Radix UI** primitives (Dialog, Dropdown, Progress, Slider, Tooltip)
- **Headless UI** for accessible components
- **React Hot Toast** and **Sonner** for notifications

## Development Tools
- **ESLint** with TypeScript support
- **Prettier** for code formatting
- **PostCSS** with Autoprefixer
- **npm-run-all** for parallel script execution

## Common Commands

### Development
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only Vite dev server
npm run dev:backend      # Start only Convex dev server
```

### Build & Deploy
```bash
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint           # Type check and build validation
```

## Architecture Patterns
- **Component-based architecture** with TypeScript
- **Custom hooks** for shared logic (gestures, device detection, beat detection)
- **Context providers** for global state (AudioProvider)
- **Real-time subscriptions** via Convex queries
- **Glass-morphism design system** with consistent styling