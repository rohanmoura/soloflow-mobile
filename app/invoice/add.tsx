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

const statuses: MoneyStatus[] = ['pending', 'draft', 'overdue'];

export default function AddInvoiceScreen() {
  const params = useLocalSearchParams<{ clientId?: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const addInvoice = useSoloFlowStore((state) => state.addInvoice);
  const [clientId, setClientId] = useState(params.clientId ?? clients[0]?.id ?? '');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<MoneyStatus>('pending');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSave() {
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

    addInvoice({
      clientId: result.data.clientId,
      title: result.data.service,
      service: result.data.service,
      amount: result.data.amount,
      currency: profile.currency,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: result.data.dueDate,
      status,
      notes: result.data.notes,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <CloseButton />
        <AppHeader eyebrow="New invoice" title="Create invoice" subtitle="Add a lightweight invoice for client payments." />

        <Card>
          <Text style={styles.fieldLabel}>Client</Text>
          <View style={styles.chipGrid}>
            {clients.map((client) => (
              <Chip key={client.id} label={client.name} selected={clientId === client.id} onPress={() => setClientId(client.id)} />
            ))}
          </View>
          {errors.clientId ? <Text style={styles.errorText}>{errors.clientId}</Text> : null}

          <FormField label="Service" value={service} onChangeText={setService} error={errors.service} placeholder="Product strategy audit" />
          <FormField
            label={`Amount (${profile.currency})`}
            value={amount}
            onChangeText={setAmount}
            error={errors.amount}
            keyboardType="decimal-pad"
            placeholder="900"
          />
          <FormField label="Due date" value={dueDate} onChangeText={setDueDate} error={errors.dueDate} placeholder="2026-06-15" />

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statuses.map((item) => (
              <Chip key={item} label={item} selected={status === item} onPress={() => setStatus(item)} />
            ))}
          </View>

          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline style={styles.notesInput} />
          <PrimaryButton label="Save invoice" icon={Check} onPress={handleSave} />
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
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: -spacing.md,
  },
  notesInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
