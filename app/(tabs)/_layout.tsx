import { Redirect, Tabs } from 'expo-router';
import { BarChart3, BriefcaseBusiness, Home, ReceiptText, Settings } from 'lucide-react-native';

import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { useSoloFlowStore } from '@/store/appStore';
import { colors } from '@/theme/tokens';

export default function TabLayout() {
  const onboardingCompleted = useSoloFlowStore((state) => state.profile.onboardingCompleted);

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        sceneStyle: { backgroundColor: colors.background },
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Money',
          tabBarIcon: ({ color }) => <ReceiptText color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <BriefcaseBusiness color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
