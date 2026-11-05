# Soundwave — Music Streaming Platform

A bilingual music streaming web application for listeners, artists, moderators, and administrators. The API is maintained in [music-streaming-api_nest](https://github.com/saeed-esmaeilzadeh-anari/music-streaming-api_nest).

## Technology

- Next.js App Router, React, TypeScript
- Tailwind CSS and shadcn/ui components
- TanStack Query for server state
- Zustand for client and player state
- Axios API client
- React Hook Form and Zod
- Local IRANSans font assets and English system typography

## Application areas

- Registration, login, protected routes, and token refresh
- Music discovery, track, artist, album, and playlist pages
- Global HTML5 audio player and queue
- Artist profile onboarding and music upload flow
- Favorites, playlists, listening history, comments, and notifications
- Subscription and payment screens
- Admin dashboard for catalog and account management
- Persian/English translations with RTL/LTR layout support

The feature list describes the application surfaces in the repository. Live behavior depends on the API and external services configured for the environment.

## Requirements and setup

- Node.js 22+
- npm
- A running NestJS API and its required PostgreSQL, Redis, and storage services

```bash
npm ci
```

Copy `.env.example` to `.env.local` and set the API URL.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Commands

```bash
npm run dev
npm run type-check
npm run lint
npm run build
npm run start
```

## Routes

The application uses Next.js route groups:

- `(auth)`: login, registration, password recovery, logout
- `(app)`: home, search, artist, album, track, playlist, library, upload, profile, settings, history, notifications, subscription
- `(admin)`: dashboard and catalog/account administration

Route groups do not appear in public URLs. Access control must also be enforced by the API.

## Localization

Persian (`fa`) is the default language and uses RTL layout. English (`en`) uses LTR layout. Translation dictionaries are stored in `src/lib/i18n/messages/`; keep both JSON dictionaries structurally identical. Locale preference is persisted with the `NEXT_LOCALE` cookie.

## API and media

Set `NEXT_PUBLIC_API_URL` to the public API base URL, including the API prefix (for example, `/api/v1`). Audio and image delivery depends on the backend's configured object storage.

A successful frontend build does not prove that PostgreSQL, Redis, Stripe, email, or object-storage credentials are configured, nor that live playback works. Verify the full upload-to-playback flow in the deployed environment.

## Deployment

Deploy the frontend independently from the API. Configure `NEXT_PUBLIC_API_URL` in the deployment environment and use HTTPS for both services in production. Add remote image hosts to `next.config.ts` when changing storage providers.

## CI

GitHub Actions runs dependency installation, TypeScript checking, lint, and a production build on pushes to the finalization branch and pull requests targeting `master`.
