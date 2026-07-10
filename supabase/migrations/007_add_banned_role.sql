-- ─────────────────────────────────────────────────────────────────────────────
-- InvoicerPro — Add Banned Role
-- Run this in Supabase SQL Editor or via supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- Update the CHECK constraint to include 'banned' role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'super_admin', 'admin', 'viewer', 'banned'));
