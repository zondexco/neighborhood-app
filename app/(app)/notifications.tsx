import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router, Stack } from 'expo-router';
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
  Package,
  CheckCheck,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchCommunications, markCommunicationRead } from '@/features/communications/api';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/features/notifications/api';
import CommunicationDetailSheet from '@/features/communications/components/CommunicationDetailSheet';
import type { Communication } from '@/features/communications/types';
import type { AppNotification } from '@/features/notifications/types';

// ── Communication icon map ────────────────────────────────────────────────────
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

const NOTIF_CONFIG: Record<string, { color: string; bg: string; Icon: any }> = {
  paquete: { color: '#34d399', bg: 'bg-emerald-500/15', Icon: Package },
  reserva: { color: '#60a5fa', bg: 'bg-blue-500/15', Icon: Calendar },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return diffMin <= 1 ? 'Ahora' : `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

type Section =
  | { key: 'alerts'; title: string; data: AppNotification[] }
  | { key: 'comms'; title: string; data: Communication[] };

export default function NotificationsScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor } = useThemeColors();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const detailRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, commRes] = await Promise.all([
        fetchNotifications(1, 50),
        fetchCommunications(1, 50),
      ]);
      setNotifications(notifRes.data ?? []);
      setCommunications(commRes.data ?? []);
    } catch (e) {
      console.warn('[Notifications] fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        detailRef.current?.close();
      };
    }, [load]),
  );

  const handlePressNotif = useCallback(async (notif: AppNotification) => {
    if (!notif.leido) {
      await markNotificationRead(notif.id).catch(() => null);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, leido: true } : n)),
      );
    }
  }, []);

  const handlePressComm = useCallback((comm: Communication) => {
    setSelectedComm(comm);
    detailRef.current?.snapToIndex(0);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    await markAllNotificationsRead().catch(() => null);
    setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
    setMarkingAll(false);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.leido).length;

  // Build sections — only show non-empty ones
  const sections: Section[] = [];
  if (notifications.length > 0) {
    sections.push({ key: 'alerts', title: 'Alertas', data: notifications });
  }
  if (communications.length > 0) {
    sections.push({ key: 'comms', title: 'Comunicados', data: communications });
  }

  const renderNotifItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const cfg = NOTIF_CONFIG[item.tipo] ?? NOTIF_CONFIG.reserva;
      const Icon = cfg.Icon;
      return (
        <Pressable
          onPress={() => handlePressNotif(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className={`p-4 rounded-2xl border flex-row items-start gap-3 ${
              item.leido ? 'border-black/5 dark:border-white/5' : 'border-emerald-500/25'
            }`}
          >
            <View className={`w-10 h-10 rounded-xl ${cfg.bg} items-center justify-center mt-0.5`}>
              <Icon color={cfg.color} size={20} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {!item.leido && <View className="w-2 h-2 rounded-full bg-emerald-500" />}
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
                <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                  {formatDate(item.fecha_creacion)}
                </Text>
              </View>
              <Text
                className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5"
                numberOfLines={2}
              >
                {item.mensaje}
              </Text>
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, handlePressNotif],
  );

  const renderCommItem = useCallback(
    ({ item }: { item: Communication }) => {
      const iconConfig = ICON_COLORS[item.icono] ?? ICON_COLORS.megaphone;
      const IconComponent = ICON_MAP[item.icono] ?? Megaphone;
      return (
        <Pressable
          onPress={() => handlePressComm(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className={`p-4 rounded-2xl border flex-row items-start gap-3 ${
              item.leido ? 'border-black/5 dark:border-white/5' : 'border-violet-500/20'
            }`}
          >
            <View className={`w-10 h-10 rounded-xl ${iconConfig.bg} items-center justify-center mt-0.5`}>
              <IconComponent color={iconConfig.color} size={20} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                {!item.leido && <View className="w-2 h-2 rounded-full bg-violet-500" />}
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
                <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                  {formatDate(item.fecha)}
                </Text>
              </View>
              <Text
                className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5"
                numberOfLines={2}
              >
                {item.contenido}
              </Text>
              {item.permite_comentarios && item.num_comentarios > 0 && (
                <View className="flex-row items-center gap-1 mt-1.5">
                  <MessageCircle color={iconMuted} size={12} />
                  <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                    {item.num_comentarios}
                  </Text>
                </View>
              )}
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, iconMuted, handlePressComm],
  );

  const renderItem = useCallback(
    ({ item, section }: { item: any; section: Section }) => {
      if (section.key === 'alerts') return renderNotifItem({ item });
      return renderCommItem({ item });
    },
    [renderNotifItem, renderCommItem],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View className="flex-row items-center justify-between pt-2 pb-3">
        <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
          {section.title}
        </Text>
        {section.key === 'alerts' && unreadNotifs > 0 && (
          <Pressable
            onPress={handleMarkAllRead}
            disabled={markingAll}
            className="flex-row items-center gap-1.5"
            style={({ pressed }) => ({ opacity: pressed || markingAll ? 0.6 : 1 })}
          >
            <CheckCheck color="#60a5fa" size={14} />
            <Text className="text-blue-500 dark:text-blue-400 text-xs font-medium">
              Marcar todo leído
            </Text>
          </Pressable>
        )}
      </View>
    ),
    [unreadNotifs, markingAll, handleMarkAllRead],
  );

  const isEmpty = !loading && notifications.length === 0 && communications.length === 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <ArrowLeft color={iconPrimary} size={22} />
              </Pressable>
              <Text className="text-neutral-950 dark:text-white text-xl font-bold">
                Notificaciones
              </Text>
            </View>
            {unreadNotifs > 0 && (
              <View className="bg-emerald-500/15 px-2.5 py-1 rounded-full">
                <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {unreadNotifs} nueva{unreadNotifs !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {/* Content */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={activityColor} />
            </View>
          ) : isEmpty ? (
            <View className="flex-1 items-center justify-center px-8">
              <Megaphone color={iconMuted} size={48} />
              <Text className="text-neutral-500 dark:text-neutral-400 text-base text-center mt-4">
                No hay notificaciones aún
              </Text>
            </View>
          ) : (
            <SectionList
              sections={sections as any}
              keyExtractor={(item: any) => item.id}
              renderItem={renderItem as any}
              renderSectionHeader={renderSectionHeader as any}
              contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              {...{ delaysContentTouches: false }}
            />
          )}
        </SafeAreaView>

        <CommunicationDetailSheet
          ref={detailRef}
          communication={selectedComm}
          onRead={load}
        />
      </View>
    </>
  );
}
