import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';

export const TEXT_SIZES = [
  { label: 'Pequeño', value: 0.85 },
  { label: 'Normal', value: 1 },
  { label: 'Grande', value: 1.15 },
  { label: 'Muy grande', value: 1.3 },
] as const;

export type ThemeMode = 'dark' | 'light';

export interface SettingsState {
  theme: ThemeMode;
  textSizeIndex: number;
  textScale: number;
  hasHydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  setTextSizeIndex: (index: number) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      textSizeIndex: 1,
      textScale: 1,
      hasHydrated: false,
      setTheme: (theme) => set({ theme }),
      setTextSizeIndex: (index) => {
        const clamped = Math.max(0, Math.min(TEXT_SIZES.length - 1, index));
        set({ textSizeIndex: clamped, textScale: TEXT_SIZES[clamped].value });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'neighborhood-settings',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        theme: state.theme,
        textSizeIndex: state.textSizeIndex,
        textScale: state.textScale,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
