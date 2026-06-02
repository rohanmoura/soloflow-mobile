import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus } from '@/types/finance';
import { invoiceSchema } from '@/utils/validators';

type FormErrors = Partial<Record<'clientId' | 'service' | 'amount' | 'dueDate', string>>;

const statuses: MoneyStatus[] = ['pending', 'paid', 'overdue', 'draft', 'cancelled'];

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const invoice = useSoloFlowStore((state) => state.invoices.find((item) => item.id === id));
  const updateInvoice = useSoloFlowStore((state) => state.updateInvoice);
  const [clientId, setClientId] = useState(invoice?.clientId ?? clients[0]?.id ?? '');
  const [service, setService] = useState(invoice?.lineItems[0]?.description ?? invoice?.title ?? '');
  const [amount, setAmount] = useState(invoice ? String(invoice.amount) : '');
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<MoneyStatus>(invoice?.status ?? 'pending');
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  if (!invoice) {
    return (
      <Screen>
        <CloseButton />
        <Card>
          <Text style={styles.title}>Invoice not found</Text>
          <Text style={styles.meta}>This invoice may have been reset.</Text>
        </Card>
      </Screen>
    );
  }

  function handleSave() {
    if (!invoice) {
      return;
    }

    const result = invoiceSchema.safeParse({
      clientId,
      service,
      amount: Number(amount.replace(/,/g, '')),
      dueDate,
      notes,
    });

    if (!result.success) {
      const nextErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'clientId' || key === 'service' || key === 'amount' || key === 'dueDate') {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    updateInvoice(invoice.id, {
      clientId: result.data.clientId,
      title: result.data.service,
      amount: result.data.amount,
      dueDate: result.data.dueDate,
      status,
      notes: result.data.notes,
      lineItems: [
        {
          id: invoice.lineItems[0]?.id ?? `line-edit-${Date.now()}`,
          description: result.data.service,
          quantity: 1,
          rate: result.data.amount,
          amount: result.data.amount,
        },
      ],
      paidDate: status === 'paid' ? invoice.paidDate ?? new Date().toISOString().slice(0, 10) : undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <CloseButton />
        <AppHeader eyebrow="Edit invoice" title={invoice.invoiceNumber} subtitle="Update billing detail, status, and due date." />

        <Card>
          <Text style={styles.fieldLabel}>Client</Text>
          <View style={styles.chipGrid}>
            {clients.map((client) => (
              <Chip key={client.id} label={client.name} selected={clientId === client.id} onPress={() => setClientId(client.id)} />
            ))}
          </View>

          <FormField label="Service" value={service} onChangeText={setService} error={errors.service} />
          <FormField
            label={`Amount (${profile.currency})`}
            value={amount}
            onChangeText={setAmount}
            error={errors.amount}
            keyboardType="decimal-pad"
          />
          <FormField label="Due date" value={dueDate} onChangeText={setDueDate} error={errors.dueDate} />

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statuses.map((item) => (
              <Chip key={item} label={item} selected={status === item} onPress={() => setStatus(item)} />
            ))}
          </View>

          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline style={styles.notesInput} />
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
