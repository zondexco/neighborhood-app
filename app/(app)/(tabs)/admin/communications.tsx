import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
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

const ICON_FILTER_OPTIONS = [
  { key: 'all', label: 'Todos', icon: null },
  { key: 'megaphone', label: 'Aviso', icon: Megaphone },
  { key: 'info', label: 'Info', icon: Info },
  { key: 'alert-triangle', label: 'Alerta', icon: AlertTriangle },
  { key: 'calendar', label: 'Evento', icon: Calendar },
  { key: 'wrench', label: 'Manten.', icon: Wrench },
  { key: 'zap', label: 'Urgente', icon: Zap },
  { key: 'heart', label: 'Bienestar', icon: Heart },
  { key: 'shield', label: 'Seguridad', icon: Shield },
] as const;

const DATE_FILTER_OPTIONS = [
  { key: 'all', label: 'Cualquier fecha' },
  { key: 'today', label: 'Hoy' },
  { key: '7d', label: 'Últimos 7 días' },
  { key: '30d', label: 'Últimos 30 días' },
] as const;

type IconFilterKey = (typeof ICON_FILTER_OPTIONS)[number]['key'];
type DateFilterKey = (typeof DATE_FILTER_OPTIONS)[number]['key'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isWithinDays(iso: string, days: number): boolean {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-full border mr-2 ${
        active
          ? 'bg-violet-600 border-violet-600'
          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          active ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AdminCommunicationsScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor, placeholderText } = useThemeColors();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [iconFilter, setIconFilter] = useState<IconFilterKey>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('all');
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
      return () => {
        formRef.current?.close();
      };
    }, [load]),
  );

  const filtered = useMemo(() => {
    return communications.filter((c) => {
      // Text search
      if (search) {
        const q = search.toLowerCase();
        if (!c.titulo.toLowerCase().includes(q) && !c.contenido.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Icon/type filter
      if (iconFilter !== 'all' && c.icono !== iconFilter) return false;
      // Date filter
      if (dateFilter === 'today' && !isToday(c.fecha)) return false;
      if (dateFilter === '7d' && !isWithinDays(c.fecha, 7)) return false;
      if (dateFilter === '30d' && !isWithinDays(c.fecha, 30)) return false;
      return true;
    });
  }, [communications, search, iconFilter, dateFilter]);

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
            className="p-4 rounded-2xl border border-black/5 dark:border-white/10"
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
              <Pressable
                onPress={() => router.back()}
                hitSlop={16}
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center"
              >
                <ArrowLeft color={iconPrimary} size={20} />
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
              clearButtonMode="while-editing"
            />
          </View>

          {/* Filters */}
          <View className="mt-3 gap-2">
            {/* Icon/type filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {ICON_FILTER_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.key}
                  label={opt.label}
                  active={iconFilter === opt.key}
                  onPress={() => setIconFilter(iconFilter === opt.key && opt.key !== 'all' ? 'all' : opt.key)}
                />
              ))}
            </ScrollView>

            {/* Date filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {DATE_FILTER_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.key}
                  label={opt.label}
                  active={dateFilter === opt.key}
                  onPress={() => setDateFilter(dateFilter === opt.key && opt.key !== 'all' ? 'all' : opt.key)}
                />
              ))}
            </ScrollView>
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
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            {...{ delaysContentTouches: false }}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Megaphone color={iconMuted} size={40} />
                <Text className="text-neutral-500 dark:text-neutral-400 text-base mt-3">
                  {search || iconFilter !== 'all' || dateFilter !== 'all'
                    ? 'Sin resultados con estos filtros'
                    : 'Sin comunicados'}
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
