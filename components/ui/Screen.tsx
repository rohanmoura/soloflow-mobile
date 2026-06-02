import type { PropsWithChildren } from 'react';
import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';
import { useUiStore } from '@/store/uiStore';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = true }: ScreenProps) {
  const setTabBarHidden = useUiStore((state) => state.setTabBarHidden);
  const lastOffset = useRef(0);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function revealSoon() {
    if (revealTimer.current) {
      clearTimeout(revealTimer.current);
    }

    revealTimer.current = setTimeout(() => setTabBarHidden(false), 1100);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const delta = currentOffset - lastOffset.current;

    if (Math.abs(delta) > 3) {
      setTabBarHidden(true);
    }

    if (currentOffset <= 8) {
      revealSoon();
    }

    lastOffset.current = Math.max(0, currentOffset);
  }

  if (!scroll) {
    return (
      <LinearGradient colors={['#D8E8FF', '#F7FBFF', '#DDF7E9']} locations={[0, 0.48, 1]} style={styles.gradient}>
        <View pointerEvents="none" style={[styles.colorWash, styles.blueWash]} />
        <View pointerEvents="none" style={[styles.colorWash, styles.greenWash]} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>{children}</View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#D8E8FF', '#F7FBFF', '#DDF7E9']} locations={[0, 0.48, 1]} style={styles.gradient}>
      <View pointerEvents="none" style={[styles.colorWash, styles.blueWash]} />
      <View pointerEvents="none" style={[styles.colorWash, styles.greenWash]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          onMomentumScrollEnd={revealSoon}
          onScroll={handleScroll}
          onScrollEndDrag={revealSoon}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  colorWash: {
    opacity: 0.72,
    position: 'absolute',
  },
  blueWash: {
    backgroundColor: '#B9D6FF',
    borderBottomLeftRadius: 260,
    borderBottomRightRadius: 180,
    height: 340,
    left: -120,
    right: -90,
    top: -130,
    transform: [{ rotate: '-7deg' }],
  },
  greenWash: {
    backgroundColor: '#BEEFD4',
    borderTopLeftRadius: 240,
    borderTopRightRadius: 260,
    bottom: -100,
    height: 330,
    left: -100,
    right: -120,
    transform: [{ rotate: '6deg' }],
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  scrollContent: {
    paddingBottom: 118,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
