import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const unstable_settings = {
  anchor: '(public)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const hasHydrated = useAuth((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const firstSegment = segments[0];
    const inApp = firstSegment === '(app)';
    const inPublic = firstSegment === '(public)';

    if (isAuthenticated && !inApp) {
      router.replace('/home');
      return;
    }

    if (!isAuthenticated && !inPublic) {
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, router, segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
