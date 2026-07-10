-- ─────────────────────────────────────────────────────────────────────────────
-- InvoicerPro — Admin Panel Migration
-- Run this in Supabase SQL Editor or via supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ADMIN ROLE ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'super_admin', 'admin', 'viewer'));

-- ── HELPER FUNCTION (security definer — bypasses RLS) ───────────────────────
-- Used by all policies to check admin role without infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = uid;
$$;

-- ── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text NOT NULL,
  body          text NOT NULL,
  type          text NOT NULL DEFAULT 'info'
                  CHECK (type IN ('info', 'warning', 'announcement')),
  target_users  text NOT NULL DEFAULT 'all',
  send_email    boolean NOT NULL DEFAULT false,
  is_read_by    jsonb NOT NULL DEFAULT '[]',
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (from previous partial run)
DROP POLICY IF EXISTS "Users view own or targeted notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins manage notifications" ON public.notifications;

CREATE POLICY "Users view own or targeted notifications"
  ON public.notifications FOR SELECT
  USING (
    target_users = 'all'
    OR auth.uid()::text = ANY(
      SELECT jsonb_array_elements_text(is_read_by)
    )
    OR public.get_user_role(auth.uid()) IN ('super_admin', 'admin')
  );

CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ── NEWS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.news (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text NOT NULL,
  content       text NOT NULL,
  category      text NOT NULL DEFAULT 'general',
  is_published  boolean NOT NULL DEFAULT false,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view published news" ON public.news;
DROP POLICY IF EXISTS "Admins manage news" ON public.news;

CREATE POLICY "Users view published news"
  ON public.news FOR SELECT
  USING (
    is_published = true
    OR public.get_user_role(auth.uid()) IN ('super_admin', 'admin')
  );

CREATE POLICY "Admins manage news"
  ON public.news FOR ALL
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin')
  );

DROP TRIGGER IF EXISTS news_updated_at ON public.news;
CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);

-- ── ADMIN BYPASS POLICIES ───────────────────────────────────────────────────

-- Invoices
DROP POLICY IF EXISTS "Admins view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Super admins manage all invoices" ON public.invoices;

CREATE POLICY "Admins view all invoices"
  ON public.invoices FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all invoices"
  ON public.invoices FOR ALL
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Receipts
DROP POLICY IF EXISTS "Admins view all receipts" ON public.receipts;
DROP POLICY IF EXISTS "Super admins manage all receipts" ON public.receipts;

CREATE POLICY "Admins view all receipts"
  ON public.receipts FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all receipts"
  ON public.receipts FOR ALL
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Purchase Orders
DROP POLICY IF EXISTS "Admins view all purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Super admins manage all purchase orders" ON public.purchase_orders;

CREATE POLICY "Admins view all purchase orders"
  ON public.purchase_orders FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all purchase orders"
  ON public.purchase_orders FOR ALL
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Clients
DROP POLICY IF EXISTS "Admins view all clients" ON public.clients;
DROP POLICY IF EXISTS "Super admins manage all clients" ON public.clients;

CREATE POLICY "Admins view all clients"
  ON public.clients FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all clients"
  ON public.clients FOR ALL
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Business Profiles
DROP POLICY IF EXISTS "Admins view all business profiles" ON public.business_profiles;
DROP POLICY IF EXISTS "Super admins manage all business profiles" ON public.business_profiles;

CREATE POLICY "Admins view all business profiles"
  ON public.business_profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all business profiles"
  ON public.business_profiles FOR ALL
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins manage all profiles" ON public.profiles;

CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'admin', 'viewer')
  );

CREATE POLICY "Super admins manage all profiles"
  ON public.profiles FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- ── SEED FIRST SUPER ADMIN ──────────────────────────────────────────────────
-- Replace the UUID below with your own user ID from auth.users
-- UPDATE public.profiles SET role = 'super_admin' WHERE id = '<your-user-id>';
