import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { useSettings } from '@/features/settings/useSettings';

export function HapticTab(props: BottomTabBarButtonProps) {
  const buttonStyle: StyleProp<ViewStyle> = [
    props.style,
    {
      flex: 1,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 6,
    },
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
    />
  );
}
