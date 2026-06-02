import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Cloud, DownloadCloud, LogOut, Mail, UploadCloud } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { continueWithGoogle, createCloudAccount, getCloudAccountState, signInCloudAccount, signOutCloudAccount, type CloudAccountState } from '@/services/cloudAuth';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';

WebBrowser.maybeCompleteAuthSession();

export default function CloudAccountScreen() {
  const [account, setAccount] = useState<CloudAccountState>({ configured: true, signedIn: false });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const syncStatus = useSoloFlowStore((state) => state.syncStatus);
  const syncToCloud = useSoloFlowStore((state) => state.syncToCloud);
  const restoreFromCloud = useSoloFlowStore((state) => state.restoreFromCloud);

  useEffect(() => {
    refreshAccount();
  }, []);

  async function refreshAccount() {
    const nextAccount = await getCloudAccountState();
    setAccount(nextAccount);
    setEmail(nextAccount.email ?? '');
  }

  async function handleSignIn() {
    setLoading(true);
    const result = await signInCloudAccount(email, password);
    setMessage(result.message);
    await refreshAccount();
    setLoading(false);
    Haptics.notificationAsync(result.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  }

  async function handleCreateAccount() {
    setLoading(true);
    const result = await createCloudAccount(email, password);
    setMessage(result.message);
    await refreshAccount();
    setLoading(false);
    Haptics.notificationAsync(result.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const result = await continueWithGoogle();
    setMessage(result.message);
    await refreshAccount();
    setLoading(false);
    Haptics.notificationAsync(result.ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
  }

  async function handleSignOut() {
    setLoading(true);
    await signOutCloudAccount();
    await refreshAccount();
    setMessage('Cloud account signed out on this device.');
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleBackup() {
    await syncToCloud();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleRestore() {
    await restoreFromCloud();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color={colors.text} size={24} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Cloud color={colors.primary} size={24} />
        </View>
        <Text style={styles.eyebrow}>SECURE BACKUP</Text>
        <Text style={styles.title}>Cloud account</Text>
        <Text style={styles.subtitle}>Keep your freelancer finances ready to back up and restore when you switch devices.</Text>
      </View>

      <Card>
        <View style={styles.statusRow}>
          <View style={styles.actionIcon}>
            <Mail color={colors.primary} size={20} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>{account.signedIn ? 'Account connected' : 'Connect securely'}</Text>
            <Text style={styles.meta}>
              {account.signedIn ? account.email : 'Use your email and password to connect this device to cloud backup.'}
            </Text>
          </View>
        </View>

        {!account.signedIn ? (
          <>
            <Pressable style={[styles.googleButton, loading && styles.disabled]} disabled={loading} onPress={handleGoogleSignIn}>
              <View style={styles.googleMark}>
                <GoogleMark />
              </View>
              <Text style={styles.googleButtonText}>{loading ? 'Connecting...' : 'Continue with Google'}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email address"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              secureTextEntry
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable style={[styles.primaryButton, loading && styles.disabled]} disabled={loading} onPress={handleSignIn}>
              <Text style={styles.primaryButtonText}>{loading ? 'Connecting...' : 'Sign in'}</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, styles.createButton, loading && styles.disabled]} disabled={loading} onPress={handleCreateAccount}>
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.connectedPanel}>
              <View style={styles.connectedRow}>
                <View style={styles.connectedDot} />
                <View style={styles.copy}>
                  <Text style={styles.connectedTitle}>Backup workspace ready</Text>
                  <Text style={styles.meta}>{syncStatus.message}</Text>
                  {syncStatus.lastSyncedAt ? <Text style={styles.syncTime}>Last checked {syncStatus.lastSyncedAt.slice(0, 16)}</Text> : null}
                </View>
              </View>
            </View>
            <Pressable style={[styles.primaryButton, syncStatus.syncing && styles.disabled]} disabled={syncStatus.syncing} onPress={handleBackup}>
              <View style={styles.buttonContent}>
                <UploadCloud color={colors.surface} size={18} />
                <Text style={styles.primaryButtonText}>{syncStatus.syncing ? 'Backing up...' : 'Back up now'}</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.secondaryButton, styles.createButton, syncStatus.syncing && styles.disabled]} disabled={syncStatus.syncing} onPress={handleRestore}>
              <DownloadCloud color={colors.text} size={18} />
              <Text style={styles.secondaryButtonText}>{syncStatus.syncing ? 'Checking...' : 'Restore latest backup'}</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, styles.createButton, loading && styles.disabled]} disabled={loading} onPress={handleSignOut}>
              <LogOut color={colors.text} size={18} />
              <Text style={styles.secondaryButtonText}>{loading ? 'Signing out...' : 'Sign out'}</Text>
            </Pressable>
          </>
        )}

        {!account.configured ? <Text style={styles.warning}>Cloud keys are missing from the local environment file.</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>
    </Screen>
  );
}

function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.91 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      <Path fill="none" d="M0 0h48v48H0z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 56,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 54,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  copy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: '#DADCE0',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  googleMark: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 22,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  divider: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '900',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.lg,
  },
  buttonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  createButton: {
    marginTop: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.62,
  },
  connectedPanel: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(21,153,71,0.16)',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  connectedRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  connectedDot: {
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 10,
    marginRight: spacing.md,
    width: 10,
  },
  connectedTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  syncTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  warning: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: spacing.md,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: spacing.md,
  },
});
