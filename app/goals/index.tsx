import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Gauge, Minus, PiggyBank, Plus, Target } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useSoloFlowStore } from '@/store/appStore';
import { colors, spacing } from '@/theme/tokens';
import type { GoalType } from '@/types/finance';
import { clampPercent } from '@/utils/calculations';
import { formatCurrency } from '@/utils/currency';

const iconMap = {
  revenue: Target,
  savings: PiggyBank,
  expense_limit: Gauge,
};

const toneMap: Record<GoalType, 'success' | 'warning' | 'primary'> = {
  revenue: 'success',
  savings: 'primary',
  expense_limit: 'warning',
};

export default function GoalsScreen() {
  const profile = useSoloFlowStore((state) => state.profile);
  const goals = useSoloFlowStore((state) => state.goals);
  const updateGoalTarget = useSoloFlowStore((state) => state.updateGoalTarget);
  const goalHistory = buildGoalHistory(profile.monthlyRevenueGoal);

  function adjustGoal(goalId: string, currentTarget: number, direction: 'down' | 'up') {
    const step = currentTarget >= 5000 ? 500 : 100;
    const nextTarget = direction === 'up' ? currentTarget + step : Math.max(step, currentTarget - step);

    updateGoalTarget(goalId, nextTarget);
    Haptics.selectionAsync();
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft color={colors.ink} size={21} />
      </Pressable>

      <AppHeader
        eyebrow="Monthly plan"
        title="Goals"
        subtitle="Revenue, savings, and expense limits tracked from your local finance data."
      />

      <Card tone="strong">
        <Text style={styles.heroLabel}>This month</Text>
        <Text style={styles.heroTitle}>Stay on pace without spreadsheet math.</Text>
        <View style={styles.heroStats}>
          <View>
            <Text style={styles.heroStatLabel}>Revenue target</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(profile.monthlyRevenueGoal, profile.currency)}</Text>
          </View>
          <View>
            <Text style={styles.heroStatLabel}>Expense cap</Text>
            <Text style={styles.heroStatValue}>{formatCurrency(profile.expenseLimit, profile.currency)}</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title="Goal progress" detail={`${goals.length} active`} />
      {goals.map((goal) => {
        const progress = clampPercent((goal.currentAmount / goal.targetAmount) * 100);
        const Icon = iconMap[goal.type];

        return (
          <Card key={goal.id}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIcon}>
                <Icon color={colors.primary} size={20} />
              </View>
              <View style={styles.goalCopy}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalMeta}>
                  {formatCurrency(goal.currentAmount, profile.currency)} of {formatCurrency(goal.targetAmount, profile.currency)}
                </Text>
              </View>
              <Text style={styles.goalPercent}>{progress}%</Text>
            </View>
            <ProgressBar value={progress} tone={toneMap[goal.type]} />
            <View style={styles.goalControls}>
              <Pressable
                accessibilityRole="button"
                onPress={() => adjustGoal(goal.id, goal.targetAmount, 'down')}
                style={styles.goalButton}>
                <Minus color={colors.ink} size={18} />
              </Pressable>
              <Text style={styles.targetText}>Target {formatCurrency(goal.targetAmount, profile.currency)}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => adjustGoal(goal.id, goal.targetAmount, 'up')}
                style={styles.goalButton}>
                <Plus color={colors.ink} size={18} />
              </Pressable>
            </View>
          </Card>
        );
      })}

      <SectionHeader title="Goal history" detail="Last 3 months" />
      {goalHistory.map((item) => (
        <Card key={item.month}>
          <View style={styles.historyRow}>
            <View>
              <Text style={styles.goalTitle}>{item.month}</Text>
              <Text style={styles.goalMeta}>{formatCurrency(item.revenue, profile.currency)} revenue tracked</Text>
            </View>
            <View style={styles.historyCopy}>
              <Text style={styles.goalPercent}>{item.progress}%</Text>
              <Text style={styles.historyLabel}>Goal pace</Text>
            </View>
          </View>
          <ProgressBar value={item.progress} tone={item.progress >= 80 ? 'success' : 'warning'} />
        </Card>
      ))}
    </Screen>
  );
}

function buildGoalHistory(monthlyRevenueGoal: number) {
  const monthFormat = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });
  const multipliers = [0.94, 0.82, 1.03];

  return multipliers.map((multiplier, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const revenue = Math.round(monthlyRevenueGoal * multiplier);

    return {
      month: monthFormat.format(date),
      revenue,
      progress: clampPercent((revenue / monthlyRevenueGoal) * 100),
    };
  });
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
  heroLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: spacing.sm,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  heroStatLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  heroStatValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  goalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  goalIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  goalCopy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  goalTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  goalMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  goalPercent: {
    color: colors.success,
    fontSize: 16,
    fontWeight: '900',
  },
  goalControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  goalButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 44,
  },
  targetText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  historyCopy: {
    alignItems: 'flex-end',
  },
  historyLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
