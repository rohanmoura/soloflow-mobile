import { Link, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  FilePlus2,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useDashboardSummary, useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCompactCurrency, formatCurrency } from '@/utils/currency';
import { formatMonthLabel, formatShortDate } from '@/utils/date';

export default function HomeScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const invoices = useSoloFlowStore((state) => state.invoices);
  const dashboard = useDashboardSummary();
  const recentTransactions = transactions.slice(0, 3);
  const nextInvoice = invoices.find((invoice) => invoice.status === 'overdue') ?? invoices.find((invoice) => invoice.status === 'pending');

  return (
    <Screen>
      <View style={styles.topBar}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KM</Text>
          </View>
          <View>
          <Text style={styles.month}>{formatMonthLabel(new Date(`${dashboard.month}-01T00:00:00`))}</Text>
            <Text style={styles.greeting}>Hello, {profile.name.split(' ')[0]}</Text>
          </View>
        </View>
        <View style={styles.setupPill}>
          <Text style={styles.setupText}>92%</Text>
        </View>
      </View>

      <LinearGradient colors={['#2F7AF8', '#12B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <Text style={styles.balanceLabel}>Net profit</Text>
          <Badge label={`${dashboard.revenueProgress}% goal`} />
        </View>
        <Text style={styles.balanceValue}>{formatCurrency(dashboard.profit, profile.currency)}</Text>
        <View style={styles.balanceMetaRow}>
          <Text style={styles.balanceMeta}>{formatCurrency(dashboard.income, profile.currency)} in</Text>
          <Text style={styles.balanceDot}>•</Text>
          <Text style={styles.balanceMeta}>{formatCurrency(dashboard.expenses, profile.currency)} out</Text>
        </View>
        <View style={styles.heroActions}>
          <Link href={'/transaction/add?type=income' as Href} asChild>
            <Pressable style={styles.addButton}>
              <Plus color={colors.surface} size={17} />
              <Text style={styles.addButtonText}>Income</Text>
            </Pressable>
          </Link>
          <Link href={'/transaction/add?type=expense' as Href} asChild>
            <Pressable style={styles.outlineButton}>
              <TrendingDown color="#DDEBE5" size={17} />
              <Text style={styles.outlineButtonText}>Expense</Text>
            </Pressable>
          </Link>
        </View>
      </LinearGradient>

      <Link href={'/transactions' as Href} asChild>
        <Pressable style={styles.searchAction}>
          <Search color={colors.textMuted} size={17} />
          <Text style={styles.searchText}>Search income, expenses, notes</Text>
          <View style={styles.filterDot}>
            <SlidersHorizontal color={colors.surface} size={16} />
          </View>
        </Pressable>
      </Link>

      <View style={styles.quickRail}>
        <Link href={'/invoice/add' as Href} asChild>
          <Pressable style={styles.quickButton}>
            <FilePlus2 color={colors.ink} size={17} />
            <Text style={styles.quickButtonText}>Add invoice</Text>
          </Pressable>
        </Link>
        <Link href={'/goals' as Href} asChild>
          <Pressable style={styles.quickButton}>
            <Target color={colors.ink} size={17} />
            <Text style={styles.quickButtonText}>Goals</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.tileGrid}>
        <StatTile
          label="Income"
          value={formatCompactCurrency(dashboard.income, profile.currency)}
          detail={`${dashboard.revenueProgress}% of goal`}
          tone="success"
          icon="up"
        />
        <StatTile
          label="Expenses"
          value={formatCompactCurrency(dashboard.expenses, profile.currency)}
          detail={`${dashboard.expenseUsage}% limit`}
          tone="danger"
          icon="down"
        />
        <StatTile
          label="Pending"
          value={formatCompactCurrency(dashboard.pendingPayments, profile.currency)}
          detail="Client payments"
          tone="warning"
          icon="clock"
        />
        <StatTile
          label="Savings"
          value={`${dashboard.savingsProgress}%`}
          detail="Monthly target"
          tone="primary"
          icon="up"
        />
      </View>

      <Link href={'/goals' as Href} asChild>
        <Pressable>
          <Card>
            <View style={styles.cardHeader}>
              <View style={styles.headerCopy}>
                <Text style={styles.cardTitle}>Revenue goal</Text>
                <Text style={styles.cardSubtitle}>
                  {formatCurrency(dashboard.income, profile.currency)} of {formatCurrency(profile.monthlyRevenueGoal, profile.currency)}
                </Text>
              </View>
              <Text style={styles.percentText}>{dashboard.revenueProgress}%</Text>
            </View>
            <ProgressBar value={dashboard.revenueProgress} tone="success" />
          </Card>
        </Pressable>
      </Link>

      {nextInvoice ? (
        <Link href={'/invoices' as Href} asChild>
          <Pressable>
            <Card>
              <View style={styles.invoiceRow}>
                <View style={styles.invoiceIcon}>
                  <Clock3 color={nextInvoice.status === 'overdue' ? colors.danger : colors.warning} size={18} />
                </View>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardTitle}>Payment reminder</Text>
                  <Text style={styles.cardSubtitle}>
                    {nextInvoice.invoiceNumber} due {formatShortDate(nextInvoice.dueDate)}
                  </Text>
                </View>
                <Text style={styles.invoiceAmount}>{formatCompactCurrency(nextInvoice.amount, profile.currency)}</Text>
              </View>
            </Card>
          </Pressable>
        </Link>
      ) : null}

      <SectionHeader title="Recent activity" detail="Latest 3" />
      {recentTransactions.map((transaction) => (
        <Card key={transaction.id}>
          <View style={styles.transactionRow}>
            <View style={[styles.transactionIcon, transaction.type === 'income' ? styles.incomeSoft : styles.expenseSoft]}>
              {transaction.type === 'income' ? (
                <ArrowUpRight color={colors.success} size={17} />
              ) : (
                <ArrowDownRight color={colors.danger} size={17} />
              )}
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.transactionTitle} numberOfLines={1}>
                {transaction.title}
              </Text>
              <Text style={styles.cardSubtitle}>
                {transaction.category} · {formatShortDate(transaction.date)}
              </Text>
            </View>
            <Text style={[styles.transactionAmount, transaction.type === 'income' ? styles.income : styles.expense]}>
              {transaction.type === 'income' ? '+' : '-'}
              {formatCompactCurrency(transaction.amount, profile.currency)}
            </Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

type StatTileProps = {
  label: string;
  value: string;
  detail: string;
  tone: 'primary' | 'success' | 'danger' | 'warning';
  icon: 'up' | 'down' | 'clock';
};

function StatTile({ label, value, detail, tone, icon }: StatTileProps) {
  const toneColor = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
  }[tone];
  const softColor = {
    primary: colors.primarySoft,
    success: colors.successSoft,
    danger: colors.dangerSoft,
    warning: colors.warningSoft,
  }[tone];
  const Icon = icon === 'down' ? TrendingDown : icon === 'clock' ? Clock3 : TrendingUp;

  return (
    <View style={styles.tile}>
      <View style={[styles.tileIcon, { backgroundColor: softColor }]}>
        <Icon color={toneColor} size={17} />
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  month: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  greeting: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 1,
  },
  setupPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: spacing.md,
  },
  setupText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  balanceTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCard: {
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
    shadowColor: '#1675E8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 7,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: colors.surface,
    fontSize: 32,
    fontWeight: '900',
    marginTop: spacing.md,
  },
  balanceMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  balanceMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceDot: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 42,
    justifyContent: 'center',
  },
  outlineButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 42,
    justifyContent: 'center',
  },
  searchAction: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 46,
    marginBottom: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  searchText: {
    color: colors.textSoft,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  filterDot: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  outlineButtonText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '900',
  },
  quickRail: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  quickButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tile: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47.8%',
    flexGrow: 1,
    minHeight: 108,
    padding: spacing.md,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 32,
  },
  tileLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tileValue: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 2,
  },
  tileDetail: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  percentText: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '900',
  },
  invoiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  invoiceIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 36,
  },
  invoiceAmount: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  transactionRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  transactionIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 34,
  },
  incomeSoft: {
    backgroundColor: colors.successSoft,
  },
  expenseSoft: {
    backgroundColor: colors.dangerSoft,
  },
  transactionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '900',
    maxWidth: 82,
    textAlign: 'right',
  },
  income: {
    color: colors.success,
  },
  expense: {
    color: colors.danger,
  },
});
