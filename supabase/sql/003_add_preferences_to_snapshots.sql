alter table public.soloflow_snapshots
add column if not exists preferences jsonb not null default '{}'::jsonb;
