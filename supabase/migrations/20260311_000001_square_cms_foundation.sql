begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  email text unique,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'ops')),
  is_active boolean not null default true,
  created_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'published' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  block_key text not null,
  block_type text not null default 'json',
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  updated_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, block_key)
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_type text not null default 'json',
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'cms',
  storage_path text not null unique,
  public_url text,
  alt_text text,
  caption text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.square_catalog_items (
  id uuid primary key default gen_random_uuid(),
  square_item_id text not null,
  square_variation_id text not null unique,
  name text not null,
  description text,
  category text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  is_archived boolean not null default false,
  image_url text,
  raw jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_square_catalog_items_square_item_id
  on public.square_catalog_items (square_item_id);
create index if not exists idx_square_catalog_items_category
  on public.square_catalog_items (category);

create table if not exists public.product_overrides (
  id uuid primary key default gen_random_uuid(),
  square_item_id text not null,
  square_variation_id text,
  slug text unique,
  display_name text,
  display_description text,
  image_url text,
  is_featured boolean not null default false,
  feature_rank integer not null default 0,
  category_override text,
  tags text[] not null default '{}',
  is_visible boolean not null default true,
  custom_badge text,
  updated_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_product_overrides_item_variation
  on public.product_overrides (square_item_id, coalesce(square_variation_id, ''));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_order_id text not null unique default (
    'PB-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  ),
  square_order_id text unique,
  square_payment_id text unique,
  square_checkout_id text,
  square_location_id text not null,
  location_slug text not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'in_prep', 'ready', 'picked_up', 'cancelled', 'refunded')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'USD',
  pickup_date date not null,
  pickup_time time not null,
  pickup_window_label text,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  confirmed_at timestamptz,
  ready_at timestamptz,
  picked_up_at timestamptz,
  canceled_at timestamptz
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_square_order_id on public.orders (square_order_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_pickup_date_time on public.orders (pickup_date, pickup_time);
create index if not exists idx_orders_location_slug on public.orders (location_slug);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  square_catalog_object_id text,
  square_catalog_version bigint,
  item_key text,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  modifiers jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);

create table if not exists public.pickup_slots (
  id uuid primary key default gen_random_uuid(),
  location_slug text not null,
  square_location_id text not null,
  slot_date date not null,
  slot_time time not null,
  capacity integer not null default 12 check (capacity >= 0),
  reserved_count integer not null default 0 check (reserved_count >= 0 and reserved_count <= capacity),
  lead_time_minutes integer not null default 60 check (lead_time_minutes >= 0),
  is_blackout boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_slug, slot_date, slot_time)
);

create index if not exists idx_pickup_slots_date on public.pickup_slots (slot_date, slot_time);
create index if not exists idx_pickup_slots_location on public.pickup_slots (location_slug);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'square',
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed', 'ignored')),
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_webhook_events_provider_status on public.webhook_events (provider, status);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  square_payment_id text,
  square_refund_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  reason text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_refunds_order_id on public.refunds (order_id);

drop trigger if exists set_admin_users_updated_at on public.admin_users;
create trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists set_content_blocks_updated_at on public.content_blocks;
create trigger set_content_blocks_updated_at
before update on public.content_blocks
for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_media_assets_updated_at on public.media_assets;
create trigger set_media_assets_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists set_square_catalog_items_updated_at on public.square_catalog_items;
create trigger set_square_catalog_items_updated_at
before update on public.square_catalog_items
for each row execute function public.set_updated_at();

drop trigger if exists set_product_overrides_updated_at on public.product_overrides;
create trigger set_product_overrides_updated_at
before update on public.product_overrides
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_pickup_slots_updated_at on public.pickup_slots;
create trigger set_pickup_slots_updated_at
before update on public.pickup_slots
for each row execute function public.set_updated_at();

drop trigger if exists set_refunds_updated_at on public.refunds;
create trigger set_refunds_updated_at
before update on public.refunds
for each row execute function public.set_updated_at();

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where auth_user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.reserve_pickup_slot(
  p_location_slug text,
  p_square_location_id text,
  p_slot_date date,
  p_slot_time time,
  p_default_capacity integer default 12,
  p_lead_time_minutes integer default 60
)
returns table(
  success boolean,
  message text,
  slot_id uuid,
  reserved_count integer,
  capacity integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot public.pickup_slots%rowtype;
begin
  insert into public.pickup_slots (
    location_slug,
    square_location_id,
    slot_date,
    slot_time,
    capacity,
    reserved_count,
    lead_time_minutes
  )
  values (
    p_location_slug,
    p_square_location_id,
    p_slot_date,
    p_slot_time,
    greatest(p_default_capacity, 0),
    0,
    greatest(p_lead_time_minutes, 0)
  )
  on conflict (location_slug, slot_date, slot_time) do nothing;

  update public.pickup_slots
  set
    reserved_count = reserved_count + 1,
    updated_at = now()
  where location_slug = p_location_slug
    and slot_date = p_slot_date
    and slot_time = p_slot_time
    and is_blackout = false
    and reserved_count < capacity
  returning * into v_slot;

  if found then
    return query select true, 'reserved', v_slot.id, v_slot.reserved_count, v_slot.capacity;
    return;
  end if;

  select * into v_slot
  from public.pickup_slots
  where location_slug = p_location_slug
    and slot_date = p_slot_date
    and slot_time = p_slot_time;

  if v_slot.id is null then
    return query select false, 'slot_unavailable', null::uuid, 0, p_default_capacity;
    return;
  end if;

  if v_slot.is_blackout then
    return query select false, 'slot_blackout', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  elsif v_slot.reserved_count >= v_slot.capacity then
    return query select false, 'slot_full', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  else
    return query select false, 'slot_unavailable', v_slot.id, v_slot.reserved_count, v_slot.capacity;
  end if;
end;
$$;

create or replace function public.release_pickup_slot(
  p_location_slug text,
  p_slot_date date,
  p_slot_time time
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pickup_slots
  set
    reserved_count = greatest(reserved_count - 1, 0),
    updated_at = now()
  where location_slug = p_location_slug
    and slot_date = p_slot_date
    and slot_time = p_slot_time
    and reserved_count > 0;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.pages enable row level security;
alter table public.content_blocks enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.square_catalog_items enable row level security;
alter table public.product_overrides enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.pickup_slots enable row level security;
alter table public.webhook_events enable row level security;
alter table public.refunds enable row level security;

drop policy if exists "admins_manage_admin_users" on public.admin_users;
create policy "admins_manage_admin_users"
on public.admin_users
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public_read_published_pages" on public.pages;
create policy "public_read_published_pages"
on public.pages
for select
using (status = 'published');

drop policy if exists "admins_manage_pages" on public.pages;
create policy "admins_manage_pages"
on public.pages
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public_read_published_content_blocks" on public.content_blocks;
create policy "public_read_published_content_blocks"
on public.content_blocks
for select
using (is_published = true);

drop policy if exists "admins_manage_content_blocks" on public.content_blocks;
create policy "admins_manage_content_blocks"
on public.content_blocks
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins_manage_site_settings" on public.site_settings;
create policy "admins_manage_site_settings"
on public.site_settings
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public_read_media_assets" on public.media_assets;
create policy "public_read_media_assets"
on public.media_assets
for select
using (true);

drop policy if exists "admins_manage_media_assets" on public.media_assets;
create policy "admins_manage_media_assets"
on public.media_assets
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public_read_square_catalog_items" on public.square_catalog_items;
create policy "public_read_square_catalog_items"
on public.square_catalog_items
for select
using (is_archived = false);

drop policy if exists "admins_manage_square_catalog_items" on public.square_catalog_items;
create policy "admins_manage_square_catalog_items"
on public.square_catalog_items
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "public_read_visible_product_overrides" on public.product_overrides;
create policy "public_read_visible_product_overrides"
on public.product_overrides
for select
using (is_visible = true);

drop policy if exists "admins_manage_product_overrides" on public.product_overrides;
create policy "admins_manage_product_overrides"
on public.product_overrides
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins_read_orders" on public.orders;
create policy "admins_read_orders"
on public.orders
for select
using (public.is_admin_user());

drop policy if exists "admins_read_order_items" on public.order_items;
create policy "admins_read_order_items"
on public.order_items
for select
using (public.is_admin_user());

drop policy if exists "admins_manage_pickup_slots" on public.pickup_slots;
create policy "admins_manage_pickup_slots"
on public.pickup_slots
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins_read_webhook_events" on public.webhook_events;
create policy "admins_read_webhook_events"
on public.webhook_events
for select
using (public.is_admin_user());

drop policy if exists "admins_read_refunds" on public.refunds;
create policy "admins_read_refunds"
on public.refunds
for select
using (public.is_admin_user());

insert into public.pages (slug, title, status)
values
  ('home', 'Home', 'published'),
  ('about', 'About', 'published'),
  ('contact', 'Contact', 'published'),
  ('catering', 'Catering', 'published'),
  ('menu', 'Menu', 'published')
on conflict (slug) do nothing;

insert into public.site_settings (setting_key, setting_type, value)
values
  (
    'pickup_default_capacity',
    'json',
    '{"capacity":12,"lead_time_minutes":60}'::jsonb
  ),
  (
    'pickup_locations',
    'json',
    '{"locations":[{"slug":"provo","name":"Provo Store","square_location_id":"","address":"1200 N University Ave, Provo, UT 84604"},{"slug":"orem","name":"Orem Store","square_location_id":"","address":"800 S State St, Orem, UT 84058"}]}'::jsonb
  ),
  (
    'announcement_banner',
    'json',
    '{"enabled":false,"message":"","link":""}'::jsonb
  ),
  (
    'contact_details',
    'json',
    '{"phone":"(555) 123-4567","email":"info@penguinbrothers.com","address":"123 Ice Cream Lane, Dessert City, SW 12345"}'::jsonb
  )
on conflict (setting_key) do nothing;

commit;
