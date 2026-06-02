import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { useInsightsSummary, useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import { formatCurrency } from '@/utils/currency';

export default function InsightsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const insights = useInsightsSummary();
  const expenseShare = insights.income > 0 ? Math.round((insights.expenses / insights.income) * 100) : 0;

  return (
    <Screen>
      <AppHeader
        eyebrow="Business pulse"
        title="Insights"
        subtitle="Revenue, spending risk, savings, and client concentration."
      />

      <Card tone="strong">
        <Text style={styles.cardTitle}>Income vs expenses</Text>
        <View style={styles.chartRow}>
          <View style={[styles.chartBar, styles.incomeBar, { height: 150 }]} />
          <View style={[styles.chartBar, styles.expenseBar, { height: Math.max(34, expenseShare * 1.5) }]} />
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>Income {formatCurrency(insights.income, profile.currency)}</Text>
          <Text style={styles.legendText}>Expenses {formatCurrency(insights.expenses, profile.currency)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Savings rate</Text>
        <Text style={styles.bigValue}>{insights.savingsRate}%</Text>
        <ProgressBar value={insights.savingsRate} tone="success" />
        <Text style={styles.meta}>Net profit: {formatCurrency(insights.profit, profile.currency)}</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Top client</Text>
        <Text style={styles.bigValue}>{insights.topClientName}</Text>
        <Text style={styles.meta}>{formatCurrency(insights.topClientRevenue, profile.currency)} paid revenue</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Payment risk</Text>
        <Text style={styles.bigValue}>
          {formatCurrency(insights.pendingAmount + insights.overdueAmount, profile.currency)}
        </Text>
        <Text style={styles.meta}>
          {formatCurrency(insights.overdueAmount, profile.currency)} overdue · highest expense category is{' '}
          {insights.highestExpenseCategory}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  chartRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.md,
    height: 170,
    marginTop: spacing.sm,
  },
  chartBar: {
    borderRadius: 8,
    flex: 1,
  },
  incomeBar: {
    backgroundColor: colors.success,
  },
  expenseBar: {
    backgroundColor: colors.danger,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  bigValue: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
});
