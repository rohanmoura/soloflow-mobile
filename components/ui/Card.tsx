import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme/tokens';

type CardProps = PropsWithChildren<{
  tone?: 'default' | 'strong' | 'muted';
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, tone = 'default', style }: CardProps) {
  return (
    <View style={[styles.card, tone === 'strong' && styles.strong, tone === 'muted' && styles.muted, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadows.subtle,
  },
  strong: {
    backgroundColor: '#EAF4FF',
    borderColor: '#D6E7FF',
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
});
