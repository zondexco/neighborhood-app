import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Package, User, Shield, Code2 } from 'lucide-react-native';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { HapticTab } from '@/components/haptic-tab';
import { WebSidebar } from '@/components/web/WebSidebar';
import { Breakpoints } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const hasSidebar = Platform.OS === 'web' && width >= Breakpoints.laptop;
  const barHorizontalInset = hasSidebar ? 0 : Math.max(12, Math.min(24, Math.floor(width * 0.04)));
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);
  const isDev = useAuth((s: AuthState) => s.role === 'dev');
  const {
    isDark,
    headerBg,
    headerTint,
    tabActiveTint,
    tabInactiveTint,
    sceneBg,
    border,
  } = useThemeColors();

  return (
    <Tabs
      tabBar={hasSidebar ? (props) => <WebSidebar {...props} /> : undefined}
      screenOptions={{
        freezeOnBlur: false,
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
        tabBarPosition: 'bottom',
        tabBarButton: (props) => <HapticTab {...props} />,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          marginHorizontal: barHorizontalInset,
          bottom: Math.max(insets.bottom, 12),
          height: 58,
          borderWidth: 0,
          borderTopWidth: 0,
          borderRadius: 32,
          // overflow: 'hidden' en Android clipea el borderRadius (sin perder sombra
          // porque elevation:0). En iOS, el sistema clipea automáticamente el
          // backgroundColor al borderRadius aunque overflow sea 'visible'.
          overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
          // Fondo visible SIEMPRE — no depende de tabBarBackground.
          // LiquidView en tabBarBackground agrega blur encima en iOS como bonus.
          backgroundColor: isDark ? 'rgba(18,18,18,0.82)' : 'rgba(248,248,248,0.82)',
          elevation: 0,
          paddingTop: 4,
          paddingBottom: 4,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.4 : 0.08,
          shadowRadius: isDark ? 20 : 10,
          shadowOffset: { width: 0, height: isDark ? 8 : 3 },
        },
        tabBarBackground: () => (
          // tabBarStyle ya provee el backgroundColor base.
          // Aquí solo agregamos blur (iOS) y borde encima.
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <LiquidView
              intensity={80}
              tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 32 }]}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderRadius: 32,
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.14)'
                    : 'rgba(0,0,0,0.08)',
                },
              ]}
            />
          </View>
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
          marginBottom: 0,
          lineHeight: 12,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 2,
          marginVertical: 0,
          paddingVertical: 0,
          minHeight: 48,
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarActiveBackgroundColor: 'transparent',
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
          href: isAdmin ? '/admin' : null,
        }}
      />
      <Tabs.Screen
        name="dev"
        options={{
          title: 'Dev',
          tabBarIcon: ({ color }) => <Code2 color={color} size={22} />,
          headerShown: false,
          href: isDev ? '/dev' : null,
        }}
      />
    </Tabs>
  );
}
