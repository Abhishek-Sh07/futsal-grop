# Futsal Hisab ⚽

A modern mobile-first Progressive Web App (PWA) for tracking your futsal team's monthly contributions, expenses, and balance.

## Features

### Admin / Treasurer
- Dashboard with real-time collection progress
- Player management (add, edit, deactivate)
- Monthly payment tracking (Paid / Unpaid / Partial / Overpaid)
- Expense tracking with category breakdown
- Reports with CSV export
- WhatsApp reminder messages
- Announcements for the team

### Player
- Personal payment status dashboard
- Full payment history
- Team fund summary
- Announcements from admin

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Type**: Progressive Web App (PWA)
- **Currency**: NPR (Nepali Rupee)

## Quick Start

### 1. Clone and install

```bash
cd futsal-hisab
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → Run `supabase/schema.sql`
3. Then run `supabase/seed.sql` for demo data

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase → Settings → API.

### 4. Create Admin User

1. In Supabase → Authentication → Users → **Add User**
2. Enter email and password for the admin
3. The user profile is auto-created as `player` role
4. To make them admin, run in SQL editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@yourteam.com';
   ```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Install as PWA

1. Open the app in Chrome/Safari on mobile
2. Tap the browser menu → **Add to Home Screen**
3. Tap **Add** — the app installs like a native app

Or on Android Chrome: look for the **Install** prompt that appears automatically.

## Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── admin/              # Admin pages (protected)
│   │   ├── page.tsx        # Dashboard
│   │   ├── players/        # Player management
│   │   ├── payments/       # Monthly collections
│   │   ├── expenses/       # Expense tracking
│   │   ├── reports/        # Reports + CSV export
│   │   ├── announcements/  # Team announcements
│   │   └── settings/       # Admin profile
│   └── player/             # Player pages (protected)
│       ├── page.tsx        # Player dashboard
│       ├── payments/       # Payment history
│       ├── team/           # Team summary
│       ├── announcements/  # View announcements
│       └── profile/        # Profile + logout
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Navigation + headers
│   ├── admin/              # Admin-specific components
│   └── player/             # Player-specific components
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   └── utils/              # Formatting + utilities
└── types/                  # TypeScript types
```

## Database Schema

See `supabase/schema.sql` for full schema including:
- `profiles` — user roles and info
- `players` — team player records
- `payments` — monthly payment tracking
- `payment_logs` — audit trail
- `expenses` — team expenses
- `announcements` — team updates
- `transactions` — activity ledger

Row Level Security (RLS) is enabled — admins see all data, players only see their own.

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

## PWA Icons

Replace the placeholder icons in `public/icons/` with real PNGs:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px
- `apple-touch-icon.png` — 180×180px

Use `public/icons/icon.svg` as the source.

## Default Monthly Fee

NPR 1,000 per player per month. Change in `players.monthly_fee` per player or update the default in `schema.sql`.
