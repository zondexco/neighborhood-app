import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BottomSheet from '@gorhom/bottom-sheet';
import { ArrowLeft, Plus, Search, Building2 } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchAdminApartments } from '@/features/admin/api';
import type { AdminApartment } from '@/features/admin/types';
import ApartmentFormSheet from '@/features/admin/components/ApartmentFormSheet';

const ESTADO_COLORS: Record<string, string> = {
  activo:    'text-emerald-600 dark:text-emerald-400',
  inactivo:  'text-neutral-500 dark:text-neutral-400',
  pendiente: 'text-yellow-600 dark:text-yellow-400',
  suspendido:'text-red-600 dark:text-red-400',
};

function aptLabel(apt: AdminApartment): string {
  const parts = [`Apt ${apt.numero}`];
  if (apt.torre) parts.push(`Torre ${apt.torre}`);
  if (apt.bloque) parts.push(`Bloque ${apt.bloque}`);
  return parts.join(' · ');
}

function aptSublabel(apt: AdminApartment): string {
  const parts: string[] = [];
  if (apt.piso != null && apt.piso > 0) parts.push(`Piso ${apt.piso}`);
  return parts.join(' · ');
}

export default function ApartmentsScreen() {
  const { isDark, iconMuted, activityColor, placeholderText } = useThemeColors();

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingApt, setEditingApt] = useState<AdminApartment | null>(null);
  const formSheetRef = useRef<BottomSheet>(null);

  const { data: aptsData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin', 'apartments'],
    queryFn: fetchAdminApartments,
  });

  const apartments = aptsData?.data ?? [];
  const error = queryError ? 'No se pudieron cargar los apartamentos.' : null;

  const invalidateApartments = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'apartments'] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apartments;
    return apartments.filter(
      (a) =>
        a.numero.toLowerCase().includes(q) ||
        (a.torre ?? '').toLowerCase().includes(q) ||
        (a.bloque ?? '').toLowerCase().includes(q),
    );
  }, [apartments, search]);

  const openCreate = () => {
    setEditingApt(null);
    formSheetRef.current?.snapToIndex(0);
  };

  const openEdit = (apt: AdminApartment) => {
    setEditingApt(apt);
    formSheetRef.current?.snapToIndex(0);
  };

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
          <Pressable
            onPress={openCreate}
            className="flex-row items-center gap-1.5 bg-emerald-600 px-4 py-2 rounded-full"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Plus color="white" size={18} />
            <Text className="text-white font-semibold text-sm">Nuevo</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} {...{ delaysContentTouches: false }}>
          <ResponsiveContainer className="pb-6">
            {/* Title */}
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/15 items-center justify-center">
                <Building2 color="#34d399" size={20} />
              </View>
              <View>
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">Apartamentos</Text>
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {apartments.length} unidades
                </Text>
              </View>
            </View>

            {/* Search */}
            <View className="flex-row items-center gap-3 bg-black/10 dark:bg-white/10 rounded-2xl px-4 py-3 mb-5">
              <Search color={iconMuted} size={18} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por número, torre o bloque..."
                placeholderTextColor={placeholderText}
                className="flex-1 text-neutral-950 dark:text-white"
              />
            </View>

            {/* Loading */}
            {loading && (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={activityColor} />
              </View>
            )}

            {/* Error */}
            {!loading && error && (
              <Text className="text-red-600 dark:text-red-400 text-center py-8">{error}</Text>
            )}

            {/* List */}
            {!loading && !error && (
              <View className="gap-2">
                {filtered.length === 0 ? (
                  <Text className="text-neutral-500 dark:text-neutral-400 text-center py-12">
                    {search ? 'Sin resultados para esa búsqueda.' : 'No hay apartamentos registrados.'}
                  </Text>
                ) : (
                  filtered.map((apt) => {
                    const estadoClass = ESTADO_COLORS[apt.estado] ?? ESTADO_COLORS.inactivo;
                    const sub = aptSublabel(apt);

                    return (
                      <Pressable
                        key={apt.id}
                        onPress={() => openEdit(apt)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                      >
                        <LiquidView
                          intensity={15}
                          tint={isDark ? 'dark' : 'light'}
                          className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                        >
                          {/* Icon */}
                          <View className="w-10 h-10 rounded-xl bg-emerald-500/15 items-center justify-center">
                            <Building2 color="#34d399" size={18} />
                          </View>

                          {/* Info */}
                          <View className="flex-1">
                            <Text className="text-neutral-950 dark:text-white font-semibold">
                              {aptLabel(apt)}
                            </Text>
                            {sub ? (
                              <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                                {sub}
                              </Text>
                            ) : null}
                          </View>

                          {/* Estado */}
                          <Text className={`text-xs capitalize font-medium ${estadoClass}`}>
                            {apt.estado}
                          </Text>
                        </LiquidView>
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>

      <ApartmentFormSheet ref={formSheetRef} apartment={editingApt} onSaved={invalidateApartments} />
    </View>
  );
}
