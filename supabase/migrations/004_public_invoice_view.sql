-- ─────────────────────────────────────────────────────────────────────────────
-- Public Invoice View — WhatsApp Link Sharing
-- Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Add public view columns to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS public_view_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS public_slug text;

-- Allow anonymous read access to invoices (slug validated client-side)
CREATE POLICY "Public can view invoice via token"
  ON public.invoices FOR SELECT
  USING (true);

-- Allow anonymous read access to business profiles
CREATE POLICY "Public can view business profile"
  ON public.business_profiles FOR SELECT
  USING (true);

-- Allow anonymous read access to invoice templates
CREATE POLICY "Public can view invoice templates"
  ON public.invoice_templates FOR SELECT
  USING (true);

-- Allow anonymous read access to clients
CREATE POLICY "Public can view clients"
  ON public.clients FOR SELECT
  USING (true);

-- Function to generate a short slug from UUID
CREATE OR REPLACE FUNCTION public.generate_invoice_slug()
RETURNS trigger language plpgsql as $$
begin
  if new.public_slug is null or new.public_slug = '' then
    new.public_slug := lower(
      substr(encode(gen_random_bytes(6), 'base64'), 1, 8)
    );
  end if;
  return new;
end;
$$;

CREATE TRIGGER invoices_auto_slug
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE PROCEDURE public.generate_invoice_slug();
