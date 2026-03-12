begin;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  source text not null default 'web',
  session_id text,
  order_id uuid references public.orders (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_events_event_name_created_at
  on public.analytics_events (event_name, created_at desc);

create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;

drop policy if exists "admins_read_analytics_events" on public.analytics_events;
create policy "admins_read_analytics_events"
on public.analytics_events
for select
using (public.is_admin_user());

commit;
