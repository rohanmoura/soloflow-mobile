import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
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

export default function AddClientScreen() {
  const addClient = useSoloFlowStore((state) => state.addClient);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<ClientStatus>('prospect');
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSave() {
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

    addClient({ ...result.data, status });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
      <Screen>
        <CloseButton />
        <AppHeader eyebrow="New client" title="Add client" subtitle="Save contact and billing context for future invoices." />

        <Card>
          <FormField label="Client name" value={name} onChangeText={setName} error={errors.name} placeholder="Acme Studio" />
          <FormField label="Company/type" value={company} onChangeText={setCompany} error={errors.company} placeholder="Startup client" />
          <FormField
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="client@example.com"
          />
          <FormField label="Phone" value={phone} onChangeText={setPhone} error={errors.phone} placeholder="+1 555 0100" />
          <FormField label="Category" value={category} onChangeText={setCategory} error={errors.category} placeholder="SaaS founder" />

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipGrid}>
            {statuses.map((item) => (
              <Chip key={item} label={item.replace('_', ' ')} selected={status === item} onPress={() => setStatus(item)} />
            ))}
          </View>

          <PrimaryButton label="Save client" icon={Check} onPress={handleSave} />
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
});
