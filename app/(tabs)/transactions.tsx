import { Link, type Href } from 'expo-router';
import { Search, SlidersHorizontal, WalletCards } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus, TransactionType } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

type TypeFilter = 'all' | TransactionType;
type StatusFilter = 'all' | MoneyStatus;

const typeFilters: TypeFilter[] = ['all', 'income', 'expense'];
const statusFilters: StatusFilter[] = ['all', 'paid', 'pending', 'overdue', 'draft', 'cancelled'];

export default function TransactionsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesQuery =
        !normalizedQuery ||
        transaction.title.toLowerCase().includes(normalizedQuery) ||
        transaction.category.toLowerCase().includes(normalizedQuery) ||
        transaction.notes?.toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, statusFilter, transactions, typeFilter]);

  return (
    <Screen>
      <AppHeader
        eyebrow="Ledger"
        title="Money activity"
        subtitle="Track client payments, costs, and invoice-linked records."
      />

      <View style={styles.searchBox}>
        <Search color={colors.textMuted} size={18} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Search by title, note, or category"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={query}
        />
      </View>

      <View style={styles.filterHeader}>
        <SlidersHorizontal color={colors.primary} size={18} />
        <Text style={styles.filterTitle}>Filters</Text>
      </View>
      <View style={styles.filterRow}>
        {typeFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter === 'all' ? 'All types' : filter}
            selected={typeFilter === filter}
            onPress={() => setTypeFilter(filter)}
          />
        ))}
      </View>
      <View style={styles.filterRow}>
        {statusFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter === 'all' ? 'All statuses' : filter}
            selected={statusFilter === filter}
            onPress={() => setStatusFilter(filter)}
          />
        ))}
      </View>

      <SectionHeader title="Results" detail={`${filteredTransactions.length} shown`} />

      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction) => (
          <Link href={`/transaction/${transaction.id}` as Href} key={transaction.id} asChild>
            <Pressable>
              <Card>
                <View style={styles.row}>
                  <View style={styles.copy}>
                    <Text style={styles.itemTitle}>{transaction.title}</Text>
                    <Text style={styles.meta}>
                      {transaction.category} · {formatShortDate(transaction.date)}
                    </Text>
                  </View>
                  <Text style={[styles.amount, transaction.type === 'income' ? styles.income : styles.expense]}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, profile.currency)}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  <Badge label={transaction.status} status={transaction.status} />
                  <Badge label={transaction.type} />
                </View>
              </Card>
            </Pressable>
          </Link>
        ))
      ) : (
        <Card>
          <View style={styles.emptyIcon}>
            <WalletCards color={colors.primary} size={26} />
          </View>
          <Text style={styles.emptyTitle}>No matching records</Text>
          <Text style={styles.emptyText}>Try a broader search or switch filters back to all types and statuses.</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    ...{
      shadowColor: '#0F241F',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 1,
    },
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 46,
    marginLeft: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  filterTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  copy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    maxWidth: 112,
    textAlign: 'right',
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.danger,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 52,
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
