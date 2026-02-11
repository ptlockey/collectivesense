# Collective Sense - Startup Guide

## Live Site
- **Production:** https://collectivesense.co.uk

## Dashboards You'll Need

### 1. Vercel (Hosting & Deployments)
- **URL:** https://vercel.com/dashboard
- **What it does:** Hosts the app, shows deployment status, logs, environment variables
- **When to use:** Check deployment status, view function logs, update env vars

### 2. Supabase (Database)
- **URL:** https://supabase.com/dashboard
- **Project:** qdqcfgvmsdysryverfyj
- **What it does:** Database, authentication, RLS policies
- **When to use:** Run SQL migrations, check data, view auth users

### 3. Anthropic Console (AI API)
- **URL:** https://console.anthropic.com
- **What it does:** API keys, usage monitoring
- **When to use:** Check API usage, rotate keys, set limits

## Local Development

```bash
cd /Users/philiplockey/Documents/claude/problemsolver
npm run dev
```
Opens at: http://localhost:3000

## Deploying Changes

Changes deploy automatically when you push to GitHub:
```bash
git add .
git commit -m "Your message"
git push
```

## Environment Variables (in Vercel)

Required production env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (https://collectivesense.co.uk)
- `ANTHROPIC_API_KEY`
- `INTERNAL_API_SECRET`

## Common Tasks

### Run a SQL migration
1. Go to Supabase Dashboard → SQL Editor
2. Paste SQL from `supabase/migrations/` folder
3. Click Run

### Check deployment logs
1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Go to "Functions" tab for API logs

### Trigger synthesis manually (admin)
1. Log in as admin on the site
2. Go to /admin
3. Click "Synthesise" button on any gathering problem

## Pending SQL Migration

Run this in Supabase if not done yet:
```sql
-- From: supabase/migrations/003_public_syntheses.sql
-- Allows anyone to view completed syntheses
```

## Key Files

- `critical.md` - Must-read deployment info
- `supabase/schema.sql` - Full database schema
- `supabase/migrations/` - SQL migrations to run
- `.env.local` - Local dev env vars (not used in production)
