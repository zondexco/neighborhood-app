import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { ChevronsLeft, ChevronsRight } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/features/settings/useSettings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 68;
const TRANSITION = 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)';

export function WebSidebar({ state, descriptors, navigation }: BottomTabBarProps) {
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);
  const isDev = useAuth((s: AuthState) => s.role === 'dev');
  const collapsed = useSettings((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useSettings((s) => s.setSidebarCollapsed);
  const {
    isDark,
    tabSidebarBg,
    tabActiveTint,
    tabInactiveTint,
    tabHover,
    border,
  } = useThemeColors();

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed(!collapsed);
  }, [collapsed, setSidebarCollapsed]);

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <View
      style={[
        styles.container,
        {
          width: sidebarWidth,
          backgroundColor: tabSidebarBg,
          borderRightColor: border,
          // @ts-ignore — web CSS transitions
          transition: TRANSITION,
        },
      ]}
    >
      {/* Brand */}
      <View style={[styles.brandSection, collapsed && styles.brandSectionCollapsed]}>
        <Image
          source={require('@/assets/brand/icons/icon_128.png')}
          style={styles.brandIcon}
        />
        {!collapsed && (
          <Text
            style={[styles.brandText, { color: tabActiveTint }]}
            numberOfLines={1}
          >
            Neighborhood
          </Text>
        )}
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: border }]} />

      {/* Nav Items */}
      <View style={styles.navSection}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          // Skip hidden tabs (href: null — Expo Router extension)
          if ((options as any).href === null) return null;

          // Permission-based visibility
          if (route.name === 'admin' && !isAdmin) return null;
          if (route.name === 'dev' && !isDev) return null;

          const isFocused = state.index === index;
          const label = options.title ?? route.name;
          const color = isFocused ? tabActiveTint : tabInactiveTint;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <SidebarItem
              key={route.key}
              icon={options.tabBarIcon?.({ color, focused: isFocused, size: 20 })}
              label={label}
              color={color}
              isActive={isFocused}
              collapsed={collapsed}
              isDark={isDark}
              hoverColor={tabHover}
              activeColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              onPress={onPress}
            />
          );
        })}
      </View>

      {/* Collapse Toggle */}
      <Pressable
        onPress={toggleCollapse}
        style={({ pressed }) => [
          styles.collapseButton,
          collapsed && styles.collapseButtonCollapsed,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {collapsed ? (
          <ChevronsRight size={18} color={tabInactiveTint} />
        ) : (
          <>
            <Text style={[styles.collapseText, { color: tabInactiveTint }]}>
              Colapsar
            </Text>
            <ChevronsLeft size={18} color={tabInactiveTint} />
          </>
        )}
      </Pressable>
    </View>
  );
}

function SidebarItem({
  icon,
  label,
  color,
  isActive,
  collapsed,
  isDark,
  hoverColor,
  activeColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  isActive: boolean;
  collapsed: boolean;
  isDark: boolean;
  hoverColor: string;
  activeColor: string;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const bgColor = isActive ? activeColor : hovered ? hoverColor : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore — web mouse events
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={[
        styles.navItem,
        collapsed && styles.navItemCollapsed,
        {
          backgroundColor: bgColor,
          // @ts-ignore — web CSS transition
          transition: 'background-color 150ms ease',
        },
      ]}
    >
      <View style={styles.navIconWrap}>{icon}</View>
      {!collapsed && (
        <Text
          style={[styles.navLabel, { color }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      {isActive && (
        <View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: isDark ? '#ffffff' : '#000000',
            },
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%' as any,
    borderRightWidth: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  brandSectionCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  brandIcon: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  navSection: {
    flex: 1,
    paddingTop: 4,
    paddingHorizontal: 10,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    position: 'relative',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  collapseButtonCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  collapseText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
