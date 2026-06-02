import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme/tokens';

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
};

const toneColors = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export function MetricCard({ label, value, detail, icon: Icon, tone = 'primary' }: MetricCardProps) {
  const tint = toneColors[tone];

  return (
    <Card>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
          <Icon color={tint} size={21} strokeWidth={2.2} />
        </View>
      </View>
      <Text style={styles.detail}>{detail}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  detail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
