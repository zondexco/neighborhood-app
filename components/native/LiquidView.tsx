import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { cn } from '@/lib/utils';

interface LiquidViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'prominent' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterial' | 'systemMaterialLight' | 'systemThinMaterialLight' | 'systemThickMaterialLight' | 'systemChromeMaterialLight' | 'systemMaterialDark' | 'systemThinMaterialDark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark';
  className?: string; // Support for NativeWind/Tailwind
}

/**
 * LiquidView provides a "Glassmorphism" effect.
 * iOS: Uses native liquid/blur effects.
 * Android/Web: Uses simple translucent fallback (no liquid glass effect).
 */
export const LiquidView: React.FC<LiquidViewProps> = ({ 
  children, 
  intensity = 50, 
  tint = 'default',
  style,
  className,
  pointerEvents,
  ...props 
}) => {

  if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
    return (
      <GlassView
        style={[styles.overflowHidden, style]}
        glassEffectStyle="regular"
        className={className}
        pointerEvents={pointerEvents ?? 'box-none'}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.webGlass, style]}
        className={cn('bg-black/70 border border-white/10', className)}
        pointerEvents={pointerEvents ?? 'box-none'}
        {...props}
      >
        {children}
      </View>
    );
  }
  
  if (Platform.OS === 'android') {
    // Android Fallback: Solid Translucent Color
    // TODO: Improve this with Skia for real-time blur if needed later.
    return (
      <View 
        style={[
          styles.androidGlass, 
          style
        ]} 
        className={cn("bg-black/65 border border-white/15", className)}
        pointerEvents={pointerEvents ?? 'box-none'}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS fallback if GlassView API isn't available.
  return (
    <BlurView 
      intensity={intensity} 
      tint={tint} 
      style={[styles.overflowHidden, style]}
      className={className}
      pointerEvents={pointerEvents ?? 'box-none'}
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
    backgroundColor: 'rgba(10, 10, 10, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
  },
  webGlass: {
    overflow: 'hidden',
  }
});
