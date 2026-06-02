# SoloFlow Mobile V2 Supabase Setup

## Environment

Copy `.env.example` to `.env.local` and fill:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Restart Expo after changing env values:

```powershell
npx expo start -c
```

## Snapshot Table

Create this table for the current V2 backup flow:

```sql
create table if not exists public.soloflow_snapshots (
  id text primary key,
  profile jsonb not null,
  clients jsonb not null default '[]'::jsonb,
  invoices jsonb not null default '[]'::jsonb,
  transactions jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
```

## Row Level Security

For a portfolio demo using anon writes, keep this disabled only in a throwaway demo project. For production, enable RLS and scope rows to authenticated users.

```sql
alter table public.soloflow_snapshots enable row level security;
```

V2 auth should later replace the profile id with `auth.uid()`.

## Current V2 Behavior

- With no env keys, app stays local-first and reports that cloud sync is ready.
- With env keys and table present, Settings > Cloud sync > Run backup check upserts one local snapshot.
- Future V2 should split snapshots into normalized tables once auth is added.
