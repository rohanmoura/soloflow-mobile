import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';

export default function EditProfileScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const updateProfile = useSoloFlowStore((state) => state.updateProfile);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [businessType, setBusinessType] = useState(profile.businessType);
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(String(profile.monthlyRevenueGoal));
  const [savingsGoal, setSavingsGoal] = useState(String(profile.savingsGoal));
  const [expenseLimit, setExpenseLimit] = useState(String(profile.expenseLimit));
  const [status, setStatus] = useState('');

  function handleSave() {
    const revenueGoal = Number(monthlyRevenueGoal.replace(/,/g, ''));
    const savingsTarget = Number(savingsGoal.replace(/,/g, ''));
    const monthlyExpenseLimit = Number(expenseLimit.replace(/,/g, ''));

    if (!name.trim() || !email.includes('@') || !businessType.trim() || revenueGoal <= 0 || savingsTarget <= 0 || monthlyExpenseLimit <= 0) {
      setStatus('Add valid profile details and positive goal amounts.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      businessType: businessType.trim(),
      monthlyRevenueGoal: Math.round(revenueGoal),
      savingsGoal: Math.round(savingsTarget),
      expenseLimit: Math.round(monthlyExpenseLimit),
    });
    setStatus('Profile updated.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.back(), 550);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.ink} size={21} />
        </Pressable>
        <AppHeader
          eyebrow="Profile"
          title="Edit workspace"
          subtitle="Keep your name, business details, and monthly targets current."
        />

        <Card>
          <FormField label="Name" value={name} onChangeText={setName} />
          <FormField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <FormField label="Business type" value={businessType} onChangeText={setBusinessType} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Monthly targets</Text>
          <FormField
            label={`Revenue goal (${profile.currency})`}
            value={monthlyRevenueGoal}
            onChangeText={setMonthlyRevenueGoal}
            keyboardType="decimal-pad"
          />
          <FormField
            label={`Savings goal (${profile.currency})`}
            value={savingsGoal}
            onChangeText={setSavingsGoal}
            keyboardType="decimal-pad"
          />
          <FormField
            label={`Expense limit (${profile.currency})`}
            value={expenseLimit}
            onChangeText={setExpenseLimit}
            keyboardType="decimal-pad"
          />
        </Card>

        <PrimaryButton label="Save profile" icon={Save} onPress={handleSave} />
        {status ? <Text style={styles.statusText}>{status}</Text> : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    backgroundColor: colors.backgroundWarm,
    flex: 1,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 42,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  statusText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
