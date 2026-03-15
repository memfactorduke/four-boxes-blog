# Professor 2A — Second Amendment Education Platform

A full-stack course website for Second Amendment education built with Next.js, Supabase, and Tailwind CSS.

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon public key** from Settings > API

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and run the contents of `supabase/schema.sql` — this creates all tables, RLS policies, and the auto-profile trigger
3. Copy and run the contents of `supabase/seed.sql` — this adds 3 sample courses with lessons

### 3. Enable Google OAuth (Optional)

1. In the Supabase dashboard, go to **Authentication > Providers**
2. Enable **Google**
3. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create a new OAuth 2.0 Client ID (Web application)
   - Add `https://your-project-id.supabase.co/auth/v1/callback` as an authorized redirect URI
4. Enter the Client ID and Client Secret in the Supabase Google provider settings

### 4. Set Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings
4. Deploy

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Database:** Supabase (Postgres with RLS)
- **Styling:** Tailwind CSS 4
- **Video:** Embedded YouTube/Vimeo
