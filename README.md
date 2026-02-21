# Kura

Kura is a minimal personal coffee bean collection tracker.

Track your beans, rate them, add tasting notes, and browse your collection with a coverflow UI. Works offline with localStorage or connects to Supabase for persistent cloud storage.

## Quick Start

```bash
npm install
npm run dev
```

No environment variables required for local use — data is stored in localStorage by default.

## Features

- Coverflow UI to browse your bean collection
- Add beans with photo (JPEG, PNG, HEIC supported), name, origin, roaster, roast level, brew method, price, and rating
- Tasting notes with inline editing
- Search across all fields (name, origin, roaster, tasting notes, etc.)
- Magic link authentication (no passwords)
- localStorage mode (no setup) or Supabase mode (persistent, multi-device)

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Supabase** (auth + Postgres + Storage) — optional
- **Vitest** + **Testing Library** for tests

## Configuration

Copy `.env.example` to `.env.local` and fill in your Supabase credentials to enable cloud storage and auth:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

Without these, the app runs in localStorage mode.

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` against your project (via Supabase dashboard SQL editor or `supabase db push`)
3. Enable **Row Level Security** — the migrations handle this automatically
4. Add your Vercel deployment URL to **Authentication → URL Configuration → Redirect URLs**

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## License

MIT
