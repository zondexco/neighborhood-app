import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Stack } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  ArrowLeft,
  Megaphone,
  AlertTriangle,
  Info,
  Calendar,
  Wrench,
  Shield,
  Heart,
  Zap,
  MessageCircle,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchCommunications, markCommunicationRead } from '@/features/communications/api';
import CommunicationDetailSheet from '@/features/communications/components/CommunicationDetailSheet';
import type { Communication } from '@/features/communications/types';

const ICON_MAP: Record<string, any> = {
  megaphone: Megaphone,
  'alert-triangle': AlertTriangle,
  info: Info,
  calendar: Calendar,
  wrench: Wrench,
  shield: Shield,
  heart: Heart,
  zap: Zap,
};

const ICON_COLORS: Record<string, { color: string; bg: string }> = {
  megaphone: { color: '#a78bfa', bg: 'bg-violet-500/15' },
  'alert-triangle': { color: '#fbbf24', bg: 'bg-amber-500/15' },
  info: { color: '#60a5fa', bg: 'bg-blue-500/15' },
  calendar: { color: '#34d399', bg: 'bg-emerald-500/15' },
  wrench: { color: '#fb923c', bg: 'bg-orange-500/15' },
  shield: { color: '#f472b6', bg: 'bg-pink-500/15' },
  heart: { color: '#f87171', bg: 'bg-red-500/15' },
  zap: { color: '#facc15', bg: 'bg-yellow-500/15' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

export default function NotificationsScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor } = useThemeColors();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const detailRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCommunications(1, 50);
      setCommunications(res.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePress = useCallback((comm: Communication) => {
    setSelectedComm(comm);
    detailRef.current?.snapToIndex(0);
  }, []);

  const handleRead = useCallback(() => {
    // Refresh list to update read status
    load();
  }, [load]);

  const renderItem = useCallback(
    ({ item }: { item: Communication }) => {
      const iconConfig = ICON_COLORS[item.icono] ?? ICON_COLORS.megaphone;
      const IconComponent = ICON_MAP[item.icono] ?? Megaphone;

      return (
        <Pressable
          onPress={() => handlePress(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className={`p-4 rounded-2xl border flex-row items-start gap-3 ${
              item.leido
                ? 'border-black/5 dark:border-white/5'
                : 'border-violet-500/20'
            }`}
          >
            <View
              className={`w-10 h-10 rounded-xl ${iconConfig.bg} items-center justify-center mt-0.5`}
            >
              <IconComponent color={iconConfig.color} size={20} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {!item.leido && (
                  <View className="w-2 h-2 rounded-full bg-violet-500" />
                )}
                <Text
                  className={`flex-1 text-base ${
                    item.leido
                      ? 'text-neutral-700 dark:text-neutral-300 font-medium'
                      : 'text-neutral-950 dark:text-white font-bold'
                  }`}
                  numberOfLines={1}
                >
                  {item.titulo}
                </Text>
              </View>
              <Text
                className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5"
                numberOfLines={2}
              >
                {item.contenido}
              </Text>
              <View className="flex-row items-center gap-3 mt-2">
                <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                  {formatDate(item.fecha)}
                </Text>
                {item.permite_comentarios && item.num_comentarios > 0 && (
                  <View className="flex-row items-center gap-1">
                    <MessageCircle color={iconMuted} size={12} />
                    <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                      {item.num_comentarios}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, iconMuted, handlePress],
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notificaciones',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginRight: 8 }}>
              <ArrowLeft color={iconPrimary} size={22} />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView className="flex-1" edges={['bottom']}>
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={activityColor} />
            </View>
          ) : communications.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Megaphone color={iconMuted} size={48} />
              <Text className="text-neutral-500 dark:text-neutral-400 text-base text-center mt-4">
                No hay comunicados aún
              </Text>
            </View>
          ) : (
            <FlatList
              data={communications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>

        <CommunicationDetailSheet
          ref={detailRef}
          communication={selectedComm}
          onRead={handleRead}
        />
      </View>
    </>
  );
}
