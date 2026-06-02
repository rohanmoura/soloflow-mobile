import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, spacing } from '@/theme/tokens';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, message, actionLabel, actionIcon, onAction }: EmptyStateProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconShell}>
        <Icon color={colors.primary} size={24} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <PrimaryButton label={actionLabel} icon={actionIcon} onPress={onAction} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  iconShell: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 48,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  actionWrap: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
});
