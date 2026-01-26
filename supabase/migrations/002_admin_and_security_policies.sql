-- Migration: Add admin RLS policies and security improvements
-- Run this in your Supabase SQL editor if you already have the base schema

-- Add is_admin column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add email column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Admin policies for profiles
DO $$ BEGIN
  CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admin policies for problems
DO $$ BEGIN
  CREATE POLICY "Admins can view all problems" ON public.problems
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete problems" ON public.problems
    FOR DELETE USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow contributors to view syntheses for problems they contributed to
DO $$ BEGIN
  CREATE POLICY "Contributors can view synthesis" ON public.syntheses
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.contributions
        WHERE contributions.problem_id = syntheses.problem_id
        AND contributions.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
