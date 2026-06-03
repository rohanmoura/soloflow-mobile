import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ArrowLeft, Repeat2 } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';

export default function RecurringScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const generateRecurringMonth = useSoloFlowStore((state) => state.generateRecurringMonth);
  const [incomeTitle, setIncomeTitle] = useState('Monthly retainer income');
  const [incomeAmount, setIncomeAmount] = useState('1200');
  const [expenseTitle, setExpenseTitle] = useState('Monthly software tools');
  const [expenseAmount, setExpenseAmount] = useState('160');
  const [status, setStatus] = useState('');

  function handleGenerate() {
    const parsedIncome = Number(incomeAmount.replace(/,/g, ''));
    const parsedExpense = Number(expenseAmount.replace(/,/g, ''));

    if (!incomeTitle.trim() || !expenseTitle.trim() || parsedIncome <= 0 || parsedExpense <= 0) {
      setStatus('Add valid titles and amounts first.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    generateRecurringMonth({
      incomeTitle,
      incomeAmount: parsedIncome,
      expenseTitle,
      expenseAmount: parsedExpense,
    });
    setStatus('Recurring items added for this month.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.ink} size={21} />
        </Pressable>
        <AppHeader
          eyebrow="Automation"
          title="Recurring setup"
          subtitle="Create repeat monthly income and expense drafts without retyping the same records."
        />

        <Card>
          <Text style={styles.sectionTitle}>Income template</Text>
          <FormField label="Title" value={incomeTitle} onChangeText={setIncomeTitle} />
          <FormField
            label={`Amount (${profile.currency})`}
            value={incomeAmount}
            onChangeText={setIncomeAmount}
            keyboardType="decimal-pad"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Expense template</Text>
          <FormField label="Title" value={expenseTitle} onChangeText={setExpenseTitle} />
          <FormField
            label={`Amount (${profile.currency})`}
            value={expenseAmount}
            onChangeText={setExpenseAmount}
            keyboardType="decimal-pad"
          />
        </Card>

        <PrimaryButton label="Generate this month" icon={Repeat2} onPress={handleGenerate} />
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
