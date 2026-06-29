-- Bank accounts table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bank accounts"
  ON public.bank_accounts FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);

-- Add attn to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS attn TEXT;

-- Add quote_number and terms_text to invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS quote_number TEXT;

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS terms_text TEXT;

-- Add terms_text to business_profiles
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS terms_text TEXT;

-- Add terms_text to invoice_templates
ALTER TABLE public.invoice_templates
  ADD COLUMN IF NOT EXISTS terms_text TEXT;

-- Add line item column toggles to invoice_templates
ALTER TABLE public.invoice_templates
  ADD COLUMN IF NOT EXISTS show_line_item_date BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.invoice_templates
  ADD COLUMN IF NOT EXISTS show_line_item_vehicle_no BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.invoice_templates
  ADD COLUMN IF NOT EXISTS show_line_item_uom BOOLEAN NOT NULL DEFAULT false;
