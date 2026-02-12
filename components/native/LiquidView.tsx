import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

interface LiquidViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'prominent' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterial' | 'systemMaterialLight' | 'systemThinMaterialLight' | 'systemThickMaterialLight' | 'systemChromeMaterialLight' | 'systemMaterialDark' | 'systemThinMaterialDark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark';
  className?: string; // Support for NativeWind/Tailwind
}

/**
 * LiquidView provides a "Glassmorphism" effect.
 * iOS: Uses native standard Blur (via expo-blur which maps to UIVisualEffectView).
 * Android: Simulates glass with translucent background.
 * Web: Uses CSS backdrop-filter.
 */
export const LiquidView: React.FC<LiquidViewProps> = ({ 
  children, 
  intensity = 50, 
  tint = 'default',
  style,
  className,
  ...props 
}) => {
  
  if (Platform.OS === 'android') {
    // Android Fallback: Solid Translucent Color
    // TODO: Improve this with Skia for real-time blur if needed later.
    return (
      <View 
        style={[
          styles.androidGlass, 
          style
        ]} 
        className={cn("bg-white/80 dark:bg-black/60 border border-white/20", className)}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS & Web (Expo Blur supports web mostly)
  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      style={[styles.overflowHidden, style]}
      className={className}
      {...props}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  overflowHidden: {
    overflow: 'hidden',
  },
  androidGlass: {
    // Basic fallback styles if Tailwind isn't loaded yet
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  }
});
