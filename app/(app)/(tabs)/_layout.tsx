import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, User, Shield } from 'lucide-react-native';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Breakpoints } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hasSidebar = Platform.OS === 'web' && width >= Breakpoints.laptop;
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);
  const {
    isDark,
    headerBg,
    headerTint,
    tabActiveTint,
    tabInactiveTint,
    tabSidebarBg,
    sceneBg,
    border,
  } = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        freezeOnBlur: true,
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : headerBg,
        },
        headerTintColor: headerTint,
        headerShadowVisible: false,
        headerTransparent: Platform.OS === 'ios',
        headerBackground: () =>
          Platform.OS === 'ios' ? (
            <LiquidView
              intensity={75}
              tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              className="flex-1 border-b border-black/5 dark:border-white/10"
            />
          ) : undefined,
        tabBarPosition: hasSidebar ? 'left' : 'bottom',
        tabBarStyle: {
          position: hasSidebar ? 'relative' : 'absolute',
          left: hasSidebar ? undefined : 0,
          right: hasSidebar ? undefined : 0,
          marginHorizontal: hasSidebar ? 0 : 24,
          bottom: hasSidebar ? undefined : Math.max(insets.bottom, 12),
          width: hasSidebar ? 250 : undefined,
          height: hasSidebar ? '100%' : 64,
          borderWidth: 0,
          borderTopWidth: 0,
          borderRightWidth: hasSidebar ? 1 : 0,
          borderRightColor: border,
          borderRadius: hasSidebar ? 0 : 32,
          overflow: 'hidden',
          backgroundColor: hasSidebar ? tabSidebarBg : 'transparent',
          elevation: 0,
          paddingTop: hasSidebar ? 16 : 0,
          paddingBottom: hasSidebar ? 0 : 0,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: isDark ? 20 : 10,
          shadowOffset: { width: 0, height: isDark ? 8 : 3 },
        },
        tabBarBackground: () =>
          !hasSidebar ? (
            Platform.OS === 'ios' ? (
              <BlurView
                intensity={85}
                tint={isDark ? 'systemMaterialDark' : 'systemMaterialLight'}
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: isDark
                      ? 'rgba(10, 10, 10, 0.88)'
                      : 'rgba(255, 255, 255, 0.92)',
                  },
                ]}
              />
            )
          ) : undefined,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: hasSidebar ? 14 : 10,
          fontWeight: '700',
          marginBottom: hasSidebar ? 0 : 0,
        },
        tabBarItemStyle: hasSidebar
          ? {
              borderRadius: 12,
              marginHorizontal: 10,
              marginBottom: 8,
              paddingVertical: 12,
            }
          : {
              borderRadius: 16,
              marginHorizontal: 4,
              marginVertical: 4,
            },
        tabBarIconStyle: {
          marginTop: hasSidebar ? 0 : 2,
        },
        tabBarActiveBackgroundColor: hasSidebar
          ? isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
          : 'transparent',
        tabBarActiveTintColor: tabActiveTint,
        tabBarInactiveTintColor: tabInactiveTint,
        sceneStyle: {
          backgroundColor: sceneBg,
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
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color }) => <Shield color={color} size={22} />,
          headerShown: false,
          tabBarButton: isAdmin ? undefined : () => null,
        }}
      />
    </Tabs>
  );
}
