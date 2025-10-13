# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with TypeScript, Tailwind CSS, and various UI components from Radix UI and shadcn/ui. The application is an AI-powered movie analysis video generator called "电影哲学家" (Movie Philosopher).

Key features include:
- Movie selection and analysis
- AI-generated video creation with customizable voice options
- User authentication and profile management
- VIP subscription system
- Payment processing
- Video generation workflow

## Architecture and Structure

### Core Components
- `/app` - Main Next.js app directory with routes and layouts
- `/components` - Reusable UI components
- `/components/ui` - shadcn/ui components
- `/contexts` - React context providers for auth, theme, and language
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and API configuration
- `/styles` - Global styles

### Authentication Flow
The application uses a JWT-based authentication system with:
- Login via phone number and password
- User profile fetching and caching in localStorage
- Protected routes with auth context
- Access token management

### Data Flow
1. API calls are made through `apiConfig` singleton which handles authentication headers
2. Authentication state is managed via `AuthProvider` context
3. Local storage is used for persisting user sessions and preferences
4. Flow data cleanup is handled automatically through `FlowCleanupWrapper`

## Development Commands

### Building and Running
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Testing
While there are no explicit test files shown, the project follows standard Next.js conventions and would typically use:
- Jest for unit tests
- React Testing Library for component tests
- Cypress for E2E tests

## Key Features and Pages

### Main Pages
- `/` - Home page with hero video and scrollable sections
- `/auth` - Authentication flow (login/signup)
- `/movie-selection` - Movie browsing and selection
- `/script-edit` - Script editing interface
- `/voice-selection` - Voice selection for video generation
- `/custom-voice` - Custom voice management
- `/payment` - Payment processing and subscription
- `/profile` - User profile and settings
- `/notifications` - Notification center
- `/vip` - VIP subscription information

### API Endpoints
The application communicates with a backend API via:
- `/auth/login` - User login
- `/auth/user` - Get user profile
- `/movies` - Movie data
- `/voices` - Voice options (default and custom)
- `/analysis/jobs` - Analysis job management
- `/video-jobs` - Video generation jobs
- `/payments` - Payment processing

## Technology Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS with shadcn/ui components
- State Management: React Context API + Zustand for flows
- UI Components: Radix UI primitives + shadcn/ui components
- Icons: Lucide React
- Fonts: Geist
- Build Tool: pnpm
- Testing: Not explicitly configured but follows typical Next.js patterns

## Important Notes

1. The application uses environment variables for API URLs (`NEXT_PUBLIC_API_URL`)
2. User data is persisted in localStorage for session management
3. The app includes a flow cleanup mechanism to automatically clear expired data
4. Authentication is required for most premium features
5. The UI is designed with mobile-first responsive principles
6. Theme support is implemented through `next-themes` and `ThemeContext`

## Common Development Tasks

1. **Adding new pages**: Create new files in `/app` directory following Next.js App Router conventions
2. **Modifying UI components**: Work in `/components` or `/components/ui` directories
3. **Adding API endpoints**: Extend the `apiConfig` singleton or create new service files
4. **Managing state**: Use React Context for global state or Zustand for complex flows
5. **Styling**: Leverage Tailwind CSS classes with shadcn/ui component variants