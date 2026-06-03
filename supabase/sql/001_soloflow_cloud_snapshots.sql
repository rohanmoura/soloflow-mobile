create table if not exists public.soloflow_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile jsonb not null,
  clients jsonb not null default '[]'::jsonb,
  invoices jsonb not null default '[]'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  reminders jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.soloflow_snapshots enable row level security;

drop policy if exists "Users can read own SoloFlow snapshot" on public.soloflow_snapshots;
create policy "Users can read own SoloFlow snapshot"
on public.soloflow_snapshots
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own SoloFlow snapshot" on public.soloflow_snapshots;
create policy "Users can insert own SoloFlow snapshot"
on public.soloflow_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own SoloFlow snapshot" on public.soloflow_snapshots;
create policy "Users can update own SoloFlow snapshot"
on public.soloflow_snapshots
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own SoloFlow snapshot" on public.soloflow_snapshots;
create policy "Users can delete own SoloFlow snapshot"
on public.soloflow_snapshots
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists soloflow_snapshots_user_id_idx
on public.soloflow_snapshots (user_id);

create index if not exists soloflow_snapshots_updated_at_idx
on public.soloflow_snapshots (updated_at desc);
