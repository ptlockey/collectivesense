# CRITICAL - Read Before Making Changes

## Deployment Architecture

**This project is NOT running locally. It is deployed to production.**

- **Frontend/Backend:** Vercel at https://collectivesense.co.uk
- **Database:** Supabase (hosted)
- **AI:** Anthropic Claude API

## Environment Variables

Environment variables are managed in **TWO places**:

| Location | Purpose |
|----------|---------|
| `.env.local` | Local development only (not used in production) |
| **Vercel Dashboard** | Production environment variables |

### To update production environment variables:
1. Go to https://vercel.com → Project → Settings → Environment Variables
2. Add/update the variable
3. **Redeploy** for changes to take effect

### Required Production Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://qdqcfgvmsdysryverfyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_SITE_URL=https://collectivesense.co.uk
ANTHROPIC_API_KEY=<anthropic-api-key>
INTERNAL_API_SECRET=<secure-random-string>
```

## Database Changes

Database schema changes require running SQL in **Supabase Dashboard**:
1. Go to https://supabase.com → Project → SQL Editor
2. Run migration SQL
3. Changes take effect immediately

Pending migrations to run:
- `supabase/migrations/002_admin_and_security_policies.sql`

## Common Mistakes to Avoid

1. **DON'T** assume `npm run dev` affects production
2. **DON'T** add secrets to `.env.local` expecting them to work in production
3. **DON'T** restart local dev server thinking it fixes production issues
4. **DO** check Vercel logs for production errors: Vercel Dashboard → Deployments → Logs
5. **DO** verify environment variables are set in Vercel before debugging

## Debugging Production Issues

1. Check Vercel deployment logs
2. Check Supabase logs (Database → Logs)
3. Verify environment variables in Vercel dashboard
4. Check if recent deployment succeeded

## Project URLs

- Production: https://collectivesense.co.uk
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
