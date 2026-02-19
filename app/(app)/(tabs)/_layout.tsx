import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, User } from 'lucide-react-native';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Breakpoints } from '@/constants/theme';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hasSidebar = Platform.OS === 'web' && width >= Breakpoints.laptop;


  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#0a0a0a',
        },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerBackground: () =>
          Platform.OS === 'ios' ? (
            <LiquidView intensity={75} tint="systemChromeMaterialDark" className="flex-1 border-b border-white/10" />
          ) : undefined,
        tabBarPosition: hasSidebar ? 'left' : 'bottom',
        tabBarStyle: {
          position: hasSidebar ? 'relative' : 'absolute',
          left: hasSidebar ? undefined : 16,
          right: hasSidebar ? undefined : 16,
          bottom: hasSidebar ? undefined : Math.max(insets.bottom, 12),
          width: hasSidebar ? 250 : undefined,
          height: hasSidebar ? '100%' : 80, // Increased height for iOS labels
          borderTopWidth: 0,
          borderRightWidth: hasSidebar ? 1 : 0,
          borderRightColor: 'rgba(255,255,255,0.08)',
          borderRadius: hasSidebar ? 0 : 28,
          overflow: hasSidebar ? 'visible' : (Platform.OS === 'web' ? 'hidden' : 'visible'),
          backgroundColor: hasSidebar ? '#0a0a0a' : 'transparent',
          elevation: 0,
          paddingTop: hasSidebar ? 16 : 8,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarBackground: () =>
          !hasSidebar ? (
            <LiquidView 
              intensity={Platform.OS === 'ios' ? 45 : 95} // Lower intensity on iOS for better glass look
              tint="systemChromeMaterialDark"
              className="absolute inset-0 border border-white/20 rounded-[32px]"
            />
          ) : undefined,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: hasSidebar ? 14 : 11,
          fontWeight: '600',
          marginBottom: hasSidebar ? 0 : 6,
        },
        tabBarItemStyle: hasSidebar
          ? {
              borderRadius: 12,
              marginHorizontal: 10,
              marginBottom: 8,
              paddingVertical: 6,
            }
          : {
              borderRadius: 16,
              marginHorizontal: 2,
              marginVertical: 6,
            },
        tabBarIconStyle: {
          marginTop: hasSidebar ? 0 : 4,
        },
        tabBarActiveBackgroundColor: hasSidebar ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#a1a1aa',
        sceneStyle: {
          backgroundColor: '#000000',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <Calendar color={color} size={22} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Paquetería',
          tabBarIcon: ({ color }) => <Package color={color} size={22} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
