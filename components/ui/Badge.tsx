import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import type { ClientStatus, GoalStatus, MoneyStatus } from '@/types/finance';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

const statusTone: Record<MoneyStatus | ClientStatus | GoalStatus, BadgeTone> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
  draft: 'neutral',
  cancelled: 'danger',
  active: 'success',
  waiting_payment: 'warning',
  past_client: 'neutral',
  prospect: 'neutral',
  on_track: 'success',
  behind: 'warning',
  completed: 'success',
  not_started: 'neutral',
};

const toneStyles = {
  success: { backgroundColor: colors.successSoft, color: colors.success },
  warning: { backgroundColor: colors.warningSoft, color: colors.warning },
  danger: { backgroundColor: colors.dangerSoft, color: colors.danger },
  neutral: { backgroundColor: colors.slateSoft, color: colors.slate },
};

type BadgeProps = {
  label: string;
  status?: MoneyStatus | ClientStatus | GoalStatus;
};

export function Badge({ label, status }: BadgeProps) {
  const tone = toneStyles[status ? statusTone[status] : 'neutral'];

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
