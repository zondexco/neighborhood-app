import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BottomSheet from '@gorhom/bottom-sheet';
import { LiquidView } from '@/components/native/LiquidView';
import { Bell, Package, Calendar, Megaphone, ChevronRight, RefreshCw, HelpCircle, Building2, Users } from 'lucide-react-native';
import { Breakpoints } from '@/constants/theme';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { api } from '@/lib/api';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchUnreadCount, fetchCommunication } from '@/features/communications/api';
import CondominioInfoSheet from '@/features/communications/components/CondominioInfoSheet';
import CommunicationDetailSheet from '@/features/communications/components/CommunicationDetailSheet';
import type { Communication } from '@/features/communications/types';

// ── Types ────────────────────────────────────────────────────
interface ApartmentMember {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

interface ApartmentInfo {
  id: string;
  numero: string;
  torre: string;
  bloque: string;
  piso: number;
  label: string;
}

interface PendingPackage {
  id: string;
  carrier: string;
  received_at: string;
  apartment: string;
}

interface NextReservation {
  id: string;
  espacio_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

interface NewsItem {
  id: string;
  titulo: string;
  fecha: string;
}

interface DashboardSummary {
  packages_pending: number;
  pending_packages: PendingPackage[];
  next_reservation: NextReservation | null;
  recent_news: NewsItem[];
}

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Component ─────────────────────────────────────────────────
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= Breakpoints.tablet;
  const { iconPrimary, iconSubtle, activityColor } = useThemeColors();

  const nombre = useAuth((s: AuthState) => s.nombre);
  const apellido = useAuth((s: AuthState) => s.apellido);
  const email = useAuth((s: AuthState) => s.email);
  const role = useAuth((s: AuthState) => s.role);
  const apartmentId = useAuth((s: AuthState) => s.apartmentId);
  const isResidente = role === 'residente';

  const displayName = nombre
    ? `${nombre}${apellido ? ' ' + apellido : ''}`
    : email?.split('@')[0] ?? 'Usuario';

  const [selectedComm, setSelectedComm] = useState<Communication | null>(null);
  const infoSheetRef = useRef<BottomSheet>(null);
  const detailSheetRef = useRef<BottomSheet>(null);
  const queryClient = useQueryClient();

  const { data: homeData, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['home', 'dashboard', isResidente, apartmentId],
    queryFn: async () => {
      const promises: Promise<any>[] = [
        api.get<DashboardSummary>('/dashboard/summary'),
        fetchUnreadCount().catch(() => 0),
      ];

      if (isResidente && apartmentId) {
        promises.push(
          api.get(`/apartments/${apartmentId}`).catch(() => null),
          api.get<{ data: ApartmentMember[] }>(`/apartments/${apartmentId}/members`).catch(() => null),
        );
      }

      const results = await Promise.all(promises);

      let apartmentInfo: ApartmentInfo | null = null;
      if (isResidente && apartmentId && results[2]) {
        const apt = results[2].data;
        const parts: string[] = [];
        if (apt.torre) parts.push(`Torre ${apt.torre}`);
        if (apt.piso) parts.push(`Piso ${apt.piso}`);
        if (apt.numero) parts.push(`Apt ${apt.numero}`);
        apartmentInfo = {
          id: apt.id,
          numero: apt.numero,
          torre: apt.torre ?? '',
          bloque: apt.bloque ?? '',
          piso: apt.piso ?? 0,
          label: parts.join(' • ') || `Apt ${apt.numero}`,
        };
      }

      return {
        summary: results[0].data as DashboardSummary,
        unreadCount: results[1] as number,
        apartmentInfo,
        apartmentMembers: (isResidente && apartmentId && results[3])
          ? (results[3].data?.data ?? []) as ApartmentMember[]
          : [] as ApartmentMember[],
      };
    },
  });

