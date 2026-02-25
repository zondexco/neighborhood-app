import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Appearance, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSettings } from '@/features/settings/useSettings';
import { SettingsProvider } from '@/features/settings/SettingsProvider';

export const unstable_settings = {
  anchor: '(public)',
};

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const hasHydrated = useAuth((state) => state.hasHydrated);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = useSettings((s) => s.theme);
  const settingsHydrated = useSettings((s) => s.hasHydrated);
  const isDark = theme === 'dark';

  // Sync theme to native OS appearance so BlurView, GlassView and StatusBar respond
  useEffect(() => {
    if (settingsHydrated && Platform.OS !== 'web') {
      Appearance.setColorScheme(theme);
    }
  }, [theme, settingsHydrated]);

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
    <SettingsProvider>
      <RootWrapper style={{ flex: 1 }}>
        <View className={`${isDark ? 'dark ' : ''}flex-1`}>
          <SafeAreaProvider>
            <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(public)" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style={isDark ? 'light' : 'dark'} />
            </ThemeProvider>
          </SafeAreaProvider>
        </View>
      </RootWrapper>
    </SettingsProvider>
  );
}
