import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Shield, Building2, LogOut, Trash2 } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { appStorage } from '@/lib/storage';

// ── Helpers ─────────────────────────────────────────────────────
function getInitials(nombre?: string | null, apellido?: string | null): string {
  const first = nombre?.charAt(0)?.toUpperCase() ?? '';
  const last = apellido?.charAt(0)?.toUpperCase() ?? '';
  return first + last || '?';
}

// ── Component ───────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();

  const nombre = useAuth((s: AuthState) => s.nombre);
  const apellido = useAuth((s: AuthState) => s.apellido);
  const email = useAuth((s: AuthState) => s.email);
  const role = useAuth((s: AuthState) => s.role);
  const condominioName = useAuth((s: AuthState) => s.condominioName);
  const isAdmin = useAuth((s: AuthState) => s.isAdmin);
  const logout = useAuth((s: AuthState) => s.logout);

  const displayName = nombre
    ? `${nombre}${apellido ? ' ' + apellido : ''}`
    : email?.split('@')[0] ?? 'Usuario';

  const roleLabel = isAdmin ? 'Administrador' : (role ?? 'Residente');

  // ── Actions ──────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    const doLogout = () => {
      logout();
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      doLogout();
      return;
    }

    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: doLogout },
      ],
    );
  }, [logout, router]);

  const handleClearCache = useCallback(() => {
    const doClear = async () => {
      try {
        await appStorage.removeItem('neighborhood-auth');
      } catch {
        // Ignore storage errors during cleanup
      }
      logout();
      router.replace('/');
    };

    if (Platform.OS === 'web') {
      doClear();
      return;
    }

    Alert.alert(
      'Limpiar Datos',
      'Esto cerrará tu sesión y eliminará todos los datos almacenados localmente. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: doClear },
      ],
    );
  }, [logout, router]);

  return (
    <View className="flex-1 bg-black">
      {/* Decorative gradient */}
      <View
        className="absolute top-0 left-0 bg-purple-600/15 rounded-full"
        style={{
          width: 400,
          height: 400,
          transform: [{ translateX: -120 }, { translateY: -160 }],
        }}
      />

      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <ResponsiveContainer className="py-6">

            {/* Avatar + Name Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-gradient-to-br items-center justify-center mb-4 border-2 border-white/15"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
              >
                <Text className="text-white text-2xl font-bold">
                  {getInitials(nombre, apellido)}
                </Text>
              </View>
              <Text className="text-white text-xl font-bold">{displayName}</Text>
              <Text className="text-neutral-400 text-sm mt-1">{roleLabel}</Text>
            </View>

            {/* Info Cards */}
            <View className="gap-3 mb-8">
              {email && (
                <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <Mail color="#60a5fa" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 text-xs">Correo electrónico</Text>
                      <Text className="text-white font-medium">{email}</Text>
                    </View>
                  </View>
                </LiquidView>
              )}

              <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
                    <Shield color="#a78bfa" size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 text-xs">Rol</Text>
                    <Text className="text-white font-medium">{roleLabel}</Text>
                  </View>
                </View>
              </LiquidView>

              {condominioName && (
                <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center">
                      <Building2 color="#4ade80" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 text-xs">Condominio</Text>
                      <Text className="text-white font-medium">{condominioName}</Text>
                    </View>
                  </View>
                </LiquidView>
              )}
            </View>

            {/* Divider */}
            <View className="h-px bg-white/8 mb-6" />

            {/* Actions */}
            <View className="gap-3">
              <Pressable
                onPress={handleLogout}
                className="flex-row items-center gap-3 p-4 rounded-2xl border border-white/5 active:opacity-70"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
              >
                <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center">
                  <LogOut color="#f87171" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-red-400 font-semibold">Cerrar Sesión</Text>
                  <Text className="text-neutral-500 text-xs">Salir de tu cuenta</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={handleClearCache}
                className="flex-row items-center gap-3 p-4 rounded-2xl border border-white/5 active:opacity-70"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
              >
                <View className="w-10 h-10 rounded-full bg-orange-500/20 items-center justify-center">
                  <Trash2 color="#fb923c" size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-orange-400 font-semibold">Limpiar Datos Locales</Text>
                  <Text className="text-neutral-500 text-xs">Eliminar sesión y caché almacenados</Text>
                </View>
              </Pressable>
            </View>

          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
