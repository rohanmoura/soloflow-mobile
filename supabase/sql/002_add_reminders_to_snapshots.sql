alter table public.soloflow_snapshots
add column if not exists reminders jsonb not null default '[]'::jsonb;
