import * as Haptics from 'expo-haptics';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BellRing, CheckCircle2, FileText, Pencil } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { shareInvoicePdf } from '@/services/invoiceExport';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const invoice = useSoloFlowStore((state) => state.invoices.find((item) => item.id === id));
  const reminders = useSoloFlowStore((state) => state.reminders);
  const paymentRemindersEnabled = useSoloFlowStore((state) => state.preferences.paymentReminders);
  const markInvoicePaid = useSoloFlowStore((state) => state.markInvoicePaid);
  const queueInvoiceReminder = useSoloFlowStore((state) => state.queueInvoiceReminder);
  const [reminderStatus, setReminderStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const client = clients.find((item) => item.id === invoice?.clientId);
  const queuedReminder = reminders.find((reminder) => reminder.invoiceId === invoice?.id && reminder.status === 'queued');

  if (!invoice) {
    return (
      <Screen>
        <BackButton />
        <Card>
          <Text style={styles.title}>Invoice not found</Text>
          <Text style={styles.meta}>This invoice may have been reset.</Text>
        </Card>
      </Screen>
    );
  }

  function handleMarkPaid() {
    if (!invoice) {
      return;
    }

    markInvoicePaid(invoice.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleReminder() {
    if (!invoice) {
      return;
    }

    if (!paymentRemindersEnabled) {
      setReminderStatus('Payment reminders are off in Settings.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    queueInvoiceReminder(invoice.id);
    setReminderStatus(`Reminder queued for ${client?.name ?? 'this client'}.`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleSharePdf() {
    if (!invoice) {
      return;
    }

    await shareInvoicePdf({ invoice, client, profile });
    setShareStatus('Invoice PDF is ready to share.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen>
      <BackButton />
      <AppHeader eyebrow="Invoice detail" title={invoice.invoiceNumber} subtitle={client?.name ?? 'Unknown client'} />

      <View style={styles.hero}>
        <View style={styles.fileIcon}>
          <FileText color={colors.primary} size={26} />
        </View>
        <Text style={styles.amount}>{formatCurrency(invoice.amount, profile.currency)}</Text>
        <Badge label={invoice.status} status={invoice.status} />
      </View>

      <Card>
        <DetailRow label="Client" value={client?.name ?? 'Unknown client'} />
        <DetailRow label="Issue date" value={formatShortDate(invoice.issueDate)} />
        <DetailRow label="Due date" value={formatShortDate(invoice.dueDate)} />
        <DetailRow label="Paid date" value={invoice.paidDate ? formatShortDate(invoice.paidDate) : 'Not paid yet'} />
      </Card>

      <SectionHeader title="Line items" />
      {invoice.lineItems.map((item) => (
        <Card key={item.id}>
          <View style={styles.lineRow}>
            <View style={styles.lineCopy}>
              <Text style={styles.title}>{item.description}</Text>
              <Text style={styles.meta}>
                {item.quantity} x {formatCurrency(item.rate, profile.currency)}
              </Text>
            </View>
            <Text style={styles.lineAmount}>{formatCurrency(item.amount, profile.currency)}</Text>
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.title}>Payment timeline</Text>
        <Text style={styles.meta}>
          Issued {formatShortDate(invoice.issueDate)}. Due {formatShortDate(invoice.dueDate)}.
          {invoice.paidDate ? ` Paid ${formatShortDate(invoice.paidDate)}.` : ' Reminder action is ready.'}
        </Text>
        {queuedReminder ? <Text style={styles.successText}>Queued {formatShortDate(queuedReminder.queuedAt)} for follow-up.</Text> : null}
        {reminderStatus && !queuedReminder ? <Text style={styles.successText}>{reminderStatus}</Text> : null}
        {shareStatus ? <Text style={styles.successText}>{shareStatus}</Text> : null}
      </Card>

      <View style={styles.actions}>
        <PrimaryButton
          label="Edit invoice"
          icon={Pencil}
          onPress={() => router.push(`/invoice/edit/${invoice.id}` as Href)}
        />
        <PrimaryButton label="Share invoice PDF" icon={FileText} onPress={handleSharePdf} />

        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
          <>
            <PrimaryButton label="Mark paid" icon={CheckCircle2} onPress={handleMarkPaid} />
            <PrimaryButton
              label={queuedReminder || reminderStatus ? 'Reminder queued' : 'Queue reminder'}
              icon={BellRing}
              tone="dark"
              onPress={handleReminder}
            />
          </>
        ) : null}
      </View>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 42,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.xl,
  },
  fileIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  amount: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  detailRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  lineRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lineCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  lineAmount: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  actions: {
    gap: spacing.md,
  },
  successText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
});
