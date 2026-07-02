-- ─────────────────────────────────────────────────────────────────────────────
-- Purchase Orders — new table, auto-number trigger, business_profiles columns
-- ─────────────────────────────────────────────────────────────────────────────

-- Add PO numbering columns to business_profiles
ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS po_prefix text not null default 'PO',
  ADD COLUMN IF NOT EXISTS next_purchase_order_number integer not null default 1;

-- ── PURCHASE ORDERS ─────────────────────────────────────────────────────────
create table public.purchase_orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  client_id        uuid references public.clients(id) on delete set null,
  client_name      text not null default '',
  client_email     text,
  client_phone     text,
  client_address   text,
  po_number        text not null,
  status           text not null default 'draft'
                     check (status in ('draft','sent','received','cancelled')),
  order_date       date not null default current_date,
  expected_date    date,
  currency         text not null default 'MYR',
  line_items       jsonb not null default '[]',
  subtotal         numeric(12,2) not null default 0,
  tax_rate         numeric(5,2) not null default 0,
  tax_amount       numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, po_number)
);

alter table public.purchase_orders enable row level security;

create policy "Users manage own purchase_orders"
  on public.purchase_orders for all using (auth.uid() = user_id);

create index idx_purchase_orders_user_id   on public.purchase_orders(user_id);
create index idx_purchase_orders_client_id on public.purchase_orders(client_id);
create index idx_purchase_orders_status    on public.purchase_orders(status);

-- Auto-update updated_at
create trigger purchase_orders_updated_at
  before update on public.purchase_orders
  for each row execute procedure public.set_updated_at();

-- Auto-increment PO number on insert
create or replace function public.auto_purchase_order_number()
returns trigger language plpgsql security definer as $$
declare
  bp record;
  new_num integer;
begin
  if new.po_number is null or new.po_number = '' then
    select * into bp from public.business_profiles where user_id = new.user_id;
    new_num := coalesce(bp.next_purchase_order_number, 1);
    new.po_number := coalesce(bp.po_prefix, 'PO') || '-' || lpad(new_num::text, 4, '0');
    update public.business_profiles
      set next_purchase_order_number = new_num + 1
      where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger purchase_orders_auto_number
  before insert on public.purchase_orders
  for each row execute procedure public.auto_purchase_order_number();
