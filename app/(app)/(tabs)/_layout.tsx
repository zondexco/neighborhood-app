import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, User } from 'lucide-react-native';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Breakpoints } from '@/constants/theme';
import { LiquidTabBar } from '@/components/navigation/LiquidTabBar';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hasSidebar = Platform.OS === 'web' && width >= Breakpoints.laptop;

  return (
    <Tabs
      tabBar={props => !hasSidebar ? <LiquidTabBar {...props} /> : undefined}
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
        tabBarStyle: hasSidebar ? {
          position: 'relative',
          width: 250,
          height: '100%',
          borderTopWidth: 0,
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.08)',
          backgroundColor: '#0a0a0a',
          paddingTop: 16,
        } : { display: 'none' },
        tabBarActiveBackgroundColor: hasSidebar ? 'rgba(255,255,255,0.06)' : undefined,
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
