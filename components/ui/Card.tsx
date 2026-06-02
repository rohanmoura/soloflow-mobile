import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme/tokens';

type CardProps = PropsWithChildren<{
  tone?: 'default' | 'strong' | 'muted';
}>;

export function Card({ children, tone = 'default' }: CardProps) {
  return <View style={[styles.card, tone === 'strong' && styles.strong, tone === 'muted' && styles.muted]}>{children}</View>;
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
