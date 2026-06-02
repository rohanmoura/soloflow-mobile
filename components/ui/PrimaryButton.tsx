import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';

type PrimaryButtonProps = {
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  tone?: 'primary' | 'dark';
  onPress: () => void;
};

export function PrimaryButton({ label, icon: Icon, disabled = false, tone = 'primary', onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'dark' && styles.dark,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      {Icon ? <Icon color={colors.surface} size={19} /> : null}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  dark: {
    backgroundColor: colors.surfaceStrong,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  text: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '900',
  },
});
