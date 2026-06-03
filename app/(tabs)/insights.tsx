import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Crown, Gauge, Globe2, Sparkles, WalletCards } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useInsightsSummary, useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { Transaction } from '@/types/finance';
import { clampPercent } from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';
import { calculateTaxEstimate } from '@/services/reportExport';

type BarPoint = {
  label: string;
  income: number;
  expenses: number;
};

export default function InsightsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const transactions = useSoloFlowStore((state) => state.transactions);
  const invoices = useSoloFlowStore((state) => state.invoices);
  const clients = useSoloFlowStore((state) => state.clients);
  const insights = useInsightsSummary();
  const taxEstimate = useMemo(() => calculateTaxEstimate(transactions, profile.currency), [profile.currency, transactions]);

  const barSeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);
  const expenseMix = useMemo(() => buildCategoryMix(transactions, 'expense'), [transactions]);
  const clientMix = useMemo(() => buildClientMix(transactions, clients), [transactions, clients]);
  const overdueCount = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const pendingCount = invoices.filter((invoice) => invoice.status === 'pending').length;
  const expenseShare = insights.income > 0 ? clampPercent((insights.expenses / insights.income) * 100) : 0;
  const runwayScore = clampPercent(100 - expenseShare + Math.min(18, insights.savingsRate / 3));

  return (
    <Screen>
      <AppHeader
        eyebrow="Business pulse"
        title="Insights"
        subtitle="Cashflow, client concentration, expense pressure, and payment risk."
      />

      <LinearGradient colors={['#FFFFFF', '#E7F1FF', '#DDF8EA']} locations={[0, 0.52, 1]} style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Sparkles color={colors.primary} size={22} />
          </View>
          <Badge label={runwayScore >= 75 ? 'healthy' : 'watch'} status={runwayScore >= 75 ? 'paid' : 'pending'} />
        </View>
        <Text style={styles.heroLabel}>Net operating pulse</Text>
        <Text style={styles.heroValue}>{formatCurrency(insights.profit, profile.currency)}</Text>
        <View style={styles.heroGrid}>
          <MiniStat
            icon={ArrowUpRight}
            label="Income"
            value={formatCurrency(insights.income, profile.currency)}
            tone="success"
          />
          <MiniStat
            icon={ArrowDownRight}
            label="Spend"
            value={formatCurrency(insights.expenses, profile.currency)}
            tone="danger"
          />
          <MiniStat icon={Gauge} label="Score" value={`${runwayScore}%`} tone="primary" />
        </View>
      </LinearGradient>

      <SectionHeader title="Cashflow shape" detail="Paid activity" />
      <Card>
        <View style={styles.chartFrame}>
          {barSeries.map((point) => (
            <View key={point.label} style={styles.barGroup}>
              <View style={styles.barStack}>
                <View style={[styles.bar, styles.incomeBar, { height: getBarHeight(point.income, barSeries) }]} />
                <View style={[styles.bar, styles.expenseBar, { height: getBarHeight(point.expenses, barSeries) }]} />
              </View>
              <Text style={styles.barLabel}>{point.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <LegendDot color={colors.success} label="Income" />
          <LegendDot color={colors.danger} label="Expenses" />
          <Text style={styles.legendMeta}>{expenseShare}% expense load</Text>
        </View>
      </Card>

      <View style={styles.twoColumn}>
        <Card style={styles.halfCard}>
          <View style={styles.metricIcon}>
            <WalletCards color={colors.success} size={20} />
          </View>
          <Text style={styles.cardTitle}>Savings rate</Text>
          <Text style={styles.bigValue}>{insights.savingsRate}%</Text>
          <ProgressBar value={insights.savingsRate} tone="success" />
        </Card>
        <Card style={styles.halfCard}>
          <View style={[styles.metricIcon, styles.riskIcon]}>
            <AlertTriangle color={colors.warning} size={20} />
          </View>
          <Text style={styles.cardTitle}>Payment risk</Text>
          <Text style={styles.bigValue}>{formatCurrency(insights.pendingAmount + insights.overdueAmount, profile.currency)}</Text>
          <Text style={styles.smallMeta}>{overdueCount} overdue · {pendingCount} pending</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.cardTitle}>Best month</Text>
        <Text style={styles.bigValue}>{insights.bestMonth}</Text>
        <Text style={styles.meta}>Highest paid income month from local transaction history.</Text>
      </Card>

      <SectionHeader title="Tax estimate" detail={`${taxEstimate.rate}% planning`} />
      <Card>
        <View style={styles.leaderRow}>
          <View style={styles.crownIcon}>
            <WalletCards color={colors.warning} size={20} />
          </View>
          <View style={styles.leaderCopy}>
            <Text style={styles.cardTitle}>Estimated set-aside</Text>
            <Text style={styles.bigValue}>{formatCurrency(taxEstimate.estimatedTax, profile.currency)}</Text>
            <Text style={styles.meta}>
              Based on {formatCurrency(taxEstimate.taxableProfit, profile.currency)} taxable profit after paid expenses.
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.leaderRow}>
          <View style={[styles.crownIcon, styles.currencyIcon]}>
            <Globe2 color={colors.primary} size={20} />
          </View>
          <View style={styles.leaderCopy}>
            <Text style={styles.cardTitle}>Multi-currency workspace</Text>
            <Text style={styles.meta}>
              Current reporting currency is {profile.currency}. Switch it in Settings before sharing reports or planning invoices.
            </Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Client concentration" detail="Paid revenue" />
      <Card>
        <View style={styles.leaderRow}>
          <View style={styles.crownIcon}>
            <Crown color={colors.warning} size={20} />
          </View>
          <View style={styles.leaderCopy}>
            <Text style={styles.cardTitle}>{insights.topClientName}</Text>
            <Text style={styles.meta}>{formatCurrency(insights.topClientRevenue, profile.currency)} paid revenue</Text>
          </View>
        </View>
        {clientMix.map((client) => (
          <View key={client.name} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{client.name}</Text>
              <Text style={styles.progressValue}>{client.share}%</Text>
            </View>
            <ProgressBar value={client.share} tone={client.share > 45 ? 'warning' : 'primary'} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Expense mix" detail={insights.highestExpenseCategory} />
      <Card>
        {expenseMix.map((item) => (
          <View key={item.name} style={styles.mixRow}>
            <View style={styles.mixCopy}>
              <Text style={styles.progressLabel}>{item.name}</Text>
              <Text style={styles.meta}>{formatCurrency(item.amount, profile.currency)}</Text>
            </View>
            <View style={styles.mixPill}>
              <Text style={styles.mixPillText}>{item.share}%</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card tone="strong">
        <Text style={styles.cardTitle}>Recommended focus</Text>
        <Text style={styles.meta}>
          Follow up overdue invoices first, then keep expenses below {formatCurrency(profile.expenseLimit, profile.currency)} while
          protecting your highest revenue client pipeline.
        </Text>
      </Card>
    </Screen>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  value: string;
  tone: 'success' | 'danger' | 'primary';
}) {
  const toneColor = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.primary;

  return (
    <View style={styles.miniStat}>
      <Icon color={toneColor} size={18} />
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function buildMonthlySeries(transactions: Transaction[]): BarPoint[] {
  const months = new Map<string, BarPoint>();

  transactions
    .filter((transaction) => transaction.status === 'paid')
    .forEach((transaction) => {
      const monthKey = transaction.date.slice(0, 7);
      const label = new Date(`${monthKey}-01T00:00:00`).toLocaleString('en', { month: 'short' });
      const point = months.get(monthKey) ?? { label, income: 0, expenses: 0 };

      if (transaction.type === 'income') {
        point.income += transaction.amount;
      } else {
        point.expenses += transaction.amount;
      }

      months.set(monthKey, point);
    });

  const series = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, point]) => point).slice(-4);

  return series.length > 0 ? series : [{ label: 'Now', income: 0, expenses: 0 }];
}

function buildCategoryMix(transactions: Transaction[], type: Transaction['type']) {
  const totals = new Map<string, number>();
  const paid = transactions.filter((transaction) => transaction.type === type && transaction.status === 'paid');
  const totalAmount = paid.reduce((sum, transaction) => sum + transaction.amount, 0);

  paid.forEach((transaction) => {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
  });

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, amount]) => ({
      name,
      amount,
      share: totalAmount > 0 ? clampPercent((amount / totalAmount) * 100) : 0,
    }));
}

function buildClientMix(transactions: Transaction[], clients: ReturnType<typeof useSoloFlowStore.getState>['clients']) {
  const totals = new Map<string, number>();
  const paidIncome = transactions.filter((transaction) => transaction.type === 'income' && transaction.status === 'paid');
  const totalIncome = paidIncome.reduce((sum, transaction) => sum + transaction.amount, 0);

  paidIncome.forEach((transaction) => {
    if (transaction.clientId) {
      totals.set(transaction.clientId, (totals.get(transaction.clientId) ?? 0) + transaction.amount);
    }
  });

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([clientId, amount]) => ({
      name: clients.find((client) => client.id === clientId)?.name ?? 'Unknown client',
      share: totalIncome > 0 ? clampPercent((amount / totalIncome) * 100) : 0,
    }));
}

function getBarHeight(value: number, series: BarPoint[]) {
  const max = Math.max(1, ...series.flatMap((point) => [point.income, point.expenses]));

  return Math.max(14, Math.round((value / max) * 132));
}

const styles = StyleSheet.create({
  heroCard: {
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  heroLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroValue: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  miniStat: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: spacing.sm,
  },
  miniLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  miniValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  chartFrame: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.md,
    height: 172,
    justifyContent: 'space-around',
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barStack: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    height: 142,
  },
  bar: {
    borderRadius: 8,
    width: 18,
  },
  incomeBar: {
    backgroundColor: colors.success,
  },
  expenseBar: {
    backgroundColor: colors.danger,
  },
  barLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  legendRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  legendMeta: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  metricIcon: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 38,
  },
  riskIcon: {
    backgroundColor: colors.warningSoft,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  bigValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  smallMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  leaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  crownIcon: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 42,
  },
  currencyIcon: {
    backgroundColor: colors.primarySoft,
  },
  leaderCopy: {
    flex: 1,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  progressItem: {
    marginTop: spacing.md,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    paddingRight: spacing.sm,
  },
  progressValue: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '900',
  },
  mixRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  mixCopy: {
    flex: 1,
  },
  mixPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mixPillText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
