import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  ArrowLeft,
  Plus,
  Search,
  Megaphone,
  AlertTriangle,
  Info,
  Calendar,
  Wrench,
  Shield,
  Heart,
  Zap,
  Clock,
  Eye,
  EyeOff,
  MessageCircle,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchAdminCommunications } from '@/features/communications/api';
import CommunicationFormSheet from '@/features/admin/components/CommunicationFormSheet';
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

const ICON_COLORS: Record<string, string> = {
  megaphone: '#a78bfa',
  'alert-triangle': '#fbbf24',
  info: '#60a5fa',
  calendar: '#34d399',
  wrench: '#fb923c',
  shield: '#f472b6',
  heart: '#f87171',
  zap: '#facc15',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCommunicationsScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor, placeholderText } = useThemeColors();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const formRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCommunications(1, 200);
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

  const filtered = communications.filter(
    (c) =>
      c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      c.contenido.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = useCallback(() => {
    setSelectedComm(null);
    formRef.current?.snapToIndex(0);
  }, []);

  const openEdit = useCallback((comm: Communication) => {
    setSelectedComm(comm);
    formRef.current?.snapToIndex(0);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Communication }) => {
      const IconComponent = ICON_MAP[item.icono] ?? Megaphone;
      const iconColor = ICON_COLORS[item.icono] ?? '#a78bfa';

      return (
        <Pressable
          onPress={() => openEdit(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5"
          >
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-xl bg-violet-500/10 items-center justify-center">
                <IconComponent color={iconColor} size={20} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-neutral-950 dark:text-white text-base font-semibold"
                  numberOfLines={1}
                >
                  {item.titulo}
                </Text>
                <Text
                  className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5"
                  numberOfLines={1}
                >
                  {item.contenido}
                </Text>
                <View className="flex-row items-center gap-3 mt-2 flex-wrap">
                  <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                    {formatDate(item.fecha)}
                  </Text>
                  {/* Status badges */}
                  <View className="flex-row items-center gap-1">
                    {item.publicado ? (
                      <Eye color="#34d399" size={12} />
                    ) : (
                      <EyeOff color="#f87171" size={12} />
                    )}
                    <Text
                      className={`text-xs ${
                        item.publicado
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      {item.publicado ? 'Publicado' : 'Borrador'}
                    </Text>
                  </View>
                  {item.programado_para && (
                    <View className="flex-row items-center gap-1">
                      <Clock color={iconMuted} size={12} />
                      <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                        Programado
                      </Text>
                    </View>
                  )}
                  {item.permite_comentarios && (
                    <View className="flex-row items-center gap-1">
                      <MessageCircle color={iconMuted} size={12} />
                      <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                        Comentarios
                      </Text>
                    </View>
                  )}
                  {item.roles_destino && item.roles_destino.length > 0 && (
                    <Text className="text-violet-500 dark:text-violet-400 text-xs">
                      {item.roles_destino.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, iconMuted, openEdit],
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <ArrowLeft color={iconPrimary} size={22} />
              </Pressable>
              <Text className="text-neutral-950 dark:text-white text-xl font-bold">
                Comunicados
              </Text>
            </View>
            <Pressable
              onPress={openCreate}
              className="bg-violet-600 px-4 py-2 rounded-xl flex-row items-center gap-1.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Plus color="white" size={16} />
              <Text className="text-white font-semibold text-sm">Nuevo</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-black/5 dark:bg-white/5 rounded-xl px-4 gap-2">
            <Search color={iconMuted} size={18} />
            <TextInput
              className="flex-1 py-3 text-neutral-950 dark:text-white text-base"
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar comunicados..."
              placeholderTextColor={placeholderText}
            />
          </View>
        </View>

        {/* List */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={activityColor} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Megaphone color={iconMuted} size={40} />
                <Text className="text-neutral-500 dark:text-neutral-400 text-base mt-3">
                  {search ? 'Sin resultados' : 'Sin comunicados'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <CommunicationFormSheet
        ref={formRef}
        communication={selectedComm}
        onSaved={load}
      />
    </View>
  );
}
