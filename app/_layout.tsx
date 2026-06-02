import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';

import { AppLoading } from '@/components/ui/AppLoading';
import { useSoloFlowStore } from '@/store/appStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const scalableText = Text as typeof Text & { defaultProps?: { maxFontSizeMultiplier?: number } };
const scalableTextInput = TextInput as typeof TextInput & { defaultProps?: { maxFontSizeMultiplier?: number } };

scalableText.defaultProps = scalableText.defaultProps ?? {};
scalableText.defaultProps.maxFontSizeMultiplier = 1.08;
scalableTextInput.defaultProps = scalableTextInput.defaultProps ?? {};
scalableTextInput.defaultProps.maxFontSizeMultiplier = 1.08;

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const hasHydrated = useSoloFlowStore((state) => state.hasHydrated);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!hasHydrated) {
    return <AppLoading />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
      <Stack.Screen name="client/add" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="client/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="client/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="invoice/add" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="invoice/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="invoices/index" options={{ headerShown: false }} />
      <Stack.Screen name="invoice/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="goals/index" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/add" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="transaction/edit/[id]" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
