import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Cloud, LogOut, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { getCloudAccountState, sendCloudSignInLink, signOutCloudAccount, type CloudAccountState } from '@/services/cloudAuth';
import { colors, spacing } from '@/theme/tokens';

export default function CloudAccountScreen() {
  const [account, setAccount] = useState<CloudAccountState>({ configured: true, signedIn: false });
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshAccount();
  }, []);

  async function refreshAccount() {
    const nextAccount = await getCloudAccountState();
    setAccount(nextAccount);
    setEmail(nextAccount.email ?? '');
  }

  async function handleSendLink() {
    setLoading(true);
    const result = await sendCloudSignInLink(email);
    setMessage(result.message);
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
        <Text style={styles.subtitle}>Keep your freelancer finances ready to restore when you switch devices.</Text>
      </View>

      <Card>
        <View style={styles.statusRow}>
          <View style={styles.actionIcon}>
            <Mail color={colors.primary} size={20} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>{account.signedIn ? 'Account connected' : 'Connect with email'}</Text>
            <Text style={styles.meta}>
              {account.signedIn ? account.email : 'A secure email link will connect this device to your cloud backup.'}
            </Text>
          </View>
        </View>

        {!account.signedIn ? (
          <>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email address"
              placeholderTextColor={colors.textSoft}
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
            <Pressable style={[styles.primaryButton, loading && styles.disabled]} disabled={loading} onPress={handleSendLink}>
              <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send sign-in link'}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={[styles.secondaryButton, loading && styles.disabled]} disabled={loading} onPress={handleSignOut}>
            <LogOut color={colors.text} size={18} />
            <Text style={styles.secondaryButtonText}>{loading ? 'Signing out...' : 'Sign out'}</Text>
          </Pressable>
        )}

        {!account.configured ? <Text style={styles.warning}>Cloud keys are missing from the local environment file.</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </Card>
    </Screen>
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.lg,
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
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.62,
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
