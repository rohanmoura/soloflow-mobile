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
import type { ClientStatus } from '@/types/finance';
import { clientSchema } from '@/utils/validators';

type FormErrors = Partial<Record<'name' | 'company' | 'email' | 'phone' | 'category', string>>;

const statuses: ClientStatus[] = ['active', 'waiting_payment', 'prospect', 'past_client'];

export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const client = useSoloFlowStore((state) => state.clients.find((item) => item.id === id));
  const updateClient = useSoloFlowStore((state) => state.updateClient);
  const [name, setName] = useState(client?.name ?? '');
  const [company, setCompany] = useState(client?.company ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [category, setCategory] = useState(client?.category ?? '');
  const [status, setStatus] = useState<ClientStatus>(client?.status ?? 'prospect');
  const [errors, setErrors] = useState<FormErrors>({});

  if (!client) {
    return (
      <Screen>
        <CloseButton />
        <Card>
          <Text style={styles.title}>Client not found</Text>
          <Text style={styles.meta}>This record may have been reset.</Text>
        </Card>
      </Screen>
    );
  }

  function handleSave() {
    if (!client) {
      return;
    }

    const result = clientSchema.safeParse({ name, company, email, phone, category });

    if (!result.success) {
      const nextErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key === 'name' || key === 'company' || key === 'email' || key === 'phone' || key === 'category') {
          nextErrors[key] = issue.message;
        }
      });
      setErrors(nextErrors);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    updateClient(client.id, { ...result.data, status });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <CloseButton />
        <AppHeader eyebrow="Edit client" title={client.name} subtitle="Update contact, category, and payment status." />

        <Card>
          <FormField label="Client name" value={name} onChangeText={setName} error={errors.name} />
          <FormField label="Company/type" value={company} onChangeText={setCompany} error={errors.company} />
          <FormField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <FormField label="Phone" value={phone} onChangeText={setPhone} error={errors.phone} />
          <FormField label="Category" value={category} onChangeText={setCategory} error={errors.category} />

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statuses.map((item) => (
              <Chip key={item} label={item.replace('_', ' ')} selected={status === item} onPress={() => setStatus(item)} />
            ))}
          </View>

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
});
