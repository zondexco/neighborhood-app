import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { useSettings } from './useSettings';

interface TextScaleContextValue {
  textScale: number;
}

const TextScaleContext = createContext<TextScaleContextValue>({ textScale: 1 });

export function useTextScale() {
  return useContext(TextScaleContext);
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const textScale = useSettings((s) => s.textScale);

  const textVars = vars({
    '--text-xs':   `${Math.round(12 * textScale)}px`,
    '--text-sm':   `${Math.round(14 * textScale)}px`,
    '--text-base': `${Math.round(16 * textScale)}px`,
    '--text-lg':   `${Math.round(18 * textScale)}px`,
    '--text-xl':   `${Math.round(20 * textScale)}px`,
    '--text-2xl':  `${Math.round(24 * textScale)}px`,
    '--text-3xl':  `${Math.round(30 * textScale)}px`,
    '--text-4xl':  `${Math.round(36 * textScale)}px`,
  });

  return (
    <TextScaleContext.Provider value={{ textScale }}>
      <View style={[textVars, { flex: 1 }]}>
        {children}
      </View>
    </TextScaleContext.Provider>
  );
}
