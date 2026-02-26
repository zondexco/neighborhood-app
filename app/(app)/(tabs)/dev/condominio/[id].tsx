import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCircle,
  ShieldCheck,
  Users,
  Zap,
  Edit3,
  Plus,
} from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import {
  fetchCondominios,
  fetchCondominioAdmins,
  impersonate,
} from '@/features/dev/api';
import CondominioFormSheet from '@/features/dev/components/CondominioFormSheet';
import AdminFormSheet from '@/features/dev/components/AdminFormSheet';
import type { DevCondominio, CondominioAdmin } from '@/features/dev/types';

export default function CondominioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, iconPrimary, iconMuted, activityColor } = useThemeColors();
  const startDisguise = useAuth((s: AuthState) => s.startDisguise);

  const [condominio, setCondominio] = useState<DevCondominio | null>(null);
  const [admins, setAdmins] = useState<CondominioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<CondominioAdmin | null>(null);
  const formRef = useRef<BottomSheet>(null);
  const adminFormRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [condRes, adminsRes] = await Promise.all([
        fetchCondominios(),
        fetchCondominioAdmins(id),
      ]);
      const found = condRes.data?.find((c) => c.id === id) ?? null;
      setCondominio(found);
      setAdmins(adminsRes.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {
        formRef.current?.close();
        adminFormRef.current?.close();
      };
    }, [load]),
  );


  const handleImpersonate = useCallback(async () => {
    if (!condominio) return;
    if (!condominio.permite_soporte) {
      Alert.alert('No disponible', 'El condominio no tiene habilitado el acceso de soporte.');
      return;
    }
    Alert.alert(
      'Iniciar sesión de soporte',
      `¿Entrar como soporte técnico en "${condominio.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: async () => {
            setImpersonating(true);
            try {
              const res = await impersonate(condominio.id);
              startDisguise({
                token: res.token,
                refreshToken: res.refresh_token,
                userId: res.user_id,
                email: res.email,
                nombre: res.nombre,
                apellido: res.apellido,
                condominioId: res.condominio_id,
                condominioName: res.condominio_nombre,
                role: res.role,
                isAdmin: res.is_admin,
                apartmentId: res.apartment_id || null,
              });
              router.replace('/home' as any);
            } catch (e: any) {
              Alert.alert(
                'Error',
                e?.response?.data?.message ?? 'No se pudo iniciar la sesión de soporte',
              );
            } finally {
              setImpersonating(false);
            }
          },
        },
      ],
    );
  }, [condominio, startDisguise]);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color={activityColor} />
      </View>
    );
  }

  if (!condominio) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <Text className="text-neutral-500 dark:text-neutral-400">Condominio no encontrado</Text>
      </View>
    );
  }

  const infoRows = [
    { icon: MapPin, label: 'Dirección', value: condominio.direccion },
    { icon: MapPin, label: 'Ciudad', value: condominio.ciudad },
    condominio.telefono ? { icon: Phone, label: 'Teléfono', value: condominio.telefono } : null,
    condominio.email ? { icon: Mail, label: 'Email', value: condominio.email } : null,
    condominio.nit ? { icon: FileText, label: 'NIT', value: condominio.nit } : null,
    condominio.representante_legal
      ? { icon: UserCircle, label: 'Representante', value: condominio.representante_legal }
      : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          {...{ delaysContentTouches: false }}
        >
          <ResponsiveContainer className="py-4">
            {/* Header */}
            <View className="flex-row items-center gap-3 mb-6">
              <Pressable
                onPress={() => router.navigate('/dev')}
                hitSlop={16}
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center"
              >
                <ArrowLeft color={iconPrimary} size={20} />
              </Pressable>
              <View className="flex-1">
                <Text
                  className="text-neutral-950 dark:text-white text-xl font-bold"
                  numberOfLines={1}
                >
                  {condominio.nombre}
                </Text>
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {condominio.ciudad}
                </Text>
              </View>
              <Pressable
                onPress={() => formRef.current?.snapToIndex(0)}
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center"
                hitSlop={8}
              >
                <Edit3 color={iconMuted} size={18} />
              </Pressable>
            </View>

            {/* Info card */}
            <LiquidView
              intensity={15}
              tint={isDark ? 'dark' : 'light'}
              className="p-4 rounded-2xl border border-black/5 dark:border-white/10 gap-3 mb-4"
            >
              {infoRows.map((row) => {
                const Icon = row.icon;
                return (
                  <View key={row.label} className="flex-row items-center gap-3">
                    <Icon color={iconMuted} size={16} />
                    <View className="flex-1">
                      <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                        {row.label}
                      </Text>
                      <Text
                        className="text-neutral-950 dark:text-white text-sm font-medium"
                        numberOfLines={2}
                      >
                        {row.value}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </LiquidView>

            {/* Soporte status (read-only — admin del conjunto lo activa) */}
            <LiquidView
              intensity={15}
              tint={isDark ? 'dark' : 'light'}
              className="p-4 rounded-2xl border border-black/5 dark:border-white/10 flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <ShieldCheck color={condominio.permite_soporte ? '#06b6d4' : '#a3a3a3'} size={20} />
                <View className="flex-1">
                  <Text className="text-neutral-950 dark:text-white font-semibold text-sm">
                    Acceso de soporte
                  </Text>
                  <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                    {condominio.permite_soporte
                      ? 'Habilitado por el administrador'
                      : 'No habilitado por el administrador'}
                  </Text>
                </View>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${condominio.permite_soporte ? 'bg-cyan-500/20' : 'bg-neutral-500/20'}`}>
                <Text className={`text-xs font-bold ${condominio.permite_soporte ? 'text-cyan-600 dark:text-cyan-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {condominio.permite_soporte ? 'Activo' : 'Inactivo'}
                </Text>
              </View>
            </LiquidView>

            {/* Disguise button */}
            <Pressable
              onPress={handleImpersonate}
              disabled={impersonating || !condominio.permite_soporte}
              className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 mb-6 ${
                condominio.permite_soporte ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
              style={{ opacity: impersonating ? 0.6 : 1 }}
            >
              {impersonating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Zap color="white" size={18} />
                  <Text className="text-white font-bold text-base">Entrar como soporte</Text>
                </>
              )}
            </Pressable>

            {/* Admins section */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                  Administradores ({admins.length})
                </Text>
                <Pressable
                  onPress={() => {
                    setEditingAdmin(null);
                    adminFormRef.current?.snapToIndex(0);
                  }}
                  className="flex-row items-center gap-1 bg-violet-600 px-3 py-1.5 rounded-full"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Plus color="white" size={14} />
                  <Text className="text-white font-semibold text-xs">Agregar</Text>
                </Pressable>
              </View>
              {admins.length === 0 ? (
                <View className="items-center py-8">
                  <Users color={iconMuted} size={32} />
                  <Text className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                    Sin administradores registrados
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {admins.map((adm) => {
                    const estadoConfig: Record<string, { label: string; bg: string; text: string }> = {
                      activo: { label: 'Activo', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
                      suspendido: { label: 'Suspendido', bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400' },
                      inactivo: { label: 'Inactivo', bg: 'bg-red-500/15', text: 'text-red-600 dark:text-red-400' },
                    };
                    const st = estadoConfig[adm.estado] ?? estadoConfig.inactivo;

                    return (
                      <Pressable
                        key={adm.id}
                        onPress={() => {
                          setEditingAdmin(adm);
                          adminFormRef.current?.snapToIndex(0);
                        }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                      >
                        <LiquidView
                          intensity={15}
                          tint={isDark ? 'dark' : 'light'}
                          className="p-3 rounded-xl border border-black/5 dark:border-white/10 flex-row items-center gap-3"
                        >
                          <View className="w-10 h-10 rounded-full bg-violet-500/15 items-center justify-center">
                            <Text className="text-violet-600 dark:text-violet-400 font-bold text-sm">
                              {(adm.nombre?.charAt(0) ?? '') + (adm.apellido?.charAt(0) ?? '')}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-neutral-950 dark:text-white font-semibold text-sm">
                              {adm.nombre} {adm.apellido}
                            </Text>
                            <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                              {adm.email}
                            </Text>
                          </View>
                          <View className={`px-2 py-0.5 rounded-full ${st.bg}`}>
                            <Text className={`text-xs font-semibold ${st.text}`}>
                              {st.label}
                            </Text>
                          </View>
                        </LiquidView>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>

      <CondominioFormSheet ref={formRef} condominio={condominio} onSaved={load} />
      <AdminFormSheet
        ref={adminFormRef}
        condominioId={id!}
        admin={editingAdmin}
        onSaved={load}
      />
    </View>
  );
}
