import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  Code2,
  Plus,
  Search,
  Building2,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchCondominios } from '@/features/dev/api';
import CondominioFormSheet from '@/features/dev/components/CondominioFormSheet';
import type { DevCondominio } from '@/features/dev/types';

export default function DevDashboard() {
  const { width } = useWindowDimensions();
  const { isDark, iconPrimary, iconMuted, activityColor, placeholderText } = useThemeColors();

  const [condominios, setCondominios] = useState<DevCondominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCondominio, setSelectedCondominio] = useState<DevCondominio | null>(null);
  const formRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchCondominios();
      setCondominios(res.data ?? []);
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

  const filtered = search
    ? condominios.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.ciudad.toLowerCase().includes(q) ||
          c.direccion.toLowerCase().includes(q)
        );
      })
    : condominios;

  const openCreate = useCallback(() => {
    setSelectedCondominio(null);
    formRef.current?.snapToIndex(0);
  }, []);

  const openEdit = useCallback((condo: DevCondominio) => {
    setSelectedCondominio(condo);
    formRef.current?.snapToIndex(0);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DevCondominio }) => {
      return (
        <Pressable
          onPress={() => router.push(`/dev/condominio/${item.id}` as any)}
          onLongPress={() => openEdit(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <LiquidView
            intensity={15}
            tint={isDark ? 'dark' : 'light'}
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5"
          >
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-xl bg-cyan-500/10 items-center justify-center">
                <Building2 color="#06b6d4" size={20} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-neutral-950 dark:text-white text-base font-semibold"
                  numberOfLines={1}
                >
                  {item.nombre}
                </Text>
                <Text
                  className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5"
                  numberOfLines={1}
                >
                  {item.direccion} · {item.ciudad}
                </Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      item.estado === 'activo' ? 'bg-emerald-500/15' : 'bg-red-500/15'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        item.estado === 'activo'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                  {item.permite_soporte && (
                    <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15">
                      <ShieldCheck color="#06b6d4" size={12} />
                      <Text className="text-cyan-600 dark:text-cyan-400 text-xs font-semibold">
                        Soporte
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center">
                <Text className="text-neutral-950 dark:text-white text-lg font-light">›</Text>
              </View>
            </View>
          </LiquidView>
        </Pressable>
      );
    },
    [isDark, openEdit],
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Decorative gradient */}
      <View
        pointerEvents="none"
        className="absolute top-0 right-0 bg-cyan-600/15 rounded-full"
        style={{
          width: Math.min(width * 0.7, 400),
          height: Math.min(width * 0.7, 400),
          transform: [{ translateX: width * 0.2 }, { translateY: -width * 0.15 }],
        }}
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-2xl bg-cyan-500/15 items-center justify-center">
                <Code2 color="#06b6d4" size={24} />
              </View>
              <View>
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">
                  Panel Dev
                </Text>
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {condominios.length} condominio{condominios.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={load}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                hitSlop={12}
              >
                <RefreshCw color={iconMuted} size={20} />
              </Pressable>
              <Pressable
                onPress={openCreate}
                className="bg-cyan-600 px-4 py-2 rounded-xl flex-row items-center gap-1.5"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <Plus color="white" size={16} />
                <Text className="text-white font-semibold text-sm">Nuevo</Text>
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <View className="flex-row items-center bg-black/5 dark:bg-white/5 rounded-xl px-4 gap-2">
            <Search color={iconMuted} size={18} />
            <TextInput
              className="flex-1 py-3 text-neutral-950 dark:text-white text-base"
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar condominios..."
              placeholderTextColor={placeholderText}
              clearButtonMode="while-editing"
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
            {...{ delaysContentTouches: false }}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Building2 color={iconMuted} size={40} />
                <Text className="text-neutral-500 dark:text-neutral-400 text-base mt-3">
                  {search ? 'Sin resultados' : 'Sin condominios'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <CondominioFormSheet ref={formRef} condominio={selectedCondominio} onSaved={load} />
    </View>
  );
}