  const summary = homeData?.summary ?? null;
  const unreadCount = homeData?.unreadCount ?? 0;
  const apartmentInfo = homeData?.apartmentInfo ?? null;
  const apartmentMembers = homeData?.apartmentMembers ?? [];
  const error = queryError ? 'No se pudo cargar la información. Verifica tu conexión.' : null;

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (Platform.OS !== 'web') {
          infoSheetRef.current?.close();
          detailSheetRef.current?.close();
        }
      };
    }, [])
  );

  const openCommunication = useCallback(async (id: string) => {
    try {
      const comm = await fetchCommunication(id);
      setSelectedComm(comm);
      detailSheetRef.current?.snapToIndex(0);
    } catch {
      // fallback: navigate to notifications
      router.push('/notifications' as any);
    }
  }, []);

  const handleCommRead = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['home', 'dashboard'] });
  }, [queryClient]);

  const openPackages = useCallback(() => {
    router.push('/packages' as any);
  }, []);

  const openReservations = useCallback(() => {
    router.push('/reservations' as any);
  }, []);

  // ── Greeting ──────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días,' : hour < 18 ? 'Buenas tardes,' : 'Buenas noches,';

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Decorative gradient */}
      <View
        pointerEvents="none"
        className="absolute top-0 right-0 bg-blue-600/20 rounded-full"
        style={{
          width: Math.min(width * 0.8, 520),
          height: Math.min(width * 0.8, 520),
          transform: [{ translateX: width * 0.22 }, { translateY: -width * 0.25 }],
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          {...{ delaysContentTouches: false }}
        >
          <ResponsiveContainer className="py-6">

            {/* Header */}
            <View className="mb-8 flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-neutral-600 dark:text-neutral-400 text-base font-medium">{greeting}</Text>
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">
                  {displayName}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => infoSheetRef.current?.snapToIndex(0)}
                  className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center border border-black/10 dark:border-white/10"
                >
                  <HelpCircle color={iconPrimary} size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/notifications' as any)}
                  className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 items-center justify-center border border-black/10 dark:border-white/10"
                >
                  <Bell color={iconPrimary} size={20} />
                  {unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                      <Text className="text-white text-[10px] font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Loading state */}
            {loading && (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={activityColor} />
                <Text className="text-neutral-500 mt-4 text-base">Cargando...</Text>
              </View>
            )}

            {/* Error state */}
            {!loading && error && (
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-6 rounded-2xl border border-red-500/20 items-center gap-3"
              >
                <Text className="text-red-600 dark:text-red-400 text-base text-center">{error}</Text>
                <Pressable
                  onPress={() => refetch()}
                  className="flex-row items-center gap-2 bg-black/10 dark:bg-white/10 px-4 py-2 rounded-full"
                >
                  <RefreshCw color={iconPrimary} size={16} />
                  <Text className="text-neutral-950 dark:text-white font-medium">Reintentar</Text>
                </Pressable>
              </LiquidView>
            )}

            {/* Content */}
            {!loading && !error && summary && (
              <View className="gap-6">

                {/* Mi Apartamento — solo para residentes */}
                {isResidente && apartmentInfo && (
                  <View>
                    <Text className="text-neutral-950 dark:text-white text-lg font-bold mb-3">Mi Apartamento</Text>
                    <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-black/5 dark:border-white/10">
                      <View className="flex-row items-center gap-3 mb-3">
                        <View className="w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center">
                          <Building2 color="#818cf8" size={20} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-neutral-500 text-xs">Unidad</Text>
                          <Text className="text-neutral-950 dark:text-white font-semibold">{apartmentInfo.label}</Text>
                        </View>
                      </View>
                      {apartmentMembers.length > 0 && (
                        <View>
                          <View className="flex-row items-center gap-1.5 mb-2">
                            <Users color={iconSubtle} size={13} />
                            <Text className="text-neutral-500 text-xs font-medium">Miembros</Text>
                          </View>
                          <View className="gap-2">
                            {apartmentMembers.map((member) => (
                              <View key={member.id} className="flex-row items-center gap-2">
                                <View className="w-7 h-7 rounded-full bg-purple-500/20 items-center justify-center">
                                  <Text className="text-purple-400 text-[10px] font-bold">
                                    {member.nombre.charAt(0).toUpperCase()}{member.apellido.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                                <Text className="text-neutral-950 dark:text-white text-sm font-medium flex-1">
                                  {member.nombre} {member.apellido}
                                </Text>
                                <Text className="text-neutral-500 text-xs capitalize">{member.rol}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </LiquidView>
                  </View>
                )}

                {/* Paquetes pendientes */}
                <View>
                  <View className="flex-row items-center justify-between mb-3 gap-2">
                    <Text className="text-neutral-950 dark:text-white text-lg font-bold flex-1">Paquetes en Recepción</Text>
                    {summary.packages_pending > 0 && (
                      <View className="bg-orange-500/20 px-3 py-1 rounded-full flex-shrink-0">
                        <Text className="text-orange-600 dark:text-orange-400 text-xs font-bold">
                          {summary.packages_pending} pendiente{summary.packages_pending !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {summary.packages_pending === 0 ? (
                    <Pressable
                      onPress={openPackages}
                      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                      <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-black/5 dark:border-white/10 items-center gap-2">
                        <Package color="#4ade80" size={28} />
                        <Text className="text-neutral-600 dark:text-neutral-400 text-sm text-center">Sin paquetes pendientes</Text>
                      </LiquidView>
                    </Pressable>
                  ) : (
                    <View className={`gap-3 ${isTablet ? 'flex-row flex-wrap' : 'flex-col'}`}>
                      {summary.pending_packages.map((pkg) => (
                        <Pressable
                          key={pkg.id}
                          onPress={openPackages}
                          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        >
                          <LiquidView
                            intensity={15}
                            tint="dark"
                            className="flex-1 p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                            style={isTablet ? { minWidth: '45%' } : undefined}
                          >
                            <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                              <Package color="#fb923c" size={20} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-neutral-950 dark:text-white font-semibold">{pkg.carrier}</Text>
                              <Text className="text-neutral-500 text-xs">
                                Recibido {formatDate(pkg.received_at)}
                              </Text>
                            </View>
                            <ChevronRight color={iconSubtle} size={16} />
                          </LiquidView>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Próxima reserva */}
                <View>
                  <Text className="text-neutral-950 dark:text-white text-lg font-bold mb-3">Próxima Reserva</Text>
                  {!summary.next_reservation ? (
                    <Pressable
                      onPress={openReservations}
                      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                      <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-black/5 dark:border-white/10 items-center gap-2">
                        <Calendar color="#60a5fa" size={28} />
                        <Text className="text-neutral-600 dark:text-neutral-400 text-sm text-center">Sin reservas próximas</Text>
                      </LiquidView>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={openReservations}
                      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                    >
                      <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-black/5 dark:border-white/10">
                        <View className="flex-row items-center gap-3">
                          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                            <Calendar color="#60a5fa" size={20} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-neutral-950 dark:text-white font-semibold">Reserva de espacio</Text>
                            <Text className="text-neutral-600 dark:text-neutral-400 text-sm">
                              {formatDateTime(summary.next_reservation.fecha_inicio)}
                            </Text>
                            <View className="mt-1">
                              <Text className="text-blue-600 dark:text-blue-400 text-xs font-medium capitalize">
                                {summary.next_reservation.estado}
                              </Text>
                            </View>
                          </View>
                          <ChevronRight color={iconSubtle} size={16} />
                        </View>
                      </LiquidView>
                    </Pressable>
                  )}
                </View>

                {/* Comunicados recientes */}
                <View>
                  <Text className="text-neutral-950 dark:text-white text-lg font-bold mb-3">Comunicados</Text>
                  {summary.recent_news.length === 0 ? (
                    <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-black/5 dark:border-white/10 items-center gap-2">
                      <Megaphone color="#a78bfa" size={28} />
                      <Text className="text-neutral-600 dark:text-neutral-400 text-sm text-center">Sin comunicados recientes</Text>
                    </LiquidView>
                  ) : (
                    <View className="gap-3">
                      {summary.recent_news.map((news) => (
                        <Pressable
                          key={news.id}
                          onPress={() => openCommunication(news.id)}
                          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        >
                          <LiquidView
                            intensity={15}
                            tint="dark"
                            className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                          >
                            <View className="w-2 h-2 rounded-full bg-purple-500 mt-1" />
                            <View className="flex-1">
                              <Text className="text-neutral-950 dark:text-white font-medium">{news.titulo}</Text>
                              <Text className="text-neutral-500 text-xs mt-0.5">
                                {formatDate(news.fecha)}
                              </Text>
                            </View>
                            <ChevronRight color={iconSubtle} size={16} />
                          </LiquidView>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

              </View>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>

      <CondominioInfoSheet ref={infoSheetRef} />
      <CommunicationDetailSheet
        ref={detailSheetRef}
        communication={selectedComm}
        onRead={handleCommRead}
      />
    </View>
  );
}
