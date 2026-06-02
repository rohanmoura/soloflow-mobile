import { Link, router, type Href, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, FilePlus2, Mail, Pencil, Phone, ReceiptText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useClientSummaries, useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const invoices = useSoloFlowStore((state) => state.invoices);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const clients = useClientSummaries();
  const client = clients.find((item) => item.id === id);

  if (!client) {
    return (
      <Screen>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.ink} size={21} />
        </Pressable>
        <Card>
          <Text style={styles.emptyTitle}>Client not found</Text>
          <Text style={styles.meta}>This record may have been reset or removed.</Text>
        </Card>
      </Screen>
    );
  }

  const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id);
  const clientTransactions = transactions.filter((transaction) => transaction.clientId === client.id).slice(0, 4);

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft color={colors.ink} size={21} />
      </Pressable>

      <AppHeader eyebrow={client.category} title={client.name} subtitle={`${client.company} · ${client.status.replace('_', ' ')}`} />

      <Card tone="strong">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{client.avatar}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.inverseTitle}>{client.name}</Text>
            <Badge label={client.status.replace('_', ' ')} status={client.status} />
          </View>
        </View>
        <View style={styles.contactRow}>
          <Mail color={colors.primary} size={16} />
          <Text style={styles.inverseMeta}>{client.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Phone color={colors.primary} size={16} />
          <Text style={styles.inverseMeta}>{client.phone}</Text>
        </View>
      </Card>

      <PrimaryButton
        label="Edit client"
        icon={Pencil}
        onPress={() => router.push(`/client/edit/${client.id}` as Href)}
      />
      <PrimaryButton
        label="Create invoice"
        icon={FilePlus2}
        tone="dark"
        onPress={() => router.push(`/invoice/add?clientId=${client.id}` as Href)}
      />

      <View style={styles.moneyGrid}>
        <Card>
          <Text style={styles.label}>Billed</Text>
          <Text style={styles.value}>{formatCurrency(client.totalBilled, profile.currency)}</Text>
        </Card>
        <Card>
          <Text style={styles.label}>Unpaid</Text>
          <Text style={[styles.value, client.unpaidAmount > 0 ? styles.warning : styles.success]}>
            {formatCurrency(client.unpaidAmount, profile.currency)}
          </Text>
        </Card>
      </View>

      <SectionHeader title="Invoices" detail={`${clientInvoices.length} records`} />
      {clientInvoices.length > 0 ? (
        clientInvoices.map((invoice) => (
          <Link href={`/invoice/${invoice.id}` as Href} key={invoice.id} asChild>
            <Pressable>
              <Card>
                <View style={styles.invoiceRow}>
                  <View style={styles.invoiceIcon}>
                    <ReceiptText color={colors.primary} size={20} />
                  </View>
                  <View style={styles.invoiceCopy}>
                    <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                    <Text style={styles.meta}>Due {formatShortDate(invoice.dueDate)}</Text>
                  </View>
                  <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount, profile.currency)}</Text>
                </View>
                <Badge label={invoice.status} status={invoice.status} />
              </Card>
            </Pressable>
          </Link>
        ))
      ) : (
        <Card>
          <View style={styles.invoiceRow}>
            <View style={styles.invoiceIcon}>
              <ReceiptText color={colors.primary} size={20} />
            </View>
            <View style={styles.invoiceCopy}>
              <Text style={styles.invoiceNumber}>No invoices yet</Text>
              <Text style={styles.meta}>New invoices for this client will appear here.</Text>
            </View>
          </View>
        </Card>
      )}

      <SectionHeader title="Recent activity" detail={`${clientTransactions.length} shown`} />
      {clientTransactions.length > 0 ? (
        clientTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <View style={styles.invoiceRow}>
              <View style={styles.invoiceCopy}>
                <Text style={styles.invoiceNumber}>{transaction.title}</Text>
                <Text style={styles.meta}>
                  {transaction.category} · {formatShortDate(transaction.date)}
                </Text>
              </View>
              <Text style={[styles.invoiceAmount, transaction.type === 'income' ? styles.success : styles.danger]}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount, profile.currency)}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.meta}>No linked transactions yet.</Text>
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
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 54,
  },
  avatarText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  inverseTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inverseMeta: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 14,
  },
  moneyGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  warning: {
    color: colors.warning,
  },
  success: {
    color: colors.success,
  },
  danger: {
    color: colors.danger,
  },
  invoiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  invoiceIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  invoiceCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  invoiceNumber: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  invoiceAmount: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    maxWidth: 108,
    textAlign: 'right',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
});
