# Pratyaksha

**Cognitive Journaling Dashboard with AI-Powered Analysis**

Pratyaksha (Sanskrit: प्रत्यक्ष = "Direct Perception") is an AI-powered cognitive journaling dashboard that helps users analyze emotional patterns, psychological states, and personal growth through intelligent journaling.

**Live Demo:** https://pratyaksha-963362833537.asia-south1.run.app

---

## Features

### AI-Powered Analysis
- **4-Agent Pipeline**: Each journal entry is processed by specialized AI agents:
  - **Intent Agent** - Classifies entry type and generates title/snapshot
  - **Emotion Agent** - Analyzes mood, energy level, energy shape, sentiment
  - **Theme Agent** - Extracts themes, contradictions, and behavioral loops
  - **Insight Agent** - Generates summary, actionable insights, and next steps

### Rich Visualizations (21 Chart Components)
- Emotional Timeline with sentiment trends
- Mode Distribution (pie/bar charts)
- Energy Radar and Energy Mode Matrix
- Contradiction Flow (Sankey diagrams)
- Theme Cloud word visualization
- Daily Rhythm hourly patterns
- Activity Calendar (GitHub-style heatmap)
- Period comparison tools

### AI Companion
- AI Chat for asking questions about your journal data
- Chart Explainer that interprets visualization patterns
- Daily, Weekly, and Monthly AI-generated summaries
- Personalized next action recommendations

### Mobile & PWA
- Responsive design (mobile, tablet, desktop, iPad)
- Installable Progressive Web App
- Offline mode with local data sync
- Push notifications via Firebase Cloud Messaging
- Speech-to-text entry creation (Groq Whisper)

### Authentication & Security
- Firebase authentication (email/password, social login)
- User profiles and protected routes
- Secure API endpoints

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite 7 |
| **UI Components** | shadcn/ui, Radix UI, Tailwind CSS |
| **Visualizations** | Tremor, Recharts, D3.js |
| **State Management** | TanStack Query (React Query) |
| **Routing** | React Router 7 |
| **Backend** | Express 4, TypeScript |
| **Database** | Airtable |
| **AI Services** | OpenRouter (GPT-4o, GPT-4o-mini), Groq Whisper |
| **Authentication** | Firebase Auth |
| **Notifications** | Firebase Cloud Messaging |
| **Deployment** | Google Cloud Run (Docker) |
| **Testing** | Playwright |

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Airtable account
- OpenRouter API key
- Firebase project (for auth/notifications)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Pratyaksha/dashboard

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

```env
# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-...

# Airtable
VITE_AIRTABLE_API_KEY=your-api-key
VITE_AIRTABLE_BASE_ID=appMzFpUZLuZs9VGc
VITE_AIRTABLE_TABLE_ID=tblhKYssgHtjpmbni
AIRTABLE_API_KEY=your-api-key
AIRTABLE_BASE_ID=appMzFpUZLuZs9VGc
AIRTABLE_TABLE_ID=tblhKYssgHtjpmbni

# Firebase (optional, for auth)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Frontend only (localhost:5173)
npm run dev:client

# Backend only (localhost:3001)
npm run dev:server
```

### Build

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

---

## Project Structure

```
Pratyaksha/
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # 21 visualization components
│   │   │   ├── chat/           # AI chat features
│   │   │   ├── compare/        # Period comparison views
│   │   │   ├── layout/         # Header, Sidebar, Grid
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── ...
│   │   ├── contexts/           # React Context providers
│   │   ├── hooks/              # 17 custom hooks
│   │   ├── lib/                # Utilities and API clients
│   │   ├── pages/              # Route components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── server/
│   │   ├── agents/             # AI agent implementations
│   │   ├── routes/             # API endpoints
│   │   ├── lib/                # Server utilities
│   │   ├── types.ts            # Shared TypeScript types
│   │   └── index.ts
│   ├── tests/                  # Playwright E2E tests
│   ├── public/                 # Static assets & PWA files
│   └── docs/                   # Product documentation
```

---

## Data Model

