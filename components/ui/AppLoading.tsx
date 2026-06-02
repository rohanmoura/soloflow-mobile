import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';

export function AppLoading() {
  return (
    <LinearGradient colors={['#CFE3FF', '#F8FBFF', '#D8F7E6']} locations={[0, 0.48, 1]} style={styles.gradient}>
      <View pointerEvents="none" style={[styles.wash, styles.blueWash]} />
      <View pointerEvents="none" style={[styles.wash, styles.greenWash]} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>SF</Text>
        </View>
        <Text style={styles.title}>SoloFlow</Text>
        <Text style={styles.subtitle}>Preparing your freelance finance workspace</Text>

        <View style={styles.card}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonValue} />
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonPill} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  wash: {
    opacity: 0.78,
    position: 'absolute',
  },
  blueWash: {
    backgroundColor: '#AFD0FF',
    borderBottomLeftRadius: 260,
    borderBottomRightRadius: 180,
    height: 360,
    left: -120,
    right: -90,
    top: -140,
    transform: [{ rotate: '-7deg' }],
  },
  greenWash: {
    backgroundColor: '#B7F0D2',
    borderTopLeftRadius: 240,
    borderTopRightRadius: 260,
    bottom: -120,
    height: 340,
    left: -100,
    right: -120,
    transform: [{ rotate: '6deg' }],
  },
  safe: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 14,
    height: 58,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 58,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '900',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg,
    width: '100%',
  },
  skeletonHeader: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 14,
    width: '42%',
  },
  skeletonValue: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 8,
    height: 34,
    marginTop: spacing.md,
    width: '68%',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  skeletonPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    flex: 1,
    height: 44,
  },
});
