-- Migration: Allow anyone to view completed syntheses
-- Run this in your Supabase SQL editor

-- Allow anyone (including logged-out users) to view syntheses for completed problems
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

-- Also allow viewing completed problems publicly
DO $$ BEGIN
  CREATE POLICY "Anyone can view completed problems" ON public.problems
    FOR SELECT USING (status = 'complete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
