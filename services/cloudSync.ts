import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';
import type { Client, Goal, Invoice, Transaction, UserProfile } from '@/types/finance';

export type CloudSnapshot = {
  profile: UserProfile;
  clients: Client[];
  invoices: Invoice[];
  transactions: Transaction[];
  goals: Goal[];
  updatedAt: string;
};

export type CloudSyncResult =
  | { ok: true; mode: 'cloud'; message: string; syncedAt: string }
  | { ok: true; mode: 'local'; message: string; syncedAt: string }
  | { ok: false; mode: 'error'; message: string; syncedAt: string };

export async function pushSnapshotToCloud(snapshot: Omit<CloudSnapshot, 'updatedAt'>): Promise<CloudSyncResult> {
  const syncedAt = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      mode: 'local',
      message: 'Cloud sync is ready. Add Supabase env keys to enable remote backup.',
      syncedAt,
    };
  }

  const { error } = await supabase.from('soloflow_snapshots').upsert({
    id: snapshot.profile.id,
    profile: snapshot.profile,
    clients: snapshot.clients,
    invoices: snapshot.invoices,
    transactions: snapshot.transactions,
    goals: snapshot.goals,
    updated_at: syncedAt,
  });

  if (error) {
    return {
      ok: false,
      mode: 'error',
      message: error.message,
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
