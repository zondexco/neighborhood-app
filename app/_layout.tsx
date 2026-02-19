import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const pathname = usePathname();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const hasHydrated = useAuth((state) => state.hasHydrated);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasHydrated || !navigationState?.key) {
      return;
    }

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    const publicRoutes = new Set(['/', '/login-email', '/login-pin']);
    const isPublicRoute = publicRoutes.has(pathname);

    if (isAuthenticated && isPublicRoute) {
      redirectTimerRef.current = setTimeout(() => {
        router.replace('/home');
      }, 500);
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/');
    }

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [hasHydrated, isAuthenticated, navigationState?.key, pathname, router]);

  // On web, GestureHandlerRootView intercepts pointer events and breaks
  // TextInput/Pressable. No component uses RNGH gestures, so skip it on web.
  const RootWrapper = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <RootWrapper style={{ flex: 1 }}>
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
    </RootWrapper>
  );
}
