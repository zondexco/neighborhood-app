import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
} from 'react-native-reanimated';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const TAB_HEIGHT = 88;
const INDICATOR_HEIGHT = 54;
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 100,
  mass: 0.8,
};

export function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Calculate tab dimensions
  const paddingX = 16;
  const tabBarWidth = windowWidth - (paddingX * 2);
  const tabItemWidth = tabBarWidth / state.routes.length;
  
  const selectedIndex = state.index;
  const translateX = useSharedValue(selectedIndex * tabItemWidth);
  const pillWidthScale = useSharedValue(1);

  useEffect(() => {
    const targetX = selectedIndex * tabItemWidth;
    
    // Stretch animation: increase width while moving, then spring back
    // This gives the "jumping/liquid" bubble feel
    pillWidthScale.value = withSequence(
      withSpring(1.5, { damping: 10, stiffness: 120 }), // Stretch
      withSpring(1, SPRING_CONFIG) // Snap back
    );
    
    // Move animation
    translateX.value = withSpring(targetX, SPRING_CONFIG);
  }, [selectedIndex, tabItemWidth]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scaleX: pillWidthScale.value },
      ],
    };
  });

  // Glass indicator component
  const Indicator = () => {
    if (Platform.OS === 'ios') {
      return (
        <GlassView
          style={styles.pill}
          glassEffectStyle="regular"
        />
      );
    }
    return (
      <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 16) }]}>
      {/* Background Liquid Bar */}
      <View style={styles.backgroundContainer}>
        {Platform.OS === 'ios' ? (
          <GlassView style={styles.backgroundGlass} glassEffectStyle="regular" />
        ) : (
          <View style={[styles.backgroundGlass, { backgroundColor: 'rgba(10,10,10,0.85)' }]}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          </View>
        )}
      </View>

      {/* Floating Indicator (The Bubble) */}
      <Animated.View 
        style={[
          styles.indicatorWrapper, 
          { width: tabItemWidth },
          animatedPillStyle
        ]}
      >
        <Indicator />
      </Animated.View>

      {/* Tab Items */}
      <View style={styles.tabItemsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {Icon && Icon({
                  focused: isFocused,
                  color: isFocused ? '#FFFFFF' : '#9CA3AF',
                  size: 24,
                })}
              </View>
              <Animated.Text 
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#FFFFFF' : '#9CA3AF' }
                ]}
              >
                {options.title ?? route.name}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: TAB_HEIGHT,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  backgroundGlass: {
    flex: 1,
  },
  indicatorWrapper: {
    position: 'absolute',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pill: {
    width: '88%',
    height: INDICATOR_HEIGHT,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  tabItemsContainer: {
    flexDirection: 'row',
    height: '100%',
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  iconContainer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
