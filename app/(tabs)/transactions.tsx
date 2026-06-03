import { router, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pencil, Search, SlidersHorizontal, Trash2, WalletCards } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { MoneyStatus, TransactionType } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';
import { formatMonthLabel, formatShortDate } from '@/utils/date';

type TypeFilter = 'all' | TransactionType;
type StatusFilter = 'all' | MoneyStatus;

const typeFilters: TypeFilter[] = ['all', 'income', 'expense'];
const statusFilters: StatusFilter[] = ['all', 'paid', 'pending', 'overdue', 'draft', 'cancelled'];

export default function TransactionsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const clients = useSoloFlowStore((state) => state.clients);
  const deleteTransaction = useSoloFlowStore((state) => state.deleteTransaction);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const categoryFilters = useMemo(() => ['all', ...new Set(transactions.map((transaction) => transaction.category))], [transactions]);
  const clientFilters = useMemo(
    () => ['all', ...clients.filter((client) => transactions.some((transaction) => transaction.clientId === client.id)).map((client) => client.id)],
    [clients, transactions],
  );
  const monthFilters = useMemo(
    () => ['all', ...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)).sort((a, b) => b.localeCompare(a)))],
    [transactions],
  );

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
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesClient = clientFilter === 'all' || transaction.clientId === clientFilter;
      const matchesMonth = monthFilter === 'all' || transaction.date.slice(0, 7) === monthFilter;

      return matchesQuery && matchesType && matchesStatus && matchesCategory && matchesClient && matchesMonth;
    });
  }, [categoryFilter, clientFilter, monthFilter, query, statusFilter, transactions, typeFilter]);

  const hasAdvancedFilters = categoryFilter !== 'all' || clientFilter !== 'all' || monthFilter !== 'all';

  function clearAdvancedFilters() {
    setCategoryFilter('all');
    setClientFilter('all');
    setMonthFilter('all');
  }

  function getClientName(clientId: string) {
    return clients.find((client) => client.id === clientId)?.name ?? 'Unknown client';
  }

  function showActions(transactionId: string) {
    setActiveActionId((currentId) => (currentId === transactionId ? null : transactionId));
    Haptics.selectionAsync();
  }

  function handleDelete(transactionId: string) {
    deleteTransaction(transactionId);
    setActiveActionId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

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
        {hasAdvancedFilters ? (
          <Pressable accessibilityRole="button" onPress={clearAdvancedFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
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

      <Text style={styles.filterSubhead}>Category</Text>
      <View style={styles.filterRow}>
        {categoryFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter === 'all' ? 'All categories' : filter}
            selected={categoryFilter === filter}
            onPress={() => setCategoryFilter(filter)}
          />
        ))}
      </View>

      <Text style={styles.filterSubhead}>Client</Text>
      <View style={styles.filterRow}>
        {clientFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter === 'all' ? 'All clients' : getClientName(filter)}
            selected={clientFilter === filter}
            onPress={() => setClientFilter(filter)}
          />
        ))}
      </View>

      <Text style={styles.filterSubhead}>Month</Text>
      <View style={styles.filterRow}>
        {monthFilters.map((filter) => (
          <Chip
            key={filter}
            label={filter === 'all' ? 'All months' : formatMonthLabel(new Date(`${filter}-01T00:00:00`))}
            selected={monthFilter === filter}
            onPress={() => setMonthFilter(filter)}
          />
        ))}
      </View>

      <SectionHeader title="Results" detail={`${filteredTransactions.length} shown`} />

      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction) => (
          <Pressable
            key={transaction.id}
            onLongPress={() => showActions(transaction.id)}
            onPress={() => router.push(`/transaction/${transaction.id}` as Href)}>
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
                {activeActionId === transaction.id ? (
                  <View style={styles.actionMenu}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push(`/transaction/edit/${transaction.id}` as Href)}
                      style={styles.actionButton}>
                      <Pencil color={colors.primary} size={16} />
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleDelete(transaction.id)}
                      style={[styles.actionButton, styles.deleteAction]}>
                      <Trash2 color={colors.danger} size={16} />
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </Pressable>
                  </View>
                ) : null}
              </Card>
          </Pressable>
        ))
      ) : (
        <EmptyState
          icon={WalletCards}
          title="No matching records"
          message="Try a broader search or clear type, status, category, client, and month filters."
        />
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
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },
  filterSubhead: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  clearButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearText: {
    color: colors.ink,
    fontSize: 12,
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
  actionMenu: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 42,
  },
  deleteAction: {
    backgroundColor: colors.dangerSoft,
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  deleteText: {
    color: colors.danger,
  },
});
