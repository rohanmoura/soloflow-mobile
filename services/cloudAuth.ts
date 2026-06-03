import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { isSupabaseConfigured, supabase } from '@/services/supabaseClient';

export type CloudAccountState =
  | { configured: false; signedIn: false; email?: undefined }
  | { configured: true; signedIn: false; email?: undefined }
  | { configured: true; signedIn: true; email: string };

export function getCloudRedirectUrl() {
  return Linking.createURL('cloud-account');
}

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

function validateCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    return {
      ok: false as const,
      message: 'Enter a valid email address.',
      normalizedEmail,
    };
  }

  if (password.trim().length < 6) {
    return {
      ok: false as const,
      message: 'Use at least 6 characters for the password.',
      normalizedEmail,
    };
  }

  return {
    ok: true as const,
    normalizedEmail,
  };
}

function getFriendlyAuthMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('invalid login') || normalized.includes('invalid credentials')) {
    return 'Email or password is not correct.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Check your email and confirm the account before signing in.';
  }

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return 'This email already has an account. Try signing in instead.';
  }

  if (normalized.includes('redirect') || normalized.includes('oauth')) {
    return 'Google sign-in needs the mobile redirect URL added in the auth dashboard.';
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Connection failed. Check internet and try again.';
  }

  return 'Account action could not complete. Please try again.';
}

export async function signInCloudAccount(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Cloud environment keys are missing.',
    };
  }

  const validation = validateCredentials(email, password);

  if (!validation.ok) {
    return validation;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.normalizedEmail,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: getFriendlyAuthMessage(error.message),
    };
  }

  return {
    ok: true,
    message: 'Cloud account connected.',
  };
}

export async function createCloudAccount(email: string, password: string) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Cloud environment keys are missing.',
    };
  }

  const validation = validateCredentials(email, password);

  if (!validation.ok) {
    return validation;
  }

  const { error } = await supabase.auth.signUp({
    email: validation.normalizedEmail,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: getFriendlyAuthMessage(error.message),
    };
  }

  return {
    ok: true,
    message: 'Cloud account created. If verification is required, check your email before signing in.',
  };
}

export async function continueWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Cloud environment keys are missing.',
    };
  }

  const redirectTo = getCloudRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return {
      ok: false,
      message: error ? getFriendlyAuthMessage(error.message) : 'Google sign-in could not start.',
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    return {
      ok: false,
      message: 'Google sign-in was cancelled.',
    };
  }

  const callbackUrl = new URL(result.url.replace('#', '?'));
  const authCode = callbackUrl.searchParams.get('code');
  const accessToken = callbackUrl.searchParams.get('access_token');
  const refreshToken = callbackUrl.searchParams.get('refresh_token');

  if (authCode) {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(authCode);

    if (sessionError) {
      return {
        ok: false,
        message: getFriendlyAuthMessage(sessionError.message),
      };
    }

    return {
      ok: true,
      message: 'Cloud account connected with Google.',
    };
  }

  if (accessToken && refreshToken) {
    const { error: tokenError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (tokenError) {
      return {
        ok: false,
        message: getFriendlyAuthMessage(tokenError.message),
      };
    }

    return {
      ok: true,
      message: 'Cloud account connected with Google.',
    };
  }

  if (!authCode) {
    return {
      ok: false,
      message: 'Google sign-in did not return a valid session.',
    };
  }

  return {
    ok: false,
    message: 'Google sign-in could not complete.',
  };
}

export async function signOutCloudAccount() {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  await supabase.auth.signOut();
}
