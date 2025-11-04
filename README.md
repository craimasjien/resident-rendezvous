# Resident Rendezvous

A simple, friendly web application for coordinating family visits with a resident. Designed to help families schedule visits without calendar conflicts, logins, or confusing tooling.

## Goal

Enable quick visit scheduling from any device, even for non-technical family members, while ensuring everyone sees the same up-to-date agenda in real time. The app protects privacy while allowing lightweight collaboration through anonymous authentication.

## What It Does

- **Calendar View**: Interactive calendar to select and view dates with scheduled visits
- **Daily Agenda**: See all visits for a selected date with visitor names, times, and durations
- **Upcoming Visits**: Comprehensive view of all future scheduled visits grouped by date
- **Visit Booking**: Create new visits with visitor name, date, time, duration, and optional notes
- **Visit Management**: Edit or delete visits you've created (ownership-based)
- **Real-Time Sync**: Automatic updates across all devices when visits are added or modified
- **Offline Support**: Notifications when the network connection is lost
- **Privacy-First**: Uses anonymous authentication—no accounts or personal information required

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Router** - File-based routing with type-safe navigation
- **TanStack Query** - Data fetching and caching
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Firestore** - Real-time database for visit data
- **Firebase Anonymous Authentication** - Privacy-preserving user identification
- **Firebase Hosting** - Static site hosting

### Development Tools
- **Vitest** - Unit testing framework
- **Biome** - Linting and formatting
- **GitHub Actions** - CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js (version specified by your nvm installation)
- npm
- Firebase project with Firestore and Anonymous Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resident-rendezvous
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Firebase configuration:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_NAME=Resident Rendezvous
VITE_APP_DESCRIPTION=Visit coordination app
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

The production build will be created in the `dist/` directory.

Preview the production build locally:
```bash
npm run serve
```

### Deploying

#### Manual Deployment

Deploy to Firebase Hosting:
```bash
npm run deploy
```

This command will:
1. Build the application (`vite build`)
2. Type-check the codebase (`tsc`)
3. Deploy to Firebase Hosting (`firebase deploy`)

#### Automated Deployment

The project includes a GitHub Actions workflow (`.github/workflows/test-and-deploy.yml`) that:
- Runs tests on every push and pull request
- Automatically deploys to Firebase Hosting when changes are pushed to the `main` branch

To use automated deployment:
1. Set up the required GitHub Secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_RESIDENT_RENDEZVOUS`
2. Set up GitHub Variables:
   - `VITE_APP_NAME`
   - `VITE_APP_DESCRIPTION`

## Development

### Testing

Run the test suite:
```bash
npm test
```

### Linting and Formatting

Check for linting issues:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

Run both linting and formatting checks:
```bash
npm run check
```

### Project Structure

```
src/
├── components/          # React components
│   ├── calendar/       # Calendar-related components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── visits/         # Visit-related components
├── firebase/           # Firebase configuration and utilities
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── routes/             # TanStack Router file-based routes
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and tests
```

## Features in Detail

### Visit Management

Visits are stored in Firestore with the following structure:
- **Date**: ISO date string (YYYY-MM-DD)
- **Time**: 24-hour format (HH:mm)
- **Visitor Name**: Name of the visitor
- **Duration**: Visit duration in minutes
- **Description**: Optional notes about the visit
- **User ID**: Anonymous Firebase Auth UID for ownership tracking

### Real-Time Updates

The app uses Firestore listeners to automatically sync visit data across all connected devices. Changes appear instantly without page refreshes.

### Offline Support

When the network connection is lost, users see a notification toast. The app will automatically sync when connectivity is restored.

## License

[Add your license here]

## Contributing

[Add contribution guidelines if applicable]
