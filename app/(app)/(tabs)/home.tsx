import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { LiquidView } from '@/components/native/LiquidView';
import { Bell, Package, Calendar, Megaphone, ChevronRight, RefreshCw } from 'lucide-react-native';
import { Breakpoints } from '@/constants/theme';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { api } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────
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

  const nombre = useAuth((s: AuthState) => s.nombre);
  const apellido = useAuth((s: AuthState) => s.apellido);
  const email = useAuth((s: AuthState) => s.email);

  const displayName = nombre
    ? `${nombre}${apellido ? ' ' + apellido : ''}`
    : email?.split('@')[0] ?? 'Usuario';

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardSummary>('/dashboard/summary');
      setSummary(res.data);
    } catch {
      setError('No se pudo cargar la información. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchSummary);

  // ── Greeting ──────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días,' : hour < 18 ? 'Buenas tardes,' : 'Buenas noches,';

  return (
    <View className="flex-1 bg-black">
      {/* Decorative gradient */}
      <View
        className="absolute top-0 right-0 bg-blue-600/20 rounded-full"
        style={{
          width: Math.min(width * 0.8, 520),
          height: Math.min(width * 0.8, 520),
          transform: [{ translateX: width * 0.22 }, { translateY: -width * 0.25 }],
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <ResponsiveContainer className="py-6">

            {/* Header */}
            <View className="mb-8 flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-neutral-400 text-base font-medium">{greeting}</Text>
                <Text className="text-white text-2xl font-bold" numberOfLines={1}>
                  {displayName}
                </Text>
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center border border-white/10">
                <Bell color="white" size={20} />
              </TouchableOpacity>
            </View>

            {/* Loading state */}
            {loading && (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color="white" />
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
                <Text className="text-red-400 text-base text-center">{error}</Text>
                <Pressable
                  onPress={fetchSummary}
                  className="flex-row items-center gap-2 bg-white/10 px-4 py-2 rounded-full"
                >
                  <RefreshCw color="white" size={16} />
                  <Text className="text-white font-medium">Reintentar</Text>
                </Pressable>
              </LiquidView>
            )}

            {/* Content */}
            {!loading && !error && summary && (
              <View className="gap-6">

                {/* Paquetes pendientes */}
                <View>
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-lg font-bold">Paquetes en Recepción</Text>
                    {summary.packages_pending > 0 && (
                      <View className="bg-orange-500/20 px-3 py-1 rounded-full">
                        <Text className="text-orange-400 text-xs font-bold">
                          {summary.packages_pending} pendiente{summary.packages_pending !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {summary.packages_pending === 0 ? (
                    <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-white/5 items-center gap-2">
                      <Package color="#4ade80" size={28} />
                      <Text className="text-neutral-400 text-sm text-center">Sin paquetes pendientes</Text>
                    </LiquidView>
                  ) : (
                    <View className={`gap-3 ${isTablet ? 'flex-row flex-wrap' : 'flex-col'}`}>
                      {summary.pending_packages.map((pkg) => (
                        <LiquidView
                          key={pkg.id}
                          intensity={15}
                          tint="dark"
                          className="flex-1 p-4 rounded-2xl border border-white/5 flex-row items-center gap-3"
                          style={isTablet ? { minWidth: '45%' } : undefined}
                        >
                          <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                            <Package color="#fb923c" size={20} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-white font-semibold">{pkg.carrier}</Text>
                            <Text className="text-neutral-500 text-xs">
                              Recibido {formatDate(pkg.received_at)}
                            </Text>
                          </View>
                          <ChevronRight color="#555" size={16} />
                        </LiquidView>
                      ))}
                    </View>
                  )}
                </View>

                {/* Próxima reserva */}
                <View>
                  <Text className="text-white text-lg font-bold mb-3">Próxima Reserva</Text>
                  {!summary.next_reservation ? (
                    <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-white/5 items-center gap-2">
                      <Calendar color="#60a5fa" size={28} />
                      <Text className="text-neutral-400 text-sm text-center">Sin reservas próximas</Text>
                    </LiquidView>
                  ) : (
                    <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                          <Calendar color="#60a5fa" size={20} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-white font-semibold">Reserva de espacio</Text>
                          <Text className="text-neutral-400 text-sm">
                            {formatDateTime(summary.next_reservation.fecha_inicio)}
                          </Text>
                          <View className="mt-1">
                            <Text className="text-blue-400 text-xs font-medium capitalize">
                              {summary.next_reservation.estado}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight color="#555" size={16} />
                      </View>
                    </LiquidView>
                  )}
                </View>

                {/* Comunicados recientes */}
                <View>
                  <Text className="text-white text-lg font-bold mb-3">Comunicados</Text>
                  {summary.recent_news.length === 0 ? (
                    <LiquidView intensity={15} tint="dark" className="p-5 rounded-2xl border border-white/5 items-center gap-2">
                      <Megaphone color="#a78bfa" size={28} />
                      <Text className="text-neutral-400 text-sm text-center">Sin comunicados recientes</Text>
                    </LiquidView>
                  ) : (
                    <View className="gap-3">
                      {summary.recent_news.map((news) => (
                        <LiquidView
                          key={news.id}
                          intensity={15}
                          tint="dark"
                          className="p-4 rounded-2xl border border-white/5 flex-row items-center gap-3"
                        >
                          <View className="w-2 h-2 rounded-full bg-purple-500 mt-1" />
                          <View className="flex-1">
                            <Text className="text-white font-medium">{news.titulo}</Text>
                            <Text className="text-neutral-500 text-xs mt-0.5">
                              {formatDate(news.fecha)}
                            </Text>
                          </View>
                          <ChevronRight color="#555" size={16} />
                        </LiquidView>
                      ))}
                    </View>
                  )}
                </View>

              </View>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
