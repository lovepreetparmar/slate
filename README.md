# Slate

The simplest daily todo app. Open, write, complete, close.

## Quick Start

```bash
cp .env.example .env
npm install
npm run db:migrate:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Configure Google OAuth and/or SMTP in `.env` for authentication.

## Architecture

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/auth/           # Auth.js handlers
│   ├── api/tasks/          # Task CRUD + carry-over
│   ├── login/              # Auth page
│   └── page.tsx            # Today screen
├── components/             # Shared UI & providers
├── features/
│   ├── auth/               # Login components
│   └── tasks/              # Task UI components
├── hooks/                  # React Query hooks
├── lib/
│   ├── offline/            # IndexedDB + sync queue
│   ├── auth.ts             # Auth.js server config
│   └── auth.config.ts      # Edge-safe auth config
├── server/                 # Server-side business logic
├── stores/                 # Zustand UI state
└── types/                  # Shared TypeScript types
```

## Stack

- **Next.js 15** — App Router, API routes
- **Prisma 6** — SQLite (dev & prod)
- **Auth.js** — Google + email magic link
- **TanStack Query** — Server state + optimistic updates
- **Zustand** — UI state (undo, expanded notes)
- **IndexedDB** — Offline persistence
- **Framer Motion** — Task animations
- **next-pwa** — Service worker + installability

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate:dev` | Run migrations (dev) |
| `npm run db:migrate` | Deploy migrations (prod) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run unit tests |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Hostinger VPS setup with PM2, Nginx, and SSL.

## Capacitor (Future Mobile)

`capacitor.config.ts` is pre-configured. When ready:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add ios && npx cap add android
npx cap sync
```
