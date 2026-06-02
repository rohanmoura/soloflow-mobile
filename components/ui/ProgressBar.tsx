import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme/tokens';

type ProgressBarProps = {
  value: number;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
};

const toneColors = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export function ProgressBar({ value, tone = 'primary' }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: toneColors[tone] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radii.sm,
    height: 8,
  },
});
