import { Link, router, type Href } from 'expo-router';
import { Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { useClientSummaries, useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { ClientStatus } from '@/types/finance';
import { formatCurrency } from '@/utils/currency';
import { formatShortDate } from '@/utils/date';

const statusFilters: Array<{ label: string; value: 'all' | ClientStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Waiting', value: 'waiting_payment' },
  { label: 'Prospects', value: 'prospect' },
  { label: 'Past', value: 'past_client' },
];

export default function ClientsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const clients = useClientSummaries();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const unpaidTotal = clients.reduce((sum, client) => sum + client.unpaidAmount, 0);
  const filteredClients = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      const matchesQuery =
        needle.length === 0 ||
        [client.name, client.company, client.category, client.email, client.status]
          .join(' ')
          .toLowerCase()
          .includes(needle);

      return matchesStatus && matchesQuery;
    });
  }, [clients, query, statusFilter]);

  return (
    <Screen>
      <AppHeader
        eyebrow={`${clients.length} clients`}
        title="Client money"
        subtitle={`${formatCurrency(unpaidTotal, profile.currency)} unpaid across invoices.`}
      />
      <PrimaryButton label="Add client" icon={Plus} onPress={() => router.push('/client/add' as Href)} />

      <View style={styles.searchShell}>
        <Search color={colors.textMuted} size={18} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          placeholder="Search clients, company, status"
          placeholderTextColor={colors.textSoft}
          style={styles.searchInput}
          value={query}
        />
        <View style={styles.filterButton}>
          <SlidersHorizontal color={colors.surface} size={17} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRail}>
        {statusFilters.map((filter) => (
          <View key={filter.value} style={styles.filterItem}>
            <Chip
              label={filter.label}
              onPress={() => setStatusFilter(filter.value)}
              selected={statusFilter === filter.value}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.resultRow}>
        <Text style={styles.resultTitle}>Client list</Text>
        <Text style={styles.resultCount}>{filteredClients.length} shown</Text>
      </View>

      {filteredClients.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No clients match this view</Text>
          <Text style={styles.emptyCopy}>Try another status or search by client, company, or email.</Text>
        </Card>
      ) : null}

      {filteredClients.map((client) => (
        <Link href={`/client/${client.id}` as Href} key={client.id} asChild>
          <Pressable>
            <Card>
              <View style={styles.headerRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{client.avatar}</Text>
                </View>
                <View style={styles.copy}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.meta}>{client.company}</Text>
                </View>
                <Badge label={client.status.replace('_', ' ')} status={client.status} />
              </View>

              <View style={styles.moneyGrid}>
                <View>
                  <Text style={styles.label}>Billed</Text>
                  <Text style={styles.value}>{formatCurrency(client.totalBilled, profile.currency)}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Paid</Text>
                  <Text style={[styles.value, styles.paid]}>{formatCurrency(client.totalPaid, profile.currency)}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Unpaid</Text>
                  <Text style={[styles.value, client.unpaidAmount > 0 ? styles.unpaid : styles.paid]}>
                    {formatCurrency(client.unpaidAmount, profile.currency)}
                  </Text>
                </View>
              </View>

              <Text style={styles.footer}>
                Last payment {client.lastPaymentDate ? formatShortDate(client.lastPaymentDate) : 'not recorded yet'}
              </Text>
            </Card>
          </Pressable>
        </Link>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  searchShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 54,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    minHeight: 48,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  filterRail: {
    marginBottom: spacing.lg,
  },
  filterItem: {
    marginRight: spacing.sm,
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  resultCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 42,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  clientName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  moneyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  paid: {
    color: colors.success,
  },
  unpaid: {
    color: colors.warning,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.lg,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});