### Entry Types (15)
Emotional, Cognitive, Family, Work, Relationship, Health, Creativity, Social, Reflection, Decision, Avoidance, Growth, Stress, Communication, Routine

### Inferred Modes (15)
Hopeful, Calm, Grounded, Compassionate, Curious, Reflective, Conflicted, Withdrawn, Overthinking, Numb, Anxious, Agitated, Disconnected, Self-critical, Defensive

### Energy Levels (10)
Very Low, Low, Moderate, Balanced, High, Elevated, Scattered, Drained, Flat, Restorative

### Energy Shapes (12)
Flat, Heavy, Chaotic, Rising, Collapsing, Expanding, Contracted, Uneven, Centered, Cyclical, Stabilized, Pulsing

### Contradictions (12)
Connection vs. Avoidance, Hope vs. Hopelessness, Anger vs. Shame, Control vs. Surrender, Confidence vs. Doubt, Independence vs. Belonging, Closeness vs. Distance, Expression vs. Silence, Self-care vs. Obligation, Ideal vs. Reality, Action vs. Fear, Growth vs. Comfort

---

## API Endpoints

### Entry Processing
- `POST /api/process-entry` - Process journal text through AI pipeline
- `PATCH /api/entry/:id` - Update entry
- `DELETE /api/entry/:id` - Delete entry
- `PATCH /api/entry/:id/bookmark` - Toggle bookmark

### Summaries
- `GET /api/daily-summary` - Generate daily insights
- `GET /api/weekly-summary` - Generate weekly insights
- `GET /api/monthly-summary` - Generate monthly insights

### AI Features
- `POST /api/explain` - AI chart explanation
- `POST /api/chat` - AI chat interaction
- `POST /api/speech` - Speech-to-text (Groq Whisper)

### Notifications
- `POST /api/notifications/register` - Register device token
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/send` - Send notification

---

## Testing

```bash
# Run all tests
npm test

# By device category
npm run test:desktop  # Chrome, Firefox, Safari (1920x1080)
npm run test:mobile   # iPhone 14/SE, Pixel 7, Galaxy S23
npm run test:ipad     # iPad Pro, iPad Mini

# Interactive UI mode
npm run test:ui

# View HTML report
npm run test:report
```

Test configuration supports:
- Desktop: Chrome, Firefox, Safari (1920x1080)
- Mobile: iPhone 14 Pro Max, iPhone SE, Pixel 7, Galaxy S23
- Tablet: iPad Pro (landscape/portrait), iPad Mini

---

## Deployment

### Google Cloud Run

```bash
# From Pratyaksha/dashboard directory
source .env

# Build and submit
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions="_VITE_AIRTABLE_API_KEY=$VITE_AIRTABLE_API_KEY,_VITE_AIRTABLE_BASE_ID=$VITE_AIRTABLE_BASE_ID,_VITE_AIRTABLE_TABLE_ID=$VITE_AIRTABLE_TABLE_ID"

# Deploy
gcloud run deploy pratyaksha \
  --image asia-south1-docker.pkg.dev/social-data-pipeline-and-push/pratyaksha/dashboard:latest \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "AIRTABLE_API_KEY=$AIRTABLE_API_KEY,AIRTABLE_BASE_ID=$AIRTABLE_BASE_ID,AIRTABLE_TABLE_ID=$AIRTABLE_TABLE_ID,OPENROUTER_API_KEY=$OPENROUTER_API_KEY"
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Main dashboard with visualizations |
| `/logs` | Journal entries list |
| `/compare` | Period comparison view |
| `/chat` | AI chat interface |
| `/profile` | User profile settings |

---

## Documentation

Additional documentation is available in `docs/`:
- `docs/product/` - Product roadmap and milestone specs
- `docs/changelogs/` - Version history
- `docs/PUSH-NOTIFICATIONS-SETUP.md` - Push notification configuration

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is private and proprietary.

---

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tremor](https://tremor.so/) - React visualization library
- [OpenRouter](https://openrouter.ai/) - AI model routing
- [Airtable](https://airtable.com/) - Database platform
- [Firebase](https://firebase.google.com/) - Authentication and messaging
