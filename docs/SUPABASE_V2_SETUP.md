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

## SQL Files

The SQL has already been run for the current project. For a fresh project, run these files in order in the SQL editor:

```text
supabase/sql/001_soloflow_cloud_snapshots.sql
supabase/sql/002_add_reminders_to_snapshots.sql
supabase/sql/003_add_preferences_to_snapshots.sql
```

The SQL creates and updates:

- `public.soloflow_snapshots`
- user-owned backup rows
- row level security policies
- indexes for `user_id` and `updated_at`
- reminder queue backup support
- preference backup support

## Current V2 Behavior

- Settings uses generic “Cloud” language in the app UI.
- Cloud Account supports secure email and password sign-in.
- Cloud backup only writes after a signed-in account exists.
- Restore latest backup pulls the signed-in account snapshot into local state.
- Auto backup runs after local finance changes once the first cloud backup succeeds.
- Reminder queue, CSV report status, and recurring transaction state stay local-first and backup-ready.
- If env keys or sign-in are missing, the app stays local-first.

## Test Flow

1. Restart Expo with `npx expo start -c`.
2. Open Settings > Manage cloud account.
3. Create a cloud account or sign in.
4. Return to Settings and run backup.
5. Change local demo data to verify automatic backup.
6. Use Restore latest backup to verify the restore path.

## Google Sign-In

Enable Google in Authentication > Providers.

Add the mobile deep link to the allowed redirect URLs:

```text
soloflowmobile://cloud-account
```

For Expo Go, the dev URL can be different because it uses the running Expo host. If Google opens and returns a redirect error, copy the redirect URL shown by Expo/Supabase and add that exact URL to the allow list too.
