import React from 'react';
import { View, StyleSheet, Platform, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { cn } from '@/lib/utils';
import { useThemeColors } from '@/hooks/useThemeColors';

interface LiquidViewProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'prominent' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterial' | 'systemMaterialLight' | 'systemThinMaterialLight' | 'systemThickMaterialLight' | 'systemChromeMaterialLight' | 'systemMaterialDark' | 'systemThinMaterialDark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark';
  className?: string;
}

// Map tint prop to GlassView glassEffectStyle.
// GlassView ignores tint/intensity — it adapts to the system appearance.
// We coerce explicit dark/light tints to the appropriate GlassView style.
function toGlassEffectStyle(
  tint: string,
): 'regular' | 'prominent' | 'extraProminentLight' | 'extraProminentDark' {
  const t = tint.toLowerCase();
  if (t === 'dark' || t.endsWith('dark')) return 'extraProminentDark';
  if (t === 'light' || t.endsWith('light')) return 'extraProminentLight';
  if (t === 'prominent') return 'prominent';
  return 'regular';
}

/**
 * LiquidView provides a "Glassmorphism" effect.
 *
 * iOS (expo-glass-effect available): GlassView is used as an absolute background
 * layer inside a regular View. This ensures that NativeWind className and the
 * style prop (border-radius, borders, padding, positioning) are applied correctly
 * by the outer View, while GlassView fills it with the native glass material.
 *
 * iOS (fallback): expo-blur BlurView.
 * Android/Web: translucent View with theme-aware colors.
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
  const { isDark } = useThemeColors();

  // ── iOS with native glass (expo-glass-effect) ─────────────────────────────
  if (Platform.OS === 'ios' && isGlassEffectAPIAvailable()) {
    return (
      <View
        style={[styles.overflowHidden, style]}
        className={className}
        pointerEvents={pointerEvents}
        {...props}
      >
        {/* GlassView as absolute background — fills the parent View */}
        <GlassView
          style={StyleSheet.absoluteFillObject}
          glassEffectStyle={toGlassEffectStyle(tint)}
          pointerEvents="none"
        />
        {children}
      </View>
    );
  }

  // ── Web ───────────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    const webGlassStyle = {
      overflow: 'hidden' as const,
      backgroundColor: isDark ? 'rgba(10, 10, 10, 0.4)' : 'rgba(255, 255, 255, 0.55)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)',
      borderWidth: 1,
      backdropFilter: 'blur(24px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
      boxShadow: isDark
        ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
        : '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    };
    return (
      <View
        style={[webGlassStyle as any, style]}
        className={cn(isDark ? 'border border-white/12' : 'border border-black/10', className)}
        pointerEvents={pointerEvents}
        {...props}
      >
        {children}
      </View>
    );
  }

  // ── Android ───────────────────────────────────────────────────────────────
  if (Platform.OS === 'android') {
    const androidGlassStyle = {
      backgroundColor: isDark ? 'rgba(10, 10, 10, 0.55)' : 'rgba(255, 255, 255, 0.65)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)',
      borderWidth: 1,
    };
    return (
      <View
        style={[androidGlassStyle as any, styles.overflowHidden, style]}
        className={cn(isDark ? 'border border-white/15' : 'border border-black/10', className)}
        pointerEvents={pointerEvents}
        {...props}
      >
        {children}
      </View>
    );
  }

  // ── iOS fallback — BlurView (adapts to system appearance automatically) ───
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
