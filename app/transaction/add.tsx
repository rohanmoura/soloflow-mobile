import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { incomeCategories, expenseCategories } from '@/constants/financeOptions';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus, TransactionType } from '@/types/finance';
import { transactionSchema } from '@/utils/validators';

type FormErrors = Partial<Record<'title' | 'amount' | 'category' | 'date', string>>;

const statuses: MoneyStatus[] = ['paid', 'pending', 'draft'];

export default function AddTransactionScreen() {
  const params = useLocalSearchParams<{ type?: TransactionType }>();
  const initialType = params.type === 'expense' ? 'expense' : 'income';
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const addTransaction = useSoloFlowStore((state) => state.addTransaction);

  const [type, setType] = useState<TransactionType>(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(clients[0]?.id);
  const [status, setStatus] = useState<MoneyStatus>('paid');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  const categories = useMemo(() => (type === 'income' ? incomeCategories : expenseCategories), [type]);

  function selectType(nextType: TransactionType) {
    setType(nextType);
    setCategory('');
    setErrors({});
    if (nextType === 'expense') {
      setClientId(undefined);
    } else {
      setClientId(clients[0]?.id);
    }
  }

  function handleSave() {
    const parsedAmount = Number(amount.replace(/,/g, ''));
    const result = transactionSchema.safeParse({
      title,
      amount: parsedAmount,
      category,
      clientId,
      date,
      notes,
      attachmentName,
    });

    if (!result.success) {
      const nextErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'title' || key === 'amount' || key === 'category' || key === 'date') {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    addTransaction({
      title: result.data.title,
      type,
      amount: result.data.amount,
      currency: profile.currency,
      category: result.data.category,
      clientId: type === 'income' ? clientId : undefined,
      date: result.data.date,
      status,
      notes: result.data.notes,
      attachmentName: result.data.attachmentName || undefined,
    });

    setSaved(true);
    setErrors({});
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.back(), 650);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
            <X color={colors.ink} size={22} />
          </Pressable>
        </View>

        <AppHeader
          eyebrow="Quick entry"
          title="Add transaction"
          subtitle="Record income or expense with the fields a freelancer actually needs on mobile."
        />

        {saved ? (
          <Card>
            <View style={styles.successIcon}>
              <Check color={colors.success} size={26} />
            </View>
            <Text style={styles.successTitle}>Transaction saved</Text>
            <Text style={styles.successText}>Dashboard totals and goal progress are updated.</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.segment}>
            <Pressable
              accessibilityRole="button"
              onPress={() => selectType('income')}
              style={[styles.segmentOption, type === 'income' && styles.segmentActive]}>
              <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => selectType('expense')}
              style={[styles.segmentOption, type === 'expense' && styles.segmentActive]}>
              <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
            </Pressable>
          </View>

          <FormField
            label="Title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            placeholder={type === 'income' ? 'Website milestone payment' : 'Software subscription'}
            returnKeyType="next"
          />

          <FormField
            label={`Amount (${profile.currency})`}
            value={amount}
            onChangeText={setAmount}
            error={errors.amount}
            keyboardType="decimal-pad"
            placeholder="1200"
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {categories.map((item) => (
              <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

          {type === 'income' ? (
            <>
              <Text style={styles.fieldLabel}>Client</Text>
              <View style={styles.chipGrid}>
                {clients.map((client) => (
                  <Chip key={client.id} label={client.name} selected={clientId === client.id} onPress={() => setClientId(client.id)} />
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statuses.map((item) => (
              <Chip key={item} label={item} selected={status === item} onPress={() => setStatus(item)} />
            ))}
          </View>

          <FormField
            label="Date"
            value={date}
            onChangeText={setDate}
            error={errors.date}
            placeholder="2026-05-27"
          />

          <FormField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Optional detail for future review"
            style={styles.notesInput}
          />

          <FormField
            label="Attachment name"
            value={attachmentName}
            onChangeText={setAttachmentName}
            placeholder="receipt-may.pdf"
          />

          <PrimaryButton label="Save transaction" icon={Check} onPress={handleSave} />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  topRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  segment: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  segmentOption: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.surfaceStrong,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: colors.surface,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: -spacing.md,
  },
  notesInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  successIcon: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 48,
  },
  successTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  successText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
