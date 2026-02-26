import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  fetchAllReservations,
  updateReservation,
  deleteReservation,
} from '@/features/reservations/api';
import type { Reservation } from '@/features/reservations/types';

// ── Helpers ─────────────────────────────────────────────────────
type StatusFilter = 'todas' | 'pendiente' | 'confirmada' | 'cancelado';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:  { label: 'Pendiente',  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/20' },
  confirmada: { label: 'Confirmada', color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-500/20'  },
  cancelado:  { label: 'Cancelada',  color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-500/20'    },
};

const FILTER_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'todas',      label: 'Todas'      },
  { key: 'pendiente',  label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas'},
  { key: 'cancelado',  label: 'Canceladas' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

// ── Screen ──────────────────────────────────────────────────────
export default function AdminReservationsScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor, placeholderText, bgCard, sheetHandle } = useThemeColors();

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const detailSheetRef = useRef<BottomSheet>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: resData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin', 'reservations'],
    queryFn: () => fetchAllReservations(1, 500),
  });

  const reservations = resData?.data ?? [];
  const error = queryError ? 'No se pudieron cargar las reservas.' : null;

  const invalidateReservations = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
  };

  const filtered = useMemo(() => {
    let list = reservations;

    // Status filter
    if (statusFilter !== 'todas') {
      list = list.filter((r) => r.estado === statusFilter);
    }

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.espacio_nombre ?? '').toLowerCase().includes(q) ||
          formatDate(r.fecha_inicio).toLowerCase().includes(q),
      );
    }

    // Sort: upcoming first, then past
    return [...list].sort((a, b) => {
      const now = Date.now();
      const aTime = new Date(a.fecha_inicio).getTime();
      const bTime = new Date(b.fecha_inicio).getTime();
      const aFuture = aTime >= now;
      const bFuture = bTime >= now;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      return aFuture ? aTime - bTime : bTime - aTime;
    });
  }, [reservations, statusFilter, search]);

  // Status counts
  const counts = useMemo(() => {
    const c = { todas: reservations.length, pendiente: 0, confirmada: 0, cancelado: 0 };
    for (const r of reservations) {
      if (r.estado in c) c[r.estado as keyof typeof c]++;
    }
    return c;
  }, [reservations]);

  const openDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    detailSheetRef.current?.snapToIndex(0);
  };

  const handleAction = useCallback(
    async (action: 'confirm' | 'cancel' | 'delete') => {
      if (!selectedReservation) return;

      const messages = {
        confirm: 'Aprobar esta reserva?',
        cancel: 'Rechazar esta reserva?',
        delete: 'Eliminar esta reserva? Esta acción no se puede deshacer.',
      };

      Alert.alert('Confirmar', messages[action], [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              if (action === 'delete') {
                await deleteReservation(selectedReservation.id);
              } else {
                await updateReservation(selectedReservation.id, {
                  estado: action === 'confirm' ? 'confirmada' : 'cancelado',
                });
              }
              detailSheetRef.current?.close();
              invalidateReservations();
            } catch {
              Alert.alert('Error', 'No se pudo realizar la acción');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]);
    },
    [selectedReservation, invalidateReservations],
  );

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  const renderItem = useCallback(
    ({ item: res }: { item: Reservation }) => {
      const status = STATUS_CONFIG[res.estado] ?? STATUS_CONFIG.pendiente;
      const isPast = new Date(res.fecha_inicio).getTime() < Date.now();

      return (
        <Pressable
          onPress={() => openDetail(res)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, marginHorizontal: 16 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className={`p-4 rounded-2xl border border-black/5 dark:border-white/10 ${isPast ? 'opacity-60' : ''}`}
          >
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 mr-2">
                <Text className="text-neutral-950 dark:text-white font-semibold">
                  {res.espacio_nombre || 'Espacio reservado'}
                </Text>
              </View>
              <View className={`px-2 py-0.5 rounded-full ${status.bg}`}>
                <Text className={`text-xs font-bold ${status.color}`}>{status.label}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Calendar color={iconMuted} size={14} />
                <Text className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {formatDate(res.fecha_inicio)}
                </Text>
              </View>
              <Text className="text-neutral-600 dark:text-neutral-400 text-sm">
                {formatTime(res.fecha_inicio)} - {formatTime(res.fecha_fin)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-neutral-500 text-xs">
                {res.personas_esperadas} persona{res.personas_esperadas !== 1 ? 's' : ''}
              </Text>
              {res.costo_total != null && (
                <Text className="text-green-600 dark:text-green-400 text-sm font-semibold">
                  ${res.costo_total.toLocaleString()}
                </Text>
              )}
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, iconMuted],
  );

  const detail = selectedReservation;
  const detailStatus = detail ? (STATUS_CONFIG[detail.estado] ?? STATUS_CONFIG.pendiente) : null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
          <Pressable
            onPress={() => router.navigate('/admin' as any)}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            hitSlop={12}
            className="flex-row items-center gap-2"
          >
            <ArrowLeft color={iconMuted} size={22} />
            <Text className="text-neutral-500 dark:text-neutral-400 text-base font-medium">Atrás</Text>
          </Pressable>
        </View>

        {/* Title + Search */}
        <View className="px-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-xl bg-blue-500/15 items-center justify-center">
              <Calendar color="#60a5fa" size={20} />
            </View>
            <View>
              <Text className="text-neutral-950 dark:text-white text-2xl font-bold">Reservas</Text>
              <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                {reservations.length} total
              </Text>
            </View>
          </View>

          {/* Search */}
          <View className="flex-row items-center gap-3 bg-black/10 dark:bg-white/10 rounded-2xl px-4 py-3 mb-4">
            <Search color={iconMuted} size={18} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por espacio..."
              placeholderTextColor={placeholderText}
              className="flex-1 text-neutral-950 dark:text-white"
            />
          </View>

          {/* Status Filters */}
          <View className="flex-row gap-2 mb-4">
            {FILTER_OPTIONS.map((opt) => {
              const active = statusFilter === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setStatusFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-full border ${
                    active
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {opt.label} ({counts[opt.key]})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={activityColor} />
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <Text className="text-red-600 dark:text-red-400 text-center py-8 px-5">{error}</Text>
        )}

        {/* List */}
        {!loading && !error && (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            {...{ delaysContentTouches: false }}
            ListEmptyComponent={
              <View className="items-center py-16 px-5">
                <Calendar color={iconMuted} size={40} />
                <Text className="text-neutral-500 dark:text-neutral-400 text-center mt-4">
                  {search || statusFilter !== 'todas'
                    ? 'No hay reservas con estos filtros.'
                    : 'No hay reservas registradas.'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Detail BottomSheet */}
      <BottomSheet
        ref={detailSheetRef}
        index={-1}
        snapPoints={['65%']}
        enableDynamicSizing={true}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: bgCard }}
        handleIndicatorStyle={{ backgroundColor: sheetHandle }}
        style={sheetOpen ? undefined : { zIndex: -1 }}
        onChange={(i) => setSheetOpen(i >= 0)}
        containerStyle={sheetOpen ? undefined : { pointerEvents: 'none' as const }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {detail && detailStatus && (
            <View className="gap-4">
              {/* Header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-neutral-950 dark:text-white text-lg font-bold">Detalle</Text>
                  <View className={`px-2 py-0.5 rounded-full ${detailStatus.bg}`}>
                    <Text className={`text-xs font-bold ${detailStatus.color}`}>{detailStatus.label}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => detailSheetRef.current?.close()}
                  className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
                >
                  <X color={iconPrimary} size={20} />
                </Pressable>
              </View>

              {/* Info card */}
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-4 rounded-2xl border border-black/5 dark:border-white/10 gap-4"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center">
                    <MapPin color="#60a5fa" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 text-xs">Espacio</Text>
                    <Text className="text-neutral-950 dark:text-white font-medium">
                      {detail.espacio_nombre || 'Espacio reservado'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center">
                    <Calendar color="#60a5fa" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 text-xs">Fecha</Text>
                    <Text className="text-neutral-950 dark:text-white font-medium">
                      {formatDate(detail.fecha_inicio)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center">
                    <Clock color="#4ade80" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 text-xs">Horario</Text>
                    <Text className="text-neutral-950 dark:text-white font-medium">
                      {formatTime(detail.fecha_inicio)} - {formatTime(detail.fecha_fin)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-purple-500/20 items-center justify-center">
                    <Users color="#a78bfa" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 text-xs">Personas</Text>
                    <Text className="text-neutral-950 dark:text-white font-medium">
                      {detail.personas_esperadas}
                    </Text>
                  </View>
                </View>

                {detail.costo_total != null && (
                  <View className="border-t border-black/10 dark:border-white/10 pt-3 flex-row justify-between items-center">
                    <Text className="text-neutral-600 dark:text-neutral-400">Costo</Text>
                    <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                      ${detail.costo_total.toLocaleString()}
                    </Text>
                  </View>
                )}
              </LiquidView>

              {/* Actions */}
              {actionLoading ? (
                <ActivityIndicator color={activityColor} className="mt-4" />
              ) : (
                <View className="gap-3">
                  {detail.estado === 'pendiente' && (
                    <>
                      <Pressable
                        onPress={() => handleAction('confirm')}
                        className="bg-green-600 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
                      >
                        <CheckCircle2 color="white" size={18} />
                        <Text className="text-white font-bold">Aprobar reserva</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleAction('cancel')}
                        className="bg-black/10 dark:bg-white/10 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 border border-red-500/30"
                      >
                        <XCircle color="#ef4444" size={18} />
                        <Text className="text-red-600 dark:text-red-400 font-bold">Rechazar reserva</Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable
                    onPress={() => handleAction('delete')}
                    className="bg-red-600/15 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
                  >
                    <Trash2 color="#f87171" size={18} />
                    <Text className="text-red-400 font-bold">Eliminar</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
