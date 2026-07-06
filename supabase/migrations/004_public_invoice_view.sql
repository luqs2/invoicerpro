-- ─────────────────────────────────────────────────────────────────────────────
-- Public Document View — WhatsApp Link Sharing
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add public_slug column to all document tables
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS public_view_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS public_slug text;

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS public_slug text;

ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS public_slug text;

-- Allow anonymous read access to all document tables
CREATE POLICY "Public can view invoice via token"
  ON public.invoices FOR SELECT USING (true);

CREATE POLICY "Public can view purchase orders"
  ON public.purchase_orders FOR SELECT USING (true);

CREATE POLICY "Public can view receipts"
  ON public.receipts FOR SELECT USING (true);

-- Allow anonymous read access to supporting tables
CREATE POLICY "Public can view business profile"
  ON public.business_profiles FOR SELECT USING (true);

CREATE POLICY "Public can view invoice templates"
  ON public.invoice_templates FOR SELECT USING (true);

CREATE POLICY "Public can view clients"
  ON public.clients FOR SELECT USING (true);

-- Auto-generate slug function
CREATE OR REPLACE FUNCTION public.generate_slug()
RETURNS trigger language plpgsql as $$
begin
  if new.public_slug is null or new.public_slug = '' then
    new.public_slug := lower(substr(encode(gen_random_bytes(6), 'base64'), 1, 8));
  end if;
  return new;
end;
$$;

-- Triggers for auto-slug on insert
CREATE TRIGGER invoices_auto_slug
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE PROCEDURE public.generate_slug();

CREATE TRIGGER purchase_orders_auto_slug
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW EXECUTE PROCEDURE public.generate_slug();

CREATE TRIGGER receipts_auto_slug
  BEFORE INSERT ON public.receipts
  FOR EACH ROW EXECUTE PROCEDURE public.generate_slug();
