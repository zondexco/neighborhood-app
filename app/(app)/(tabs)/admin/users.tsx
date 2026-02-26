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
import { ArrowLeft, Plus, Search, Users, Building2 } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { fetchAdminUsers } from '@/features/admin/api';
import type { AdminUser } from '@/features/admin/types';
import UserFormSheet from '@/features/admin/components/UserFormSheet';

const ROL_COLORS: Record<string, { bg: string; text: string; darkText: string }> = {
  dev:           { bg: 'bg-amber-500/20',  text: 'text-amber-600',  darkText: 'dark:text-amber-400'  },
  administrador: { bg: 'bg-violet-500/20', text: 'text-violet-600', darkText: 'dark:text-violet-400' },
  admin:         { bg: 'bg-violet-500/20', text: 'text-violet-600', darkText: 'dark:text-violet-400' },
  empleado:      { bg: 'bg-blue-500/20',   text: 'text-blue-600',   darkText: 'dark:text-blue-400'   },
  residente:     { bg: 'bg-emerald-500/20',text: 'text-emerald-600',darkText: 'dark:text-emerald-400'},
};

const ROL_LABELS: Record<string, string> = {
  dev: 'Dev',
  administrador: 'Admin',
  admin: 'Admin',
  empleado: 'Empleado',
  residente: 'Residente',
};

const ESTADO_COLORS: Record<string, string> = {
  activo: 'text-emerald-600 dark:text-emerald-400',
  inactivo: 'text-neutral-500 dark:text-neutral-400',
  pendiente: 'text-yellow-600 dark:text-yellow-400',
  suspendido: 'text-red-600 dark:text-red-400',
};

function avatarColor(rol: string): string {
  if (rol === 'administrador' || rol === 'admin') return '#818cf8';
  if (rol === 'empleado') return '#60a5fa';
  return '#34d399';
}

export default function UsersScreen() {
  const { isDark, iconPrimary, iconMuted, activityColor, placeholderText } = useThemeColors();
  const callerRole = useAuth((s: AuthState) => s.role);
  const callerUserId = useAuth((s: AuthState) => s.userId);

  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const formSheetRef = useRef<BottomSheet>(null);

  const { data: usersData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
  });

  const users = usersData?.data ?? [];
  const error = queryError ? 'No se pudieron cargar los usuarios.' : null;

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.apellido.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const openCreate = () => {
    setEditingUser(null);
    formSheetRef.current?.snapToIndex(0);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
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
            className="flex-row items-center gap-1.5 bg-violet-600 px-4 py-2 rounded-full"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Plus color="white" size={18} />
            <Text className="text-white font-semibold text-sm">Nuevo</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          {...{ delaysContentTouches: false }}
        >
          <ResponsiveContainer className="pb-6">
            {/* Title */}
            <View className="flex-row items-center gap-3 mb-5">
              <View className="w-10 h-10 rounded-xl bg-violet-500/15 items-center justify-center">
                <Users color="#818cf8" size={20} />
              </View>
              <View>
                <Text className="text-neutral-950 dark:text-white text-2xl font-bold">Usuarios</Text>
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {users.length} registrados
                </Text>
              </View>
            </View>

            {/* Search */}
            <View className="flex-row items-center gap-3 bg-black/10 dark:bg-white/10 rounded-2xl px-4 py-3 mb-5">
              <Search color={iconMuted} size={18} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre o email..."
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
                    {search ? 'Sin resultados para esa búsqueda.' : 'No hay usuarios registrados.'}
                  </Text>
                ) : (
                  filtered.map((user) => {
                    const rolStyle = ROL_COLORS[user.rol] ?? ROL_COLORS.residente;
                    const estadoClass = ESTADO_COLORS[user.estado] ?? ESTADO_COLORS.inactivo;
                    const initial = (user.nombre[0] ?? '?').toUpperCase();

                    return (
                      <Pressable
                        key={user.id}
                        onPress={() => openEdit(user)}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                      >
                        <LiquidView
                          intensity={15}
                          tint={isDark ? 'dark' : 'light'}
                          className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                        >
                          {/* Avatar */}
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: avatarColor(user.rol) + '33' }}
                          >
                            <Text
                              className="font-bold text-base"
                              style={{ color: avatarColor(user.rol) }}
                            >
                              {initial}
                            </Text>
                          </View>

                          {/* Info */}
                          <View className="flex-1">
                            <Text className="text-neutral-950 dark:text-white font-semibold">
                              {user.nombre} {user.apellido}
                            </Text>
                            <Text
                              className="text-neutral-500 dark:text-neutral-400 text-sm"
                              numberOfLines={1}
                            >
                              {user.email}
                            </Text>
                            {user.apartamento && (
                              <View className="flex-row items-center gap-1 mt-0.5">
                                <Building2 color={iconMuted} size={12} />
                                <Text className="text-neutral-400 dark:text-neutral-500 text-xs" numberOfLines={1}>
                                  {user.apartamento}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Badges */}
                          <View className="items-end gap-1">
                            <View className={`px-2 py-0.5 rounded-full ${rolStyle.bg}`}>
                              <Text className={`text-xs font-semibold ${rolStyle.text} ${rolStyle.darkText}`}>
                                {ROL_LABELS[user.rol] ?? user.rol}
                              </Text>
                            </View>
                            <Text className={`text-xs capitalize ${estadoClass}`}>
                              {user.estado}
                            </Text>
                          </View>
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

      <UserFormSheet ref={formSheetRef} user={editingUser} callerRole={callerRole} callerUserId={callerUserId} onSaved={invalidateUsers} />
    </View>
  );
}
