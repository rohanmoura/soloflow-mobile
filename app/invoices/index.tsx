import * as Haptics from 'expo-haptics';
import { Link, router, type Href } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock3, FileText, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

type InvoiceFilter = 'all' | MoneyStatus;

const filters: InvoiceFilter[] = ['all', 'paid', 'pending', 'overdue', 'draft', 'cancelled'];

export default function InvoicesScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const invoices = useSoloFlowStore((state) => state.invoices);
  const markInvoicePaid = useSoloFlowStore((state) => state.markInvoicePaid);
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  const filteredInvoices = useMemo(
    () => invoices.filter((invoice) => filter === 'all' || invoice.status === filter),
    [filter, invoices],
  );
  const unpaidTotal = invoices
    .filter((invoice) => invoice.status === 'pending' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  function getClientName(clientId: string) {
    return clients.find((client) => client.id === clientId)?.name ?? 'Unknown client';
  }

  function handleMarkPaid(invoiceId: string) {
    markInvoicePaid(invoiceId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft color={colors.ink} size={21} />
      </Pressable>

      <AppHeader
        eyebrow="Invoices"
        title="Payments"
        subtitle={`${formatCurrency(unpaidTotal, profile.currency)} pending or overdue across current client invoices.`}
      />
      <PrimaryButton label="Create invoice" icon={Plus} onPress={() => router.push('/invoice/add' as Href)} />

      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Chip
            key={item}
            label={item === 'all' ? 'All invoices' : item}
            selected={filter === item}
            onPress={() => setFilter(item)}
          />
        ))}
      </View>

      <SectionHeader title="Invoice list" detail={`${filteredInvoices.length} shown`} />

      {filteredInvoices.length > 0 ? (
        filteredInvoices.map((invoice) => (
          <Link href={`/invoice/${invoice.id}` as Href} key={invoice.id} asChild>
            <Pressable>
              <Card>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceIcon}>
                    <FileText color={colors.primary} size={22} />
                  </View>
                  <View style={styles.invoiceCopy}>
                    <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.meta}>{getClientName(invoice.clientId)}</Text>
                  </View>
                  <Badge label={invoice.status} status={invoice.status} />
                </View>

                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amount}>{formatCurrency(invoice.amount, profile.currency)}</Text>
                  </View>
                  <View style={styles.dueCopy}>
                    <Text style={styles.label}>Due</Text>
                    <Text style={styles.dueText}>{formatShortDate(invoice.dueDate)}</Text>
                  </View>
                </View>

                <View style={styles.timeline}>
                  <Clock3 color={invoice.status === 'overdue' ? colors.danger : colors.textMuted} size={16} />
                  <Text style={styles.timelineText}>
                    {invoice.paidDate ? `Paid on ${formatShortDate(invoice.paidDate)}` : `Issued ${formatShortDate(invoice.issueDate)}`}
                  </Text>
                </View>

                {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                  <PrimaryButton label="Mark as paid" icon={CheckCircle2} onPress={() => handleMarkPaid(invoice.id)} />
                ) : null}
              </Card>
            </Pressable>
          </Link>
        ))
      ) : (
        <Card>
          <Text style={styles.emptyTitle}>No invoices here</Text>
          <Text style={styles.emptyText}>Switch filters to view another invoice status.</Text>
        </Card>
      )}
    </Screen>
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  invoiceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  invoiceIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  invoiceCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  invoiceNumber: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  amount: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  dueCopy: {
    alignItems: 'flex-end',
  },
  dueText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  timeline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  timelineText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
