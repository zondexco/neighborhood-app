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
        pointerEvents={pointerEvents}
        {...props}
      >
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === 'web') {
    const webGlassStyle = {
      overflow: 'hidden' as const,
      backgroundColor: 'rgba(10, 10, 10, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      backdropFilter: 'blur(24px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    };
    return (
      <View
        style={[webGlassStyle as any, style]}
        className={cn('border border-white/12', className)}
        pointerEvents={pointerEvents}
        {...props}
      >
        {children}
      </View>
    );
  }
  
  if (Platform.OS === 'android') {
    const androidGlassStyle = {
      backgroundColor: 'rgba(10, 10, 10, 0.55)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    };
    return (
      <View 
        style={[androidGlassStyle as any, style]} 
        className={cn("border border-white/15", className)}
        pointerEvents={pointerEvents}
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
      pointerEvents={pointerEvents}
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
});


