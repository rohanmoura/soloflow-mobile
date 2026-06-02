import { Link, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Bell, BriefcaseBusiness, Cloud, Download, Moon, RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { CurrencyCode } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';
import { clampPercent } from '@/utils/calculations';

const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP'];
const trackingOptions = ['Invoices', 'Expenses', 'Savings', 'Tax prep'];

export default function SettingsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const goals = useSoloFlowStore((state) => state.goals);
  const preferences = useSoloFlowStore((state) => state.preferences);
  const syncStatus = useSoloFlowStore((state) => state.syncStatus);
  const updateProfile = useSoloFlowStore((state) => state.updateProfile);
  const updatePreferences = useSoloFlowStore((state) => state.updatePreferences);
  const prepareMonthlyReport = useSoloFlowStore((state) => state.prepareMonthlyReport);
  const syncToCloud = useSoloFlowStore((state) => state.syncToCloud);
  const resetDemoData = useSoloFlowStore((state) => state.resetDemoData);
  const [resetStatus, setResetStatus] = useState('');

  function handleExport() {
    prepareMonthlyReport();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleCloudSync() {
    await syncToCloud();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleReset() {
    resetDemoData();
    setResetStatus('Demo data reset to seeded portfolio values.');
  }

  function updateCurrency(currency: CurrencyCode) {
    updateProfile({ currency });
    Haptics.selectionAsync();
  }

  function togglePreference(key: 'paymentReminders' | 'darkModePreview') {
    updatePreferences({ [key]: !preferences[key] });
    Haptics.selectionAsync();
  }

  function toggleTrackingPreference(option: string) {
    const hasOption = profile.trackingPreferences.includes(option);
    const nextPreferences = hasOption
      ? profile.trackingPreferences.filter((item) => item !== option)
      : [...profile.trackingPreferences, option];

    updateProfile({ trackingPreferences: nextPreferences });
    Haptics.selectionAsync();
  }

  return (
    <Screen>
      <AppHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Profile, goals, preferences, and demo controls."
      />

      <Card tone="strong">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KM</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.meta}>{profile.businessType}</Text>
          </View>
        </View>
        <Text style={styles.meta}>Currency: {profile.currency}</Text>
        <Text style={styles.meta}>Tracking: {profile.trackingPreferences.join(', ')}</Text>
      </Card>

      <SectionHeader title="Profile controls" detail="Saved locally" />
      <Card>
        <Text style={styles.goalTitle}>Currency</Text>
        <Text style={styles.meta}>Used across dashboard, clients, invoices, and insights.</Text>
        <View style={styles.chipGrid}>
          {currencies.map((currency) => (
            <Chip key={currency} label={currency} selected={profile.currency === currency} onPress={() => updateCurrency(currency)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.goalTitle}>Tracking focus</Text>
        <Text style={styles.meta}>These tags shape the workspace setup and onboarding preview.</Text>
        <View style={styles.chipGrid}>
          {trackingOptions.map((option) => (
            <Chip
              key={option}
              label={option}
              selected={profile.trackingPreferences.includes(option)}
              onPress={() => toggleTrackingPreference(option)}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Goals" detail="Live progress" />
      {goals.map((goal) => {
        const progress = clampPercent((goal.currentAmount / goal.targetAmount) * 100);

        return (
          <Card key={goal.id}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalPercent}>{progress}%</Text>
            </View>
            <ProgressBar value={progress} tone={goal.type === 'expense_limit' ? 'warning' : 'success'} />
            <Text style={styles.meta}>
              {formatCurrency(goal.currentAmount, profile.currency)} of {formatCurrency(goal.targetAmount, profile.currency)}
            </Text>
          </Card>
        );
      })}

      <SectionHeader title="Preferences" detail="Saved locally" />
      <SettingRow
        icon={Bell}
        label="Payment reminders"
        value={preferences.paymentReminders ? 'On' : 'Off'}
        active={preferences.paymentReminders}
        onPress={() => togglePreference('paymentReminders')}
      />
      <SettingRow
        icon={Moon}
        label="Dark mode preview"
        value={preferences.darkModePreview ? 'On' : 'Off'}
        active={preferences.darkModePreview}
        onPress={() => togglePreference('darkModePreview')}
      />

      <SectionHeader title="Reports" detail="Local summary" />
      <Card>
        <View style={styles.actionRow}>
          <View style={styles.actionIcon}>
            <Download color={colors.primary} size={20} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.goalTitle}>Export monthly report</Text>
            <Text style={styles.meta}>{preferences.lastReportSummary ?? 'Ready to generate a monthly report summary.'}</Text>
          </View>
        </View>
        <Pressable style={styles.setupButton} onPress={handleExport}>
          <Text style={styles.setupButtonText}>Prepare report</Text>
        </Pressable>
      </Card>

      <SectionHeader title="Cloud sync" detail={syncStatus.mode === 'cloud' ? 'Connected' : 'V2-ready'} />
      <Card>
        <View style={styles.actionRow}>
          <View style={[styles.actionIcon, syncStatus.mode === 'error' && styles.errorIcon]}>
            <Cloud color={syncStatus.mode === 'error' ? colors.danger : colors.primary} size={20} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.goalTitle}>Supabase backup</Text>
            <Text style={styles.meta}>{syncStatus.message}</Text>
            {syncStatus.lastSyncedAt ? <Text style={styles.timestampText}>Last checked {syncStatus.lastSyncedAt.slice(0, 16)}</Text> : null}
          </View>
        </View>
        <Pressable style={[styles.setupButton, syncStatus.syncing && styles.disabledButton]} onPress={handleCloudSync} disabled={syncStatus.syncing}>
          <Text style={styles.setupButtonText}>{syncStatus.syncing ? 'Syncing...' : 'Run backup check'}</Text>
        </Pressable>
      </Card>

      <SectionHeader title="Portfolio" detail="KMAX proof" />
      <Card>
        <View style={styles.actionRow}>
          <View style={styles.actionIcon}>
            <BriefcaseBusiness color={colors.primary} size={20} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.goalTitle}>Case study ready</Text>
            <Text style={styles.meta}>
              Use this app as KMAX proof for mobile MVPs, finance dashboards, local state, and daily-use product UX.
            </Text>
          </View>
        </View>
      </Card>

      <Link href={'/onboarding' as Href} asChild>
        <Pressable style={styles.setupButton}>
          <Text style={styles.setupButtonText}>Preview onboarding</Text>
        </Pressable>
      </Link>

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <RotateCcw color={colors.danger} size={18} />
        <Text style={styles.resetText}>Reset demo data</Text>
      </Pressable>
      {resetStatus ? <Text style={styles.statusText}>{resetStatus}</Text> : null}
    </Screen>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  active,
  onPress,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.settingRow}>
          <View style={styles.actionIcon}>
            <Icon color={active ? colors.primary : colors.textMuted} size={20} />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.goalTitle}>{label}</Text>
            <Text style={styles.meta}>{value}</Text>
          </View>
          <View style={[styles.toggle, active && styles.toggleActive]}>
            <View style={[styles.knob, active && styles.knobActive]} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 52,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '900',
  },
  profileName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  goalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  goalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  goalPercent: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  setupButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  setupButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
  resetText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  errorIcon: {
    backgroundColor: colors.dangerSoft,
  },
  actionCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  toggle: {
    backgroundColor: colors.slateSoft,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    padding: 3,
    width: 48,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  knob: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 22,
    width: 22,
  },
  knobActive: {
    alignSelf: 'flex-end',
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  timestampText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  disabledButton: {
    opacity: 0.62,
  },
});
