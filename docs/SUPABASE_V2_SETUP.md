# SoloFlow Mobile V2 Supabase Setup

## Environment

Keep these values in the local env file:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Restart Expo after changing env values:

```powershell
npx expo start -c
```

## SQL File

Run this file in the Supabase SQL editor before testing cloud backup:

```text
supabase/sql/001_soloflow_cloud_snapshots.sql
```

The SQL creates:

- `public.soloflow_snapshots`
- user-owned backup rows
- row level security policies
- indexes for `user_id` and `updated_at`

## Current V2 Behavior

- Settings uses generic “Cloud” language in the app UI.
- Cloud Account sends a secure email sign-in link.
- Cloud backup only writes after a signed-in account exists.
- If env keys or sign-in are missing, the app stays local-first.
