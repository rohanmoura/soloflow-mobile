import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';

export type CloudAccountState =
  | { configured: false; signedIn: false; email?: undefined }
  | { configured: true; signedIn: false; email?: undefined }
  | { configured: true; signedIn: true; email: string };

export async function getCloudAccountState(): Promise<CloudAccountState> {
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, signedIn: false };
  }

  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;

  if (!email) {
    return { configured: true, signedIn: false };
  }

  return { configured: true, signedIn: true, email };
}

export async function sendCloudSignInLink(email: string) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Cloud environment keys are missing.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    return {
      ok: false,
      message: 'Enter a valid email address.',
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: 'Check your email for the secure sign-in link.',
  };
}

export async function signOutCloudAccount() {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  await supabase.auth.signOut();
}
