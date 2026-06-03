import { router } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { CurrencyCode, UserRole } from '@/types/finance';

const roles: Array<{ label: string; value: UserRole }> = [
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Creator', value: 'creator' },
  { label: 'Consultant', value: 'consultant' },
  { label: 'Solo founder', value: 'solo-founder' },
  { label: 'Agency owner', value: 'agency-owner' },
];

const currencies: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP'];
const preferences = ['income', 'expenses', 'invoices', 'goals', 'clients'];
const businessTypes = ['Solo service business', 'Creator business', 'Consulting practice', 'Small agency', 'Productized service'];

export default function OnboardingScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const completeOnboarding = useSoloFlowStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>(profile.role);
  const [currency, setCurrency] = useState<CurrencyCode>(profile.currency);
  const [goal, setGoal] = useState(profile.monthlyRevenueGoal);
  const [businessType, setBusinessType] = useState(profile.businessType);
  const [selectedPreferences, setSelectedPreferences] = useState(profile.trackingPreferences);

  function togglePreference(item: string) {
    setSelectedPreferences((current) =>
      current.includes(item) ? current.filter((preference) => preference !== item) : [...current, item],
    );
  }

  function finish() {
    completeOnboarding({
      role,
      currency,
      monthlyRevenueGoal: goal,
      businessType,
      trackingPreferences: selectedPreferences,
    });
    router.replace('/(tabs)');
  }

  return (
    <Screen>
      <View style={styles.progressWrap}>
        {[0, 1, 2, 3, 4].map((item) => (
          <View key={item} style={[styles.progressDot, item <= step && styles.progressActive]} />
        ))}
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>SoloFlow setup</Text>
        <Text style={styles.title}>{copy[step].title}</Text>
        <Text style={styles.subtitle}>{copy[step].subtitle}</Text>
      </View>

      {step === 0 ? (
        <View style={styles.optionGrid}>
          {roles.map((item) => (
            <Chip key={item.value} label={item.label} selected={role === item.value} onPress={() => setRole(item.value)} />
          ))}
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.optionGrid}>
          {currencies.map((item) => (
            <Chip key={item} label={item} selected={currency === item} onPress={() => setCurrency(item)} />
          ))}
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.goalGrid}>
          {[5000, 8000, 12000, 20000].map((amount) => (
            <Pressable key={amount} onPress={() => setGoal(amount)} style={[styles.goalChip, goal === amount && styles.goalActive]}>
              <Text style={[styles.goalText, goal === amount && styles.goalTextActive]}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 3 ? (
        <>
          <View style={styles.optionGrid}>
            {businessTypes.map((item) => (
              <Chip key={item} label={item} selected={businessType === item} onPress={() => setBusinessType(item)} />
            ))}
          </View>
          <FormField
            label="Custom business type"
            value={businessType}
            onChangeText={setBusinessType}
            placeholder="Freelance product developer"
            style={styles.businessInput}
          />
        </>
      ) : null}

      {step === 4 ? (
        <View style={styles.optionGrid}>
          {preferences.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={selectedPreferences.includes(item)}
              onPress={() => togglePreference(item)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable onPress={() => setStep((current) => current - 1)} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <PrimaryButton
          label={step === 4 ? 'Finish setup' : 'Next'}
          icon={step === 4 ? Check : ChevronRight}
          onPress={step === 4 ? finish : () => setStep((current) => current + 1)}
        />
      </View>
    </Screen>
  );
}

const copy = [
  {
    title: 'What kind of solo business do you run?',
    subtitle: 'This shapes the dashboard language and client workflow.',
  },
  {
    title: 'Choose your working currency',
    subtitle: 'All demo totals and future records will follow this preference.',
  },
  {
    title: 'Set a monthly revenue goal',
    subtitle: 'SoloFlow uses this goal to calculate monthly pace and progress.',
  },
  {
    title: 'Describe your business type',
    subtitle: 'This keeps client and finance labels closer to how you actually work.',
  },
  {
    title: 'Pick what you want to track',
    subtitle: 'Keep the home dashboard focused on your daily money workflow.',
  },
];

const styles = StyleSheet.create({
  progressWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  progressDot: {
    backgroundColor: colors.slateSoft,
    borderRadius: 999,
    flex: 1,
    height: 6,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalGrid: {
    gap: spacing.md,
  },
  goalChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.lg,
  },
  goalActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  goalTextActive: {
    color: colors.surface,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
  },
  backButton: {
    padding: spacing.md,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '900',
  },
  businessInput: {
    marginTop: spacing.lg,
  },
});
