import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import { Calendar, Plus, RefreshCw, Eye } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { Breakpoints } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import {
  fetchMyReservations,
  fetchAllReservations,
  fetchSpaces,
} from '@/features/reservations/api';
import type { Reservation, Space } from '@/features/reservations/types';
import CreateReservationSheet from '@/features/reservations/components/CreateReservationSheet';
import ReservationDetailSheet from '@/features/reservations/components/ReservationDetailSheet';
import SpacesManagement from '@/features/reservations/components/SpacesManagement';
import SpaceFormSheet from '@/features/reservations/components/SpaceFormSheet';

// ── Helpers ───────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  confirmada: { label: 'Confirmada', color: 'text-green-400', bg: 'bg-green-500/20' },
  cancelado: { label: 'Cancelada', color: 'text-red-400', bg: 'bg-red-500/20' },
};

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

// ── Screen ────────────────────────────────────────────────────
export default function ReservationsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= Breakpoints.tablet;

  const userId = useAuth((s: AuthState) => s.userId);
  const role = useAuth((s: AuthState) => s.role);
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);
  const isEmployee = role === 'empleado';
  const canCreate = !isEmployee; // residentes y admins pueden crear

  // Data state
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet state
  const createSheetRef = useRef<BottomSheet>(null);
  const detailSheetRef = useRef<BottomSheet>(null);
  const spaceFormSheetRef = useRef<BottomSheet>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);

  // ── Fetch data ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Residentes ven solo las suyas, empleados y admins ven todas
      const resData =
        !isAdmin && !isEmployee && userId
          ? await fetchMyReservations(userId)
          : await fetchAllReservations();
      setReservations(resData.data ?? []);

      // Admins también cargan espacios para gestión
      if (isAdmin) {
        const spacesData = await fetchSpaces();
        setSpaces(spacesData.data ?? []);
      }
    } catch {
      setError('No se pudieron cargar las reservas. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin, isEmployee]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // ── Handlers ────────────────────────────────────────────────
  const openCreateSheet = () => createSheetRef.current?.snapToIndex(0);

  const openDetailSheet = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    detailSheetRef.current?.snapToIndex(0);
  };

  const openSpaceForm = (space?: Space) => {
    setEditingSpace(space ?? null);
    spaceFormSheetRef.current?.snapToIndex(0);
  };

  // ── Sorting: upcoming first, then past ──────────────────────
  const sortedReservations = [...reservations].sort((a, b) => {
    const now = Date.now();
    const aTime = new Date(a.fecha_inicio).getTime();
    const bTime = new Date(b.fecha_inicio).getTime();
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return aFuture ? aTime - bTime : bTime - aTime;
  });

  return (
    <View className="flex-1 bg-black">
      {/* Decorative gradient */}
      <View
        className="absolute top-0 left-0 bg-blue-600/15 rounded-full"
        style={{
          width: Math.min(width * 0.7, 400),
          height: Math.min(width * 0.7, 400),
          transform: [{ translateX: -width * 0.2 }, { translateY: -width * 0.15 }],
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <ResponsiveContainer className="py-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-white text-2xl font-bold">Reservas</Text>
                {isEmployee && (
                  <View className="flex-row items-center gap-1.5 mt-1.5 bg-blue-500/10 self-start px-3 py-1 rounded-full">
                    <Eye color="#60a5fa" size={14} />
                    <Text className="text-blue-400 text-xs font-medium">Solo lectura</Text>
                  </View>
                )}
              </View>
              {canCreate && (
                <Pressable
                  onPress={openCreateSheet}
                  className="flex-row items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-full"
                >
                  <Plus color="white" size={18} />
                  <Text className="text-white font-semibold text-sm">Nueva</Text>
                </Pressable>
              )}
            </View>

            {/* Loading */}
            {loading && (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-neutral-500 mt-4 text-base">Cargando...</Text>
              </View>
            )}

            {/* Error */}
            {!loading && error && (
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-6 rounded-2xl border border-red-500/20 items-center gap-3"
              >
                <Text className="text-red-400 text-base text-center">{error}</Text>
                <Pressable
                  onPress={fetchData}
                  className="flex-row items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
                >
                  <RefreshCw color="white" size={16} />
                  <Text className="text-white font-medium">Reintentar</Text>
                </Pressable>
              </LiquidView>
            )}

            {/* Content */}
            {!loading && !error && (
              <View className="gap-6">
                {/* Admin: Spaces Management */}
                {isAdmin && (
                  <SpacesManagement
                    spaces={spaces}
                    loading={false}
                    onRefresh={fetchData}
                    onCreateSpace={() => openSpaceForm()}
                    onEditSpace={(space) => openSpaceForm(space)}
                  />
                )}

                {/* Reservations list */}
                <View>

                  {sortedReservations.length === 0 ? (
                    <LiquidView
                      intensity={15}
                      tint="dark"
                      className="p-6 rounded-2xl border border-white/5 items-center gap-3"
                    >
                      <Calendar color="#60a5fa" size={32} />
                      <Text className="text-neutral-400 text-sm text-center">
                        {canCreate
                          ? 'No tienes reservas aún. Crea una nueva reserva para empezar.'
                          : 'No hay reservas registradas.'}
                      </Text>
                    </LiquidView>
                  ) : (
                    <View className={`gap-3 ${isTablet ? 'flex-row flex-wrap' : 'flex-col'}`}>
                      {sortedReservations.map((res) => {
                        const status = statusConfig[res.estado] ?? statusConfig.pendiente;
                        const isPast = new Date(res.fecha_inicio).getTime() < Date.now();

                        return (
                          <Pressable
                            key={res.id}
                            onPress={() => openDetailSheet(res)}
                            style={isTablet ? { minWidth: '48%', flexBasis: '48%' } : undefined}
                          >
                            <LiquidView
                              intensity={15}
                              tint="dark"
                              className={`p-4 rounded-2xl border border-white/5 ${isPast ? 'opacity-60' : ''}`}
                            >
                              <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1 mr-2">
                                  <Text className="text-white font-semibold" numberOfLines={1}>
                                    {res.espacio_nombre || 'Espacio reservado'}
                                  </Text>
                                </View>
                                <View className={`px-2 py-0.5 rounded-full ${status.bg}`}>
                                  <Text className={`text-xs font-bold ${status.color}`}>
                                    {status.label}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row items-center gap-4">
                                <View className="flex-row items-center gap-1.5">
                                  <Calendar color="#a1a1aa" size={14} />
                                  <Text className="text-neutral-400 text-sm">
                                    {formatDate(res.fecha_inicio)}
                                  </Text>
                                </View>
                                <Text className="text-neutral-400 text-sm">
                                  {formatTime(res.fecha_inicio)} - {formatTime(res.fecha_fin)}
                                </Text>
                              </View>

                              <View className="flex-row items-center justify-between mt-2">
                                <Text className="text-neutral-500 text-xs">
                                  {res.personas_esperadas} persona
                                  {res.personas_esperadas !== 1 ? 's' : ''}
                                </Text>
                                {res.costo_total != null && (
                                  <Text className="text-green-400 text-sm font-semibold">
                                    ${res.costo_total.toLocaleString()}
                                  </Text>
                                )}
                              </View>
                            </LiquidView>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Sheets */}
      <CreateReservationSheet ref={createSheetRef} onCreated={fetchData} />

      <ReservationDetailSheet
        ref={detailSheetRef}
        reservation={selectedReservation}
        role={role}
        isAdmin={isAdmin}
        onUpdated={fetchData}
      />

      {isAdmin && (
        <SpaceFormSheet ref={spaceFormSheetRef} space={editingSpace} onSaved={fetchData} />
      )}
    </View>
  );
}
