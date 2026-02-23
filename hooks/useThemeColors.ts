import { useSettings } from '@/features/settings/useSettings';

export function useThemeColors() {
  const isDark = useSettings((s) => s.theme) === 'dark';
  return {
    isDark,
    iconPrimary:    isDark ? '#ffffff' : '#18181b',
    iconMuted:      isDark ? '#a1a1aa' : '#71717a',
    iconSubtle:     isDark ? '#555555' : '#aaaaaa',
    bgPrimary:      isDark ? '#000000' : '#ffffff',
    bgSecondary:    isDark ? '#0a0a0a' : '#f5f5f5',
    bgCard:         isDark ? '#141414' : '#f0f0f0',
    border:         isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    activityColor:  isDark ? 'white'   : '#18181b',
    headerBg:       isDark ? '#0a0a0a' : '#ffffff',
    headerTint:     isDark ? '#ffffff' : '#000000',
    tabActiveTint:  isDark ? '#ffffff' : '#000000',
    tabInactiveTint:isDark ? '#a1a1aa' : '#71717a',
    tabSidebarBg:   isDark ? '#0a0a0a' : '#f9f9f9',
    sceneBg:        isDark ? '#000000' : '#ffffff',
    placeholderText:isDark ? '#404040' : '#a3a3a3',
    sheetHandle:    isDark ? '#555555' : '#cccccc',
  } as const;
}
