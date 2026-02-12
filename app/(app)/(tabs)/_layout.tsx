import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, User } from 'lucide-react-native';
import { Platform, useWindowDimensions } from 'react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { Breakpoints } from '@/constants/theme';

export default function TabLayout() {
  const { width } = useWindowDimensions();
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
          bottom: hasSidebar ? undefined : 0,
          left: hasSidebar ? undefined : 0,
          right: hasSidebar ? undefined : 0,
          width: hasSidebar ? 250 : undefined,
          height: hasSidebar ? '100%' : 85,
          borderTopWidth: hasSidebar ? 0 : 0,
          borderRightWidth: hasSidebar ? 1 : 0,
          borderRightColor: 'rgba(255,255,255,0.08)',
          backgroundColor: hasSidebar ? '#0a0a0a' : Platform.OS === 'ios' ? 'transparent' : 'rgba(0,0,0,0.8)',
          elevation: 0,
          paddingTop: hasSidebar ? 16 : 0,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' && !hasSidebar ? (
            <LiquidView 
              intensity={80} 
              tint="dark" 
              className="absolute inset-0 border-t border-white/10"
            />
          ) : undefined
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: hasSidebar ? 14 : 12,
          fontWeight: '600',
        },
        tabBarItemStyle: hasSidebar
          ? {
              borderRadius: 12,
              marginHorizontal: 10,
              marginBottom: 8,
              paddingVertical: 6,
            }
          : undefined,
        tabBarActiveBackgroundColor: hasSidebar ? 'rgba(255,255,255,0.06)' : undefined,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Paquetería',
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
