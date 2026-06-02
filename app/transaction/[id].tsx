import * as Haptics from 'expo-haptics';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, CalendarDays, FileText, Pencil, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useSoloFlowStore((state) => state.clients);
  const transaction = useSoloFlowStore((state) => state.transactions.find((item) => item.id === id));
  const deleteTransaction = useSoloFlowStore((state) => state.deleteTransaction);
  const client = clients.find((item) => item.id === transaction?.clientId);

  if (!transaction) {
    return (
      <Screen>
        <BackButton />
        <Card>
          <Text style={styles.title}>Transaction not found</Text>
          <Text style={styles.meta}>This record may have been reset.</Text>
        </Card>
      </Screen>
    );
  }

  const isIncome = transaction.type === 'income';
  const DirectionIcon = isIncome ? ArrowUpRight : ArrowDownRight;

  function handleDelete() {
    if (!transaction) {
      return;
    }

    deleteTransaction(transaction.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  return (
    <Screen>
      <BackButton />
      <AppHeader eyebrow="Transaction" title={transaction.title} subtitle={`${transaction.category} · ${formatShortDate(transaction.date)}`} />

      <View style={styles.hero}>
        <View style={[styles.heroIcon, isIncome ? styles.incomeSoft : styles.expenseSoft]}>
          <DirectionIcon color={isIncome ? colors.success : colors.danger} size={26} />
        </View>
        <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount, profile.currency)}
        </Text>
        <View style={styles.badgeRow}>
          <Badge label={transaction.status} status={transaction.status} />
          <Badge label={transaction.type} />
        </View>
      </View>

      <Card>
        <DetailRow label="Client" value={client?.name ?? 'Not linked'} />
        <DetailRow label="Category" value={transaction.category} />
        <DetailRow label="Date" value={formatShortDate(transaction.date)} icon={CalendarDays} />
        <DetailRow label="Attachment" value={transaction.attachmentName ?? 'No attachment'} icon={FileText} />
      </Card>

      <Card>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.meta}>{transaction.notes || 'No notes added for this transaction.'}</Text>
      </Card>

      <PrimaryButton
        label="Edit transaction"
        icon={Pencil}
        onPress={() => router.push(`/transaction/edit/${transaction.id}` as Href)}
      />
      <PrimaryButton label="Delete transaction" icon={Trash2} tone="dark" onPress={handleDelete} />
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

function DetailRow({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof CalendarDays }) {
  return (
    <View style={styles.detailRow}>
      {Icon ? (
        <View style={styles.rowIcon}>
          <Icon color={colors.primary} size={17} />
        </View>
      ) : null}
      <View style={styles.detailCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.xl,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 56,
  },
  amount: {
    fontSize: 34,
    fontWeight: '900',
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.danger,
  },
  incomeSoft: {
    backgroundColor: colors.successSoft,
  },
  expenseSoft: {
    backgroundColor: colors.dangerSoft,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  detailRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 34,
  },
  detailCopy: {
    flex: 1,
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
});
