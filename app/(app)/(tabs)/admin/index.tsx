import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Shield, Users, Building2, RefreshCw, MessageSquare } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { fetchAdminStats, fetchCondominio } from '@/features/admin/api';
import type { AdminStats, Condominio } from '@/features/admin/types';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AdminDashboard() {
  const { width } = useWindowDimensions();
  const { isDark, iconMuted, activityColor } = useThemeColors();
  const condominioName = useAuth((s: AuthState) => s.condominioName);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [condominio, setCondominio] = useState<Condominio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, condData] = await Promise.all([
        fetchAdminStats(),
        fetchCondominio(),
      ]);
      setStats(statsData);
      setCondominio(condData);
    } catch {
      // Silently fail — stats are non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const statCards = [
    { label: 'Usuarios', value: stats?.total_usuarios ?? 0, icon: Users, color: '#818cf8' },
    { label: 'Apartamentos', value: stats?.total_apartamentos ?? 0, icon: Building2, color: '#34d399' },
    { label: 'Comunicados', value: stats?.comunicaciones_mes ?? 0, icon: MessageSquare, color: '#fb923c' },
  ];

  const navCards = [
    {
      title: 'Usuarios',
      subtitle: `${stats?.total_usuarios ?? '—'} registrados`,
      icon: Users,
      color: '#818cf8',
      bg: 'bg-violet-500/15',
      route: '/admin/users',
    },
    {
      title: 'Apartamentos',
      subtitle: `${stats?.total_apartamentos ?? '—'} unidades`,
      icon: Building2,
      color: '#34d399',
      bg: 'bg-emerald-500/15',
      route: '/admin/apartments',
    },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Decorative gradient */}
      <View
        className="absolute top-0 right-0 bg-violet-600/15 rounded-full"
        style={{
          width: Math.min(width * 0.7, 400),
          height: Math.min(width * 0.7, 400),
          transform: [{ translateX: width * 0.2 }, { translateY: -width * 0.15 }],
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <ResponsiveContainer className="py-6">
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="w-12 h-12 rounded-2xl bg-violet-500/15 items-center justify-center">
                <Shield color="#818cf8" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">Panel Admin</Text>
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm" numberOfLines={1}>
                  {condominio?.nombre ?? condominioName ?? ''}
                </Text>
              </View>
              <Pressable
                onPress={fetchData}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                hitSlop={12}
              >
                <RefreshCw color={iconMuted} size={20} />
              </Pressable>
            </View>

            {loading ? (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={activityColor} />
              </View>
            ) : (
              <View className="gap-6">
                {/* Stats row */}
                <View className="flex-row gap-3">
                  {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <LiquidView
                        key={card.label}
                        intensity={15}
                        tint={isDark ? 'dark' : 'light'}
                        className="flex-1 p-3 rounded-2xl border border-black/5 dark:border-white/5 items-center gap-1"
                      >
                        <Icon color={card.color} size={20} />
                        <Text
                          className="text-neutral-950 dark:text-white text-xl font-bold"
                          style={{ color: card.color }}
                        >
                          {card.value}
                        </Text>
                        <Text className="text-neutral-500 dark:text-neutral-400 text-xs text-center">
                          {card.label}
                        </Text>
                      </LiquidView>
                    );
                  })}
                </View>

                {/* Nav cards */}
                <View>
                  <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Gestión
                  </Text>
                  <View className="gap-3">
                    {navCards.map((card) => {
                      const Icon = card.icon;
                      return (
                        <Pressable
                          key={card.title}
                          onPress={() => router.push(card.route as any)}
                          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                        >
                          <LiquidView
                            intensity={15}
                            tint={isDark ? 'dark' : 'light'}
                            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 flex-row items-center gap-4"
                          >
                            <View className={`w-12 h-12 rounded-xl ${card.bg} items-center justify-center`}>
                              <Icon color={card.color} size={22} />
                            </View>
                            <View className="flex-1">
                              <Text className="text-neutral-950 dark:text-white font-semibold text-base">
                                {card.title}
                              </Text>
                              <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                                {card.subtitle}
                              </Text>
                            </View>
                            <View className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center">
                              <Text className="text-neutral-950 dark:text-white text-lg font-light">›</Text>
                            </View>
                          </LiquidView>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Condominio info */}
                {condominio && (
                  <View>
                    <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Información del conjunto
                    </Text>
                    <LiquidView
                      intensity={15}
                      tint={isDark ? 'dark' : 'light'}
                      className="p-4 rounded-2xl border border-black/5 dark:border-white/5 gap-2"
                    >
                      {[
                        { label: 'Nombre', value: condominio.nombre },
                        { label: 'Dirección', value: condominio.direccion },
                        { label: 'Ciudad', value: condominio.ciudad },
                        condominio.telefono ? { label: 'Teléfono', value: condominio.telefono } : null,
                        condominio.email ? { label: 'Email', value: condominio.email } : null,
                      ]
                        .filter(Boolean)
                        .map((row) => (
                          <View key={row!.label} className="flex-row gap-2">
                            <Text className="text-neutral-500 dark:text-neutral-400 text-sm w-24">
                              {row!.label}
                            </Text>
                            <Text
                              className="text-neutral-950 dark:text-white text-sm font-medium flex-1"
                              numberOfLines={2}
                            >
                              {row!.value}
                            </Text>
                          </View>
                        ))}
                    </LiquidView>
                  </View>
                )}
              </View>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
