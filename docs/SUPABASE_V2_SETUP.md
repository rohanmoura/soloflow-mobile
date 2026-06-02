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
- Cloud Account supports secure email and password sign-in.
- Cloud backup only writes after a signed-in account exists.
- Restore latest backup pulls the signed-in account snapshot into local state.
- Auto backup runs after local finance changes once the first cloud backup succeeds.
- If env keys or sign-in are missing, the app stays local-first.

## Test Flow

1. Run `supabase/sql/001_soloflow_cloud_snapshots.sql` in the SQL editor.
2. Restart Expo with `npx expo start -c`.
3. Open Settings > Manage cloud account.
4. Create a cloud account or sign in.
5. Return to Settings and run backup.
6. Change local demo data to verify automatic backup.
7. Use Restore latest backup to verify the restore path.

## Google Sign-In

Enable Google in Authentication > Providers.

Add the mobile deep link to the allowed redirect URLs:

```text
soloflowmobile://cloud-account
```

For Expo Go, the dev URL can be different because it uses the running Expo host. If Google opens and returns a redirect error, copy the redirect URL shown by Expo/Supabase and add that exact URL to the allow list too.
