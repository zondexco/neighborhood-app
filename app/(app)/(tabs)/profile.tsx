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
import {
  Mail,
  Building2,
  LogOut,
  Trash2,
  Sun,
  Moon,
  AArrowUp,
  AArrowDown,
  Type,
  Settings,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { LiquidView } from '@/components/native/LiquidView';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { useSettings, TEXT_SIZES } from '@/features/settings/useSettings';
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

  // Persisted settings
  const theme = useSettings((s) => s.theme);
  const textSizeIndex = useSettings((s) => s.textSizeIndex);
  const setTheme = useSettings((s) => s.setTheme);
  const setTextSizeIndex = useSettings((s) => s.setTextSizeIndex);
  const darkMode = theme === 'dark';

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'Neighborhood';

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
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4 border-2 border-white/15"
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
            <View className="gap-3 mb-6">
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

            {/* Settings Section */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Settings color="#a1a1aa" size={16} />
                <Text className="text-neutral-400 text-sm font-semibold uppercase tracking-wider">
                  Ajustes
                </Text>
              </View>

              <View className="gap-3">
                {/* Theme toggle */}
                <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 rounded-full bg-yellow-500/20 items-center justify-center">
                      {darkMode ? <Moon color="#facc15" size={20} /> : <Sun color="#facc15" size={20} />}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium">Apariencia</Text>
                      <Text className="text-neutral-500 text-xs">
                        {darkMode ? 'Modo oscuro' : 'Modo claro'}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setTheme('light')}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
                        !darkMode ? 'bg-white/15' : 'bg-white/5'
                      }`}
                    >
                      <Sun color={!darkMode ? '#ffffff' : '#666'} size={16} />
                      <Text className={!darkMode ? 'text-white font-semibold text-sm' : 'text-neutral-500 text-sm'}>
                        Claro
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setTheme('dark')}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
                        darkMode ? 'bg-white/15' : 'bg-white/5'
                      }`}
                    >
                      <Moon color={darkMode ? '#ffffff' : '#666'} size={16} />
                      <Text className={darkMode ? 'text-white font-semibold text-sm' : 'text-neutral-500 text-sm'}>
                        Oscuro
                      </Text>
                    </Pressable>
                  </View>
                </LiquidView>

                {/* Text size */}
                <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <Type color="#60a5fa" size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium">Tamaño de texto</Text>
                      <Text className="text-neutral-500 text-xs">{TEXT_SIZES[textSizeIndex].label}</Text>
                    </View>
                  </View>
                  <View className="bg-white/5 rounded-xl px-3 py-2 mb-3">
                    <Text
                      className="text-neutral-300 text-center"
                      style={{ fontSize: 14 * TEXT_SIZES[textSizeIndex].value }}
                    >
                      Vista previa del texto
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => setTextSizeIndex(textSizeIndex - 1)}
                      disabled={textSizeIndex === 0}
                      className={`w-10 h-10 rounded-xl items-center justify-center ${
                        textSizeIndex === 0 ? 'bg-white/5' : 'bg-white/10'
                      }`}
                    >
                      <AArrowDown color={textSizeIndex === 0 ? '#444' : '#ffffff'} size={18} />
                    </Pressable>
                    <View className="flex-1 flex-row gap-1">
                      {TEXT_SIZES.map((size, i) => (
                        <View
                          key={size.label}
                          className={`flex-1 h-1.5 rounded-full ${
                            i <= textSizeIndex ? 'bg-blue-500' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </View>
                    <Pressable
                      onPress={() => setTextSizeIndex(Math.min(TEXT_SIZES.length - 1, textSizeIndex + 1))}
                      disabled={textSizeIndex === TEXT_SIZES.length - 1}
                      className={`w-10 h-10 rounded-xl items-center justify-center ${
                        textSizeIndex === TEXT_SIZES.length - 1 ? 'bg-white/5' : 'bg-white/10'
                      }`}
                    >
                      <AArrowUp color={textSizeIndex === TEXT_SIZES.length - 1 ? '#444' : '#ffffff'} size={18} />
                    </Pressable>
                  </View>
                </LiquidView>
              </View>
            </View>

            {/* Divider */}
            <View className="h-px bg-white/5 mb-6" />

            {/* Actions */}
            <View className="gap-3 mb-10">
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

            {/* Footer */}
            <View className="items-center gap-1 pt-4">
              <Text className="text-neutral-600 text-xs">{appName}</Text>
              <Text className="text-neutral-700 text-[10px]">Versión {appVersion}</Text>
            </View>

          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
