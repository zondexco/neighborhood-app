import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LiquidView } from '@/components/native/LiquidView';

export default function AppLayout() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#0a0a0a',
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerTransparent: Platform.OS === 'ios',
          headerBackground: () =>
            Platform.OS === 'ios' ? (
              <LiquidView intensity={80} tint="systemChromeMaterialDark" className="flex-1 border-b border-white/10" />
            ) : undefined,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
