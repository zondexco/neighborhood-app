import React, { useEffect, useRef } from 'react';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useSettings } from '@/features/settings/useSettings';
import { useThemeColors } from '@/hooks/useThemeColors';

export function HapticTab(props: BottomTabBarButtonProps) {
  const selected = props.accessibilityState?.selected ?? false;
  const { isDark } = useThemeColors();
  const mounted = useRef(false);

  const scale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    // Skip animation on first render — state already reflected via initial values
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    indicatorOpacity.value = withSpring(selected ? 1 : 0, {
      damping: 18,
      stiffness: 200,
    });
    if (selected) {
      // Spring "bounce" when tab becomes active
      scale.value = withSequence(
        withSpring(0.84, { damping: 20, stiffness: 300 }),
        withSpring(1.0, { damping: 10, stiffness: 160 }),
      );
    }
  }, [selected]);

  const contentAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorAnimStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
  }));

  const buttonStyle: StyleProp<ViewStyle> = [
    props.style,
    styles.button,
  ];

  return (
    <PlatformPressable
      {...props}
      style={buttonStyle}
      hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
      pressRetentionOffset={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios' && useSettings.getState().hapticEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    >
      {/* Glass pill indicator — fades in/out with spring when tab is active */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: 16,
            margin: 3,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.11)'
              : 'rgba(0,0,0,0.07)',
          },
          indicatorAnimStyle,
        ]}
      />
      {/* Icon + label — spring scale when switching tabs */}
      <Animated.View style={[styles.content, contentAnimStyle]}>
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    width: '100%',
  },
});
