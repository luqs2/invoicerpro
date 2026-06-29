-- ─────────────────────────────────────────────────────────────────────────────
-- InvoicerPro — Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null default '',
  avatar_url    text,
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── BUSINESS PROFILES ───────────────────────────────────────────────────────
create table public.business_profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  name                  text not null default '',
  email                 text not null default '',
  phone                 text,
  address               text,
  logo_url              text,
  default_currency      text not null default 'MYR',
  default_tax_rate      numeric(5,2) not null default 6,
  invoice_prefix        text not null default 'INV',
  receipt_prefix        text not null default 'RCP',
  next_invoice_number   integer not null default 1,
  next_receipt_number   integer not null default 1,
  created_at            timestamptz not null default now(),
  unique (user_id)
);

alter table public.business_profiles enable row level security;

create policy "Users manage own business profile"
  on public.business_profiles for all using (auth.uid() = user_id);

-- Auto-create business profile on signup
create or replace function public.handle_new_business_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.business_profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created_business
  after insert on auth.users
  for each row execute procedure public.handle_new_business_profile();

-- ── CLIENTS ─────────────────────────────────────────────────────────────────
create table public.clients (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  address     text,
  company     text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users manage own clients"
  on public.clients for all using (auth.uid() = user_id);

create index idx_clients_user_id on public.clients(user_id);

-- ── INVOICE TEMPLATES ───────────────────────────────────────────────────────
create table public.invoice_templates (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade,  -- null = system template
  name             text not null,
  is_system        boolean not null default false,
  primary_color    text not null default '#c8f04a',
  secondary_color  text not null default '#0f0f0f',
  accent_color     text not null default '#4affd4',
  header_text_color text not null default '#ffffff',
  body_text_color   text not null default '#0f172a',
  font_family      text not null default '''Syne'', sans-serif',
  border_radius    text not null default '4px',
  logo_position    text not null default 'left',
  show_bank_details boolean not null default true,
  footer_text      text,
  created_at       timestamptz not null default now()
);

alter table public.invoice_templates enable row level security;

create policy "Users can view system or own templates"
  on public.invoice_templates for select
  using (is_system = true or auth.uid() = user_id);

create policy "Users manage own templates"
  on public.invoice_templates for all
  using (auth.uid() = user_id);

-- Seed system templates
insert into public.invoice_templates (name, is_system, primary_color, secondary_color, font_family, border_radius, footer_text) values
  ('Modern Dark',   true, '#c8f04a', '#0f0f0f', '''Syne'', sans-serif',           '4px',  'Thank you for your business!'),
  ('Corporate Blue',true, '#1a56db', '#1e3a8a', 'Georgia, serif',                 '4px',  'Payment due within 14 days.'),
  ('Warm Minimal',  true, '#e85d04', '#fff7ed', '''Syne'', sans-serif',           '8px',  'We appreciate your trust in us.'),
  ('Creative',      true, '#7c3aed', '#4c1d95', '''DM Serif Display'', serif',    '14px', 'Creating together.'),
  ('Eco Clean',     true, '#059669', '#ecfdf5', 'Georgia, serif',                 '4px',  'Thank you for choosing us.'),
  ('Bold Red',      true, '#dc2626', '#7f1d1d', '''Syne'', sans-serif',           '0px',  'Payment terms: 30 days.');

-- ── INVOICES ────────────────────────────────────────────────────────────────
create table public.invoices (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  client_id        uuid references public.clients(id) on delete set null,
  template_id      uuid references public.invoice_templates(id) on delete set null,
  invoice_number   text not null,
  status           text not null default 'draft'
                     check (status in ('draft','sent','paid','overdue','cancelled')),
  issue_date       date not null default current_date,
  due_date         date not null,
  currency         text not null default 'MYR',
  line_items       jsonb not null default '[]',
  subtotal         numeric(12,2) not null default 0,
  tax_rate         numeric(5,2) not null default 6,
  tax_amount       numeric(12,2) not null default 0,
  discount_amount  numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, invoice_number)
);

alter table public.invoices enable row level security;

create policy "Users manage own invoices"
  on public.invoices for all using (auth.uid() = user_id);

create index idx_invoices_user_id    on public.invoices(user_id);
create index idx_invoices_client_id  on public.invoices(client_id);
create index idx_invoices_status     on public.invoices(status);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();

-- Auto-increment invoice number on insert
create or replace function public.auto_invoice_number()
returns trigger language plpgsql security definer as $$
declare
  bp record;
  new_num integer;
begin
  if new.invoice_number is null or new.invoice_number = '' then
    select * into bp from public.business_profiles where user_id = new.user_id;
    new_num := coalesce(bp.next_invoice_number, 1);
    new.invoice_number := coalesce(bp.invoice_prefix, 'INV') || '-' || lpad(new_num::text, 4, '0');
    update public.business_profiles
      set next_invoice_number = new_num + 1
      where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger invoices_auto_number
  before insert on public.invoices
  for each row execute procedure public.auto_invoice_number();

-- ── RECEIPTS ────────────────────────────────────────────────────────────────
create table public.receipts (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  client_id        uuid references public.clients(id) on delete set null,
  invoice_id       uuid references public.invoices(id) on delete set null,
  template_id      uuid references public.invoice_templates(id) on delete set null,
  receipt_number   text not null,
  payment_date     date not null default current_date,
  payment_method   text not null default 'bank_transfer'
                     check (payment_method in ('cash','bank_transfer','online','card','other')),
  amount           numeric(12,2) not null,
  currency         text not null default 'MYR',
  notes            text,
  created_at       timestamptz not null default now(),
  unique (user_id, receipt_number)
);

alter table public.receipts enable row level security;

create policy "Users manage own receipts"
  on public.receipts for all using (auth.uid() = user_id);

create index idx_receipts_user_id   on public.receipts(user_id);
create index idx_receipts_client_id on public.receipts(client_id);

-- Auto-increment receipt number
create or replace function public.auto_receipt_number()
returns trigger language plpgsql security definer as $$
declare
  bp record;
  new_num integer;
begin
  if new.receipt_number is null or new.receipt_number = '' then
    select * into bp from public.business_profiles where user_id = new.user_id;
    new_num := coalesce(bp.next_receipt_number, 1);
    new.receipt_number := coalesce(bp.receipt_prefix, 'RCP') || '-' || lpad(new_num::text, 4, '0');
    update public.business_profiles
      set next_receipt_number = new_num + 1
      where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger receipts_auto_number
  before insert on public.receipts
  for each row execute procedure public.auto_receipt_number();

-- ── STORAGE BUCKET ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

create policy "Users upload own logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own logos"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own logos"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Logos are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Run this in your Supabase SQL editor
-- Adds the active_template_id column to business_profiles so the
-- selected invoice/receipt template persists across sessions.

ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS active_template_id uuid
    REFERENCES invoice_templates(id)
    ON DELETE SET NULL;

alter table public.invoice_templates
  add column if not exists header_layout text not null default 'classic'
    check (header_layout in ('classic', 'inline', 'centered', 'minimal', 'bold', 'split', 'professional'));

alter table public.invoice_templates
  add column if not exists company_font_size integer not null default 14;

alter table public.invoice_templates
  add column if not exists header_text_color text not null default '#ffffff';

alter table public.invoice_templates
  add column if not exists body_text_color text not null default '#0f172a';
