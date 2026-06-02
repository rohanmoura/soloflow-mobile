import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BarChart3, BriefcaseBusiness, Home, ReceiptText, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/tokens';
import { useUiStore } from '@/store/uiStore';

const iconMap: Record<string, LucideIcon> = {
  index: Home,
  transactions: ReceiptText,
  clients: BriefcaseBusiness,
  insights: BarChart3,
  settings: Settings,
};

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const hidden = useUiStore((store) => store.tabBarHidden);
  const pillWidth = Math.min(Dimensions.get('window').width - 112, 280);
  const innerWidth = pillWidth - spacing.sm * 2;
  const itemWidth = innerWidth / state.routes.length;
  const bubbleSize = 48;
  const bubbleOffset = (itemWidth - bubbleSize) / 2;
  const translateX = useRef(new Animated.Value(state.index * itemWidth + bubbleOffset)).current;
  const hideProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * itemWidth + bubbleOffset,
      useNativeDriver: true,
      damping: 18,
      stiffness: 190,
      mass: 0.8,
    }).start();
  }, [bubbleOffset, itemWidth, state.index, translateX]);

  useEffect(() => {
    Animated.spring(hideProgress, {
      toValue: hidden ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 170,
    }).start();
  }, [hidden, hideProgress]);

  const animatedWrapStyle = {
    opacity: hideProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
    transform: [
      {
        translateY: hideProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 112],
        }),
      },
      {
        scale: hideProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.82],
        }),
      },
    ],
  };

  return (
    <View pointerEvents={hidden ? 'none' : 'box-none'} style={[styles.wrap, { bottom: Math.max(insets.bottom, 10) }]}>
      <Animated.View style={[styles.pill, { width: pillWidth }, animatedWrapStyle]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.activeBubble, { width: bubbleSize, transform: [{ translateX }] }]}
        />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = iconMap[route.name] ?? Home;

          function handlePress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              key={route.key}
              onPress={handlePress}
              style={[styles.item, { width: itemWidth }]}>
              <Icon color={focused ? colors.ink : '#B6B6B6'} size={focused ? 18 : 20} strokeWidth={2.3} />
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  pill: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 32,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
  },
  item: {
    alignItems: 'center',
    borderRadius: 26,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    zIndex: 2,
  },
  activeBubble: {
    bottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 26,
    height: 48,
    left: spacing.sm,
    position: 'absolute',
    top: 8,
    zIndex: 1,
  },
});
