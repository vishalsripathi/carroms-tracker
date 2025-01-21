# Carrom Tournament Tracker

A web application to manage carrom matches, track player statistics, and maintain game history for a group of players.

## Features

- Player management and availability tracking
- Random team generation
- Match scheduling and history
- Statistics and analytics
- Google Authentication
- Real-time updates with Firebase

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Firebase (Authentication, Firestore)
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

## Setup and Installation

1. Clone the repository
```bash
git clone [repository-url]
cd carrom-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firebase Setup and Commands

### Initial Firebase Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

During initialization, select:
- Firestore
- Hosting (optional)
- Emulators (optional)

### Firebase Deployment Commands
```bash
# Deploy everything
firebase deploy

# Deploy only specific features
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only hosting

# View deployment status
firebase deploy --debug
```

### Firebase Database Commands
```bash
# Export Firestore data
firebase firestore:export ./path/to/export

# Import Firestore data
firebase firestore:import ./path/to/import
```

### Firebase Emulator Commands
```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth

# Clear data and restart
firebase emulators:start --clear

# Export emulator data
firebase emulators:export ./path/to/export

# Start with imported data
firebase emulators:start --import ./path/to/export
```

### Firebase Project Management
```bash
# List projects
firebase projects:list

# Switch project
firebase use [PROJECT_ID]

# Get current project details
firebase projects:list --debug

# Create new project
firebase projects:create [PROJECT_ID]
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure
```
src/
├── components/
│   ├── auth/
│   ├── layout/
│   ├── matches/
│   ├── players/
│   └── stats/
├── hooks/
├── store/
├── services/
├── types/
└── pages/
```

## Firebase Collections

### Players Collection
```typescript
interface Player {
  id: string;
  name: string;
  email: string;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winPercentage: number;
  };
  availability: {
    status: 'available' | 'unavailable';
    lastUpdated: Timestamp;
  };
}
```

### Matches Collection
```typescript
interface Match {
  id: string;
  date: Timestamp;
  teams: {
    team1: {
      players: string[];
      score: number;
    };
    team2: {
      players: string[];
      score: number;
    };
  };
  status: 'scheduled' | 'in_progress' | 'completed';
  winner: string | null;
}
```

## Deployment

1. Build the project
```bash
npm run build
```

2. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Firebase Issues

1. **Firebase Initialization Failed**
```bash
# Check Firebase config
firebase apps:list

# Verify environment variables
firebase functions:config:get

# Clear Firebase cache
firebase logout
firebase login
```

2. **Firestore Permission Denied**
- Check Firestore rules
- Verify authentication state
- Check security rules deployment

3. **Emulator Connection Issues**
```bash
# Kill existing emulator processes
lsof -i:8080  # Check ports
kill -9 PID   # Kill process

# Clear emulator data
firebase emulators:start --clear
```

## Original Vite Documentation

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### ESLint Configuration

For production applications, enable type-aware lint rules:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details