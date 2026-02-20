import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LiquidView } from '@/components/native/LiquidView';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AppLayout() {
  const { isDark, headerBg, headerTint } = useThemeColors();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : headerBg,
          },
          headerTintColor: headerTint,
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerBackground: () =>
            Platform.OS === 'ios' ? (
              <LiquidView
                intensity={80}
                tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                className="flex-1 border-b border-black/5 dark:border-white/10"
              />
            ) : undefined,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
