import * as Haptics from 'expo-haptics';
import { router, type Href } from 'expo-router';
import { ArrowLeft, Bell, CheckCircle2, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

export default function RemindersScreen() {
  const reminders = useSoloFlowStore((state) => state.reminders);
  const markReminderSent = useSoloFlowStore((state) => state.markReminderSent);
  const deleteReminder = useSoloFlowStore((state) => state.deleteReminder);

  function handleSent(id: string) {
    markReminderSent(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleDelete(id: string) {
    deleteReminder(id);
    Haptics.selectionAsync();
  }

  return (
    <Screen>
      <BackButton />
      <AppHeader
        eyebrow={`${reminders.length} reminders`}
        title="Reminder queue"
        subtitle="Track invoice follow-ups before you send them to clients."
      />

      {reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders queued"
          message="Open an unpaid invoice and queue a follow-up when a client needs a nudge."
          actionLabel="View invoices"
          onAction={() => router.push('/invoices' as Href)}
        />
      ) : (
        reminders.map((reminder) => (
          <Card key={reminder.id}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.title}>{reminder.invoiceNumber}</Text>
                <Text style={styles.meta}>
                  {reminder.clientName} · due {formatShortDate(reminder.dueDate)}
                </Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(reminder.amount, reminder.currency)}</Text>
            </View>
            <Text style={[styles.status, reminder.status === 'sent' ? styles.sent : styles.queued]}>
              {reminder.status === 'sent'
                ? `Marked sent ${reminder.sentAt ? formatShortDate(reminder.sentAt) : ''}`
                : `Queued ${formatShortDate(reminder.queuedAt)}`}
            </Text>
            <View style={styles.actions}>
              <PrimaryButton
                label={reminder.status === 'sent' ? 'Sent' : 'Mark sent'}
                icon={CheckCircle2}
                disabled={reminder.status === 'sent'}
                onPress={() => handleSent(reminder.id)}
              />
              <Pressable accessibilityRole="button" onPress={() => handleDelete(reminder.id)} style={styles.deleteButton}>
                <Trash2 color={colors.danger} size={18} />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

function BackButton() {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
      <ArrowLeft color={colors.ink} size={21} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  amount: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  status: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  queued: {
    color: colors.warning,
  },
  sent: {
    color: colors.success,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
});
