# Pending Tasks

## Must Do

### 1. Run SQL Migration for Public Syntheses
**Status:** Not yet run in Supabase

Go to Supabase SQL Editor and run:
```sql
-- Allow anyone to view completed syntheses
DO $$ BEGIN
  CREATE POLICY "Anyone can view completed syntheses" ON public.syntheses
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.problems
        WHERE problems.id = syntheses.problem_id
        AND problems.status = 'complete'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anyone to view completed problems
DO $$ BEGIN
  CREATE POLICY "Anyone can view completed problems" ON public.problems
    FOR SELECT USING (status = 'complete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
```

## To Verify

### 2. Test Navigation Bug Fix
**Status:** Fix deployed, needs verification

Bug reported: "User sees list of contributions at login, clicks one, returns to list, full list isn't visible"

Fix applied: Added `dynamic = 'force-dynamic'` to homepage to prevent Next.js caching.

**Test steps:**
1. Log in and see browse submissions list
2. Click a problem to contribute
3. Navigate back to homepage
4. Verify full list is still visible

## Completed This Session

- ✅ Security audit and fixes (auth, rate limiting, input validation)
- ✅ Admin synthesis button
- ✅ Fixed RLS issue blocking synthesis (service role key)
- ✅ Successfully triggered synthesis for problem 2df516bf-afee-4ee1-b3f5-813e76d8e5c5
- ✅ Changed "Synthesis ready" → "Wisdom ready" in UI
- ✅ Added admin email display
- ✅ Created STARTUP.md and critical.md documentation
