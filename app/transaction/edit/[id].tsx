import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { expenseCategories, incomeCategories } from '@/constants/financeOptions';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus, TransactionType } from '@/types/finance';
import { transactionSchema } from '@/utils/validators';

type FormErrors = Partial<Record<'title' | 'amount' | 'category' | 'date', string>>;

const statuses: MoneyStatus[] = ['paid', 'pending', 'overdue', 'draft'];

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const transaction = useSoloFlowStore((state) => state.transactions.find((item) => item.id === id));
  const updateTransaction = useSoloFlowStore((state) => state.updateTransaction);

  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'income');
  const [title, setTitle] = useState(transaction?.title ?? '');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [category, setCategory] = useState(transaction?.category ?? '');
  const [clientId, setClientId] = useState<string | undefined>(transaction?.clientId);
  const [status, setStatus] = useState<MoneyStatus>(transaction?.status ?? 'paid');
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [attachmentName, setAttachmentName] = useState(transaction?.attachmentName ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  const categories = useMemo(() => (type === 'income' ? incomeCategories : expenseCategories), [type]);

  if (!transaction) {
    return (
      <Screen>
        <CloseButton />
        <Card>
          <Text style={styles.title}>Transaction not found</Text>
          <Text style={styles.meta}>This record may have been reset.</Text>
        </Card>
      </Screen>
    );
  }

  function selectType(nextType: TransactionType) {
    setType(nextType);
    setCategory('');
    setErrors({});
    setClientId(nextType === 'income' ? clientId ?? clients[0]?.id : undefined);
  }

  function handleSave() {
    if (!transaction) {
      return;
    }

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

    updateTransaction(transaction.id, {
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
    setTimeout(() => router.back(), 550);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <CloseButton />
        <AppHeader eyebrow="Edit money" title="Update transaction" subtitle="Adjust details and keep goal progress in sync." />

        {saved ? (
          <Card>
            <View style={styles.successIcon}>
              <Check color={colors.success} size={26} />
            </View>
            <Text style={styles.successTitle}>Transaction updated</Text>
            <Text style={styles.meta}>Dashboard totals and goals have been recalculated.</Text>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.fieldLabel}>Type</Text>
          <View style={styles.segment}>
            <Pressable onPress={() => selectType('income')} style={[styles.segmentOption, type === 'income' && styles.segmentActive]}>
              <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
            </Pressable>
            <Pressable onPress={() => selectType('expense')} style={[styles.segmentOption, type === 'expense' && styles.segmentActive]}>
              <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
            </Pressable>
          </View>

          <FormField label="Title" value={title} onChangeText={setTitle} error={errors.title} placeholder="Transaction title" />
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

          <FormField label="Date" value={date} onChangeText={setDate} error={errors.date} />

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

          <PrimaryButton label="Save changes" icon={Check} onPress={handleSave} />
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function CloseButton() {
  return (
    <View style={styles.topRow}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
        <X color={colors.ink} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    backgroundColor: colors.backgroundWarm,
    flex: 1,
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
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
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
    justifyContent: 'center',
    minHeight: 42,
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
});
