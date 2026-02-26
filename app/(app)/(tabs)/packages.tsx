import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BottomSheet from '@gorhom/bottom-sheet';
import { Package, Plus, Search, RefreshCw, CheckCircle2, Clock } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { fetchPackages } from '@/features/packages/api';
import type { Package as Pkg, PackageFilters } from '@/features/packages/types';
import PackageDetailSheet from '@/features/packages/components/PackageDetailSheet';
import PackageFormSheet from '@/features/packages/components/PackageFormSheet';
import { useThemeColors } from '@/hooks/useThemeColors';

// ── Filter chip helpers ───────────────────────────────────────────────────────

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
          ? 'bg-amber-500 border-amber-500'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PackagesScreen() {
  const { iconPrimary, iconSubtle, activityColor } = useThemeColors();

  const role = useAuth((s: AuthState) => s.role);
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);

  const isResidente = role === 'residente';
  const isEmpleadoOrAdmin = isAdmin || role === 'empleado';

  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<PackageFilters>({
    status: 'all',
    dateFilter: 'all',
    apartmentId: null,
    carrier: null,
    search: '',
  });

  const [selectedPackage, setSelectedPackage] = useState<Pkg | null>(null);
  const [editingPackage, setEditingPackage] = useState<Pkg | null>(null);

  const detailSheetRef = useRef<BottomSheet>(null);
  const formSheetRef = useRef<BottomSheet>(null);

  // Single fetch — all packages cached, filtered client-side
  const { data: allData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['packages', 'all'],
    queryFn: () => fetchPackages({ status: 'all', page: 1, page_size: 1000 }),
  });

  const allPackages = useMemo(() => allData?.data ?? [], [allData]);
  const error = queryError ? 'No se pudo cargar la información. Verifica tu conexión.' : null;

  // Client-side filtering — zero API calls on filter change
  const packages = useMemo(() => {
    return allPackages.filter((pkg) => {
      if (filters.status === 'pending' && pkg.delivered_at !== null) return false;
      if (filters.status === 'delivered' && pkg.delivered_at === null) return false;
      if (filters.apartmentId && pkg.apartment_id !== filters.apartmentId) return false;
      if (filters.carrier && pkg.carrier !== filters.carrier) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!pkg.resident.toLowerCase().includes(q) && !pkg.carrier.toLowerCase().includes(q)) return false;
      }
      if (filters.dateFilter !== 'all') {
        const pkgDate = new Date(pkg.received_at).getTime();
        const now = Date.now();
        if (filters.dateFilter === 'today') {
          const start = new Date(); start.setHours(0, 0, 0, 0);
          if (pkgDate < start.getTime()) return false;
        } else {
          const days = filters.dateFilter === '7d' ? 7 : 30;
          if (now - pkgDate > days * 86_400_000) return false;
        }
      }
      return true;
    });
  }, [allPackages, filters]);

  const total = packages.length;

  // Derived filter chip options (from ALL packages, not filtered)
  const carriers = useMemo(
    () => [...new Set(allPackages.map((p) => p.carrier))].sort(),
    [allPackages],
  );

  const apartments = useMemo(() => {
    const seen = new Set<string>();
    return allPackages
      .filter((p) => !seen.has(p.apartment_id) && seen.add(p.apartment_id))
      .map((p) => ({ id: p.apartment_id, label: p.apartment }));
  }, [allPackages]);

  const openDetail = (pkg: Pkg) => {
    setSelectedPackage(pkg);
    detailSheetRef.current?.snapToIndex(0);
  };

  const openCreate = () => {
    setEditingPackage(null);
    formSheetRef.current?.snapToIndex(0);
  };

  const openEdit = (pkg: Pkg) => {
    setEditingPackage(pkg);
    formSheetRef.current?.snapToIndex(0);
  };

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['packages'] });
  };

  const setFilter = <K extends keyof PackageFilters>(key: K, value: PackageFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (status: PackageFilters['status']) =>
    setFilter('status', filters.status === status ? 'all' : status);

  const toggleDate = (d: PackageFilters['dateFilter']) =>
    setFilter('dateFilter', filters.dateFilter === d ? 'all' : d);

  const toggleApartment = (id: string) =>
    setFilter('apartmentId', filters.apartmentId === id ? null : id);

  const toggleCarrier = (c: string) =>
    setFilter('carrier', filters.carrier === c ? null : c);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Decorative gradient */}
      <View
        pointerEvents="none"
        className="absolute top-0 left-0 bg-amber-500/15 rounded-full"
        style={{ width: 400, height: 400, transform: [{ translateX: -120 }, { translateY: -150 }] }}
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
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">Paquetería</Text>
                {!loading && (
                  <Text className="text-neutral-500 text-sm mt-0.5">
                    {total} paquete{total !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={refreshAll}
                  className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center"
                >
                  <RefreshCw color={iconSubtle} size={18} />
                </TouchableOpacity>
                {isEmpleadoOrAdmin && (
                  <TouchableOpacity
                    onPress={openCreate}
                    className="flex-row items-center gap-1.5 bg-amber-500 px-4 py-2 rounded-full"
                  >
                    <Plus color="#fff" size={18} />
                    <Text className="text-white font-bold text-sm">Nuevo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Search bar — empleado + admin */}
            {isEmpleadoOrAdmin && (
              <View className="mb-4 flex-row items-center gap-2 bg-black/5 dark:bg-white/5 rounded-2xl px-3 border border-black/5 dark:border-white/10">
                <Search color={iconSubtle} size={18} />
                <TextInput
                  value={filters.search}
                  onChangeText={(t) => setFilter('search', t)}
                  placeholder="Buscar por destinatario o transportadora..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 py-3 text-neutral-950 dark:text-white text-sm"
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
              </View>
            )}

            {/* Filter chips */}
            <View className="mb-5 gap-3">
              {/* Estado */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FilterChip label="Todos" active={filters.status === 'all'} onPress={() => setFilter('status', 'all')} />
                <FilterChip label="Pendientes" active={filters.status === 'pending'} onPress={() => toggleStatus('pending')} />
                <FilterChip label="Entregados" active={filters.status === 'delivered'} onPress={() => toggleStatus('delivered')} />
              </ScrollView>

              {/* Fecha */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <FilterChip label="Cualquier fecha" active={filters.dateFilter === 'all'} onPress={() => setFilter('dateFilter', 'all')} />
                <FilterChip label="Hoy" active={filters.dateFilter === 'today'} onPress={() => toggleDate('today')} />
                <FilterChip label="Últimos 7 días" active={filters.dateFilter === '7d'} onPress={() => toggleDate('7d')} />
                <FilterChip label="Últimos 30 días" active={filters.dateFilter === '30d'} onPress={() => toggleDate('30d')} />
              </ScrollView>

              {/* Apartamento — no mostrar si residente con un único apartamento */}
              {!isResidente && apartments.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <FilterChip label="Todos los aptos." active={!filters.apartmentId} onPress={() => setFilter('apartmentId', null)} />
                  {apartments.map((apt) => (
                    <FilterChip
                      key={apt.id}
                      label={apt.label}
                      active={filters.apartmentId === apt.id}
                      onPress={() => toggleApartment(apt.id)}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Transportadora — empleado + admin */}
              {isEmpleadoOrAdmin && carriers.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <FilterChip label="Todas" active={!filters.carrier} onPress={() => setFilter('carrier', null)} />
                  {carriers.map((c) => (
                    <FilterChip
                      key={c}
                      label={c}
                      active={filters.carrier === c}
                      onPress={() => toggleCarrier(c)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Loading */}
            {loading && (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={activityColor} />
                <Text className="text-neutral-500 mt-4">Cargando paquetes...</Text>
              </View>
            )}

            {/* Error */}
            {!loading && error && (
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-6 rounded-2xl border border-red-500/20 items-center gap-3"
              >
                <Text className="text-red-600 dark:text-red-400 text-base text-center">{error}</Text>
                <Pressable
                  onPress={refreshAll}
                  className="flex-row items-center gap-2 bg-black/10 dark:bg-white/10 px-4 py-2 rounded-full"
                >
                  <RefreshCw color={iconPrimary} size={16} />
                  <Text className="text-neutral-950 dark:text-white font-medium">Reintentar</Text>
                </Pressable>
              </LiquidView>
            )}

            {/* Empty state */}
            {!loading && !error && packages.length === 0 && (
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-8 rounded-2xl border border-black/5 dark:border-white/10 items-center gap-3"
              >
                <Package color="#d97706" size={36} />
                <Text className="text-neutral-600 dark:text-neutral-400 text-base text-center">
                  {filters.status !== 'all' || filters.dateFilter !== 'all' || filters.search
                    ? 'No hay paquetes con estos filtros'
                    : 'No hay paquetes registrados'}
                </Text>
                {isEmpleadoOrAdmin && filters.status === 'all' && !filters.search && (
                  <Pressable onPress={openCreate} className="bg-amber-500 px-5 py-2.5 rounded-full mt-1">
                    <Text className="text-white font-bold">Registrar paquete</Text>
                  </Pressable>
                )}
              </LiquidView>
            )}

            {/* Package list */}
            {!loading && !error && packages.length > 0 && (
              <View className="gap-3">
                {packages.map((pkg) => {
                  const isPending = !pkg.delivered_at;
                  return (
                    <Pressable key={pkg.id} onPress={() => openDetail(pkg)}>
                      <LiquidView
                        intensity={15}
                        tint="dark"
                        className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                      >
                        {/* Icon */}
                        <View className={`w-11 h-11 rounded-full items-center justify-center ${isPending ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                          {isPending ? (
                            <Package color="#f59e0b" size={22} />
                          ) : (
                            <CheckCircle2 color="#4ade80" size={22} />
                          )}
                        </View>

                        {/* Info */}
                        <View className="flex-1">
                          <Text className="text-neutral-950 dark:text-white font-semibold" numberOfLines={1}>
                            {pkg.carrier}
                          </Text>
                          <Text className="text-neutral-500 text-xs mt-0.5" numberOfLines={1}>
                            {pkg.resident}
                          </Text>
                          {isEmpleadoOrAdmin && (
                            <Text className="text-neutral-400 text-xs mt-0.5" numberOfLines={1}>
                              {pkg.apartment}
                            </Text>
                          )}
                          <View className="flex-row items-center gap-1 mt-1">
                            <Clock color="#9ca3af" size={11} />
                            <Text className="text-neutral-400 text-xs">
                              {formatDate(pkg.received_at)}
                            </Text>
                          </View>
                        </View>

                        {/* Status badge */}
                        <View className={`px-2.5 py-1 rounded-full ${isPending ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                          <Text className={`text-xs font-bold ${isPending ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                            {isPending ? 'Pendiente' : 'Entregado'}
                          </Text>
                        </View>
                      </LiquidView>
                    </Pressable>
                  );
                })}
              </View>
            )}

          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>

      {/* Sheets */}
      <PackageDetailSheet
        ref={detailSheetRef}
        pkg={selectedPackage}
        role={role}
        isAdmin={isAdmin}
        onUpdated={refreshAll}
        onEdit={openEdit}
      />

      {isEmpleadoOrAdmin && (
        <PackageFormSheet
          ref={formSheetRef}
          pkg={editingPackage}
          isAdmin={isAdmin}
          role={role}
          onSaved={refreshAll}
        />
      )}
    </View>
  );
}
