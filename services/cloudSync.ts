import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import type { AppPreferences, Client, Goal, Invoice, PaymentReminder, Transaction, UserProfile } from '@/types/finance';

export type CloudSnapshot = {
  profile: UserProfile;
  clients: Client[];
  invoices: Invoice[];
  transactions: Transaction[];
  goals: Goal[];
  reminders: PaymentReminder[];
  preferences: AppPreferences;
  updatedAt: string;
};

export type CloudSyncResult =
  | { ok: true; mode: 'cloud'; message: string; syncedAt: string }
  | { ok: true; mode: 'local'; message: string; syncedAt: string }
  | { ok: false; mode: 'error'; message: string; syncedAt: string };

export type CloudRestoreResult =
  | { ok: true; mode: 'cloud'; message: string; syncedAt: string; snapshot: CloudSnapshot }
  | { ok: true; mode: 'local'; message: string; syncedAt: string; snapshot?: undefined }
  | { ok: false; mode: 'error'; message: string; syncedAt: string; snapshot?: undefined };

export async function pushSnapshotToCloud(snapshot: Omit<CloudSnapshot, 'updatedAt'>): Promise<CloudSyncResult> {
  const syncedAt = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      mode: 'local',
      message: 'Cloud backup is ready. Add cloud environment keys to enable remote backup.',
      syncedAt,
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: true,
      mode: 'local',
      message: 'Sign in to enable secure cloud backup.',
      syncedAt,
    };
  }

  const { error } = await supabase.from('soloflow_snapshots').upsert({
    user_id: userData.user.id,
    profile: snapshot.profile,
    clients: snapshot.clients,
    invoices: snapshot.invoices,
    transactions: snapshot.transactions,
    goals: snapshot.goals,
    reminders: snapshot.reminders,
    preferences: snapshot.preferences,
    updated_at: syncedAt,
  }, {
    onConflict: 'user_id',
  });

  if (error) {
    return {
      ok: false,
      mode: 'error',
      message: 'Backup failed. Check account setup and try again.',
      syncedAt,
    };
  }

  return {
    ok: true,
    mode: 'cloud',
    message: 'Cloud backup completed.',
    syncedAt,
  };
}

export async function pullSnapshotFromCloud(): Promise<CloudRestoreResult> {
  const syncedAt = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      mode: 'local',
      message: 'Cloud environment keys are needed before restore.',
      syncedAt,
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: true,
      mode: 'local',
      message: 'Sign in to restore your cloud backup.',
      syncedAt,
    };
  }

  const { data, error } = await supabase
    .from('soloflow_snapshots')
    .select('profile, clients, invoices, transactions, goals, reminders, preferences, updated_at')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      mode: 'error',
      message: 'Restore failed. Check account setup and try again.',
      syncedAt,
    };
  }

  if (!data) {
    return {
      ok: true,
      mode: 'local',
      message: 'No cloud backup found for this account yet.',
      syncedAt,
    };
  }

  return {
    ok: true,
    mode: 'cloud',
    message: 'Cloud backup restored.',
    syncedAt,
    snapshot: {
      profile: data.profile as CloudSnapshot['profile'],
      clients: data.clients as CloudSnapshot['clients'],
      invoices: data.invoices as CloudSnapshot['invoices'],
      transactions: data.transactions as CloudSnapshot['transactions'],
      goals: data.goals as CloudSnapshot['goals'],
      reminders: (data.reminders ?? []) as CloudSnapshot['reminders'],
      preferences: (data.preferences ?? {}) as CloudSnapshot['preferences'],
      updatedAt: data.updated_at as string,
    },
  };
}
