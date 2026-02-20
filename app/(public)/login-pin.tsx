import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { VirtualKeypad } from '@/components/ui/VirtualKeypad';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  isBiometricHardwareAvailable,
  isBiometricEnabledForEmail,
  getBiometricRefreshToken,
  getBiometricType,
  promptBiometric,
} from '@/features/auth/hooks/useBiometric';
import { api } from '@/lib/api';

// ── Error message mapping ─────────────────────────────────────────────────────
function mapLoginError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid email or pin') || m.includes('invalid_credentials') || m.includes('credentials')) {
    return 'Correo o PIN incorrecto. Verifica los datos e inténtalo de nuevo.';
  }
  if (m.includes('not found') || m.includes('no user')) {
    return 'No existe una cuenta con este correo electrónico.';
  }
  if (m.includes('locked') || m.includes('too many') || m.includes('rate')) {
    return 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.';
  }
  if (m.includes('inactive') || m.includes('disabled') || m.includes('suspended')) {
    return 'Esta cuenta está desactivada. Contacta al administrador.';
  }
  return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
}

export default function LoginPinScreen() {
  const [pin, setPin]                           = useState('');
  const [loading, setLoading]                   = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const email  = useAuth((s: AuthState) => s.emailTemp);
  const login  = useAuth((s: AuthState) => s.login);
  const insets = useSafeAreaInsets();
  const { isDark, bgSecondary, iconPrimary, iconMuted, activityColor } = useThemeColors();

  // ── Auto-trigger biometric on mount if this email has it enabled ──────────
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    (async () => {
      const hwOk = await isBiometricHardwareAvailable();
      if (!hwOk || cancelled) return;

      const enabledForEmail = await isBiometricEnabledForEmail(email);
      if (!enabledForEmail || cancelled) return;

      const type = await getBiometricType();
      if (cancelled) return;

      // Short delay so the screen renders before the system prompt appears
      await new Promise<void>(resolve => setTimeout(resolve, 350));
      if (cancelled) return;

      setBiometricLoading(true);
      try {
        const result = await promptBiometric(type);
        if (cancelled) return;

        // User cancelled or hardware failed — just fall through to PIN silently
        if (!result.success) return;

        const token = await getBiometricRefreshToken();
        if (!token || cancelled) return;

        const response = await api.post('/auth/refresh', { refresh_token: token });
        const d = response.data;
        if (!d?.token || !d?.refresh_token) throw new Error('invalid_response');

        login({
          token: d.token,
          refreshToken: d.refresh_token,
          userId: d.user_id,
          email: d.email,
          role: d.role,
          isAdmin: d.is_admin,
          condominioId: d.condominio_id,
          condominioName: d.condominio_nombre,
          nombre: d.nombre,
          apellido: d.apellido,
          apartmentId: d.apartment_id || null,
        });
        router.replace('/home');
      } catch (err: any) {
        if (cancelled) return;
        const isExpired = err?.response?.status === 401 || err?.message === 'invalid_response';
        if (isExpired) {
          Alert.alert('Sesión expirada', 'Tu sesión anterior venció. Ingresa tu PIN.');
        }
      } finally {
        if (!cancelled) setBiometricLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [email]);

  // ── PIN handlers ──────────────────────────────────────────────────────────
  const handleKeyPress = (digit: string) => {
    if (loading || biometricLoading || pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 6) handleLogin(newPin);
  };

  const handleDelete = () => {
    if (!loading && !biometricLoading) setPin((prev) => prev.slice(0, -1));
  };

  const handleLogin = async (completePin: string) => {
    if (!email) {
      Alert.alert('Error', 'No se detectó el correo. Vuelve atrás e ingrésalo nuevamente.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, pin: completePin });
      const d = response.data;
      if (d?.token && d?.refresh_token) {
        login({
          token: d.token,
          refreshToken: d.refresh_token,
          userId: d.user_id,
          email: d.email,
          role: d.role,
          isAdmin: d.is_admin,
          condominioId: d.condominio_id,
          condominioName: d.condominio_nombre,
          nombre: d.nombre,
          apellido: d.apellido,
          apartmentId: d.apartment_id || null,
        });
        router.replace('/home');
      }
    } catch (error: any) {
      setPin('');
      const raw = error.response?.data?.message ?? '';
      Alert.alert('Acceso denegado', raw ? mapLoginError(raw) : 'Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────
  const isLocked = loading || biometricLoading;

  const content = (
    <View
      style={{
        flex: 1,
        paddingTop: Math.max(insets.top, 20),
        paddingBottom: Math.max(insets.bottom, 12),
        paddingHorizontal: 28,
      }}
    >
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 40,
          opacity: pressed ? 0.5 : 1,
        })}
        hitSlop={15}
      >
        <ArrowLeft color={iconMuted} size={24} />
        <Text style={{ color: iconMuted, fontSize: 18, fontWeight: '500' }}>Atrás</Text>
      </Pressable>

      <View style={{ flex: 1, justifyContent: 'center', maxWidth: 520, width: '100%', alignSelf: 'center' }}>
        {/* Lock icon */}
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 22,
            backgroundColor: isDark ? '#18181b' : '#f5f5f5',
            borderWidth: 1,
            borderColor: isDark ? '#27272a' : '#e5e5e5',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <Lock color={iconPrimary} size={30} />
        </View>

        <Text
          style={{
            color: isDark ? '#ffffff' : '#0a0a0a',
            fontSize: 36,
            fontWeight: '800',
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Ingresa tu PIN
        </Text>

        <Text
          style={{ color: iconMuted, fontSize: 17, lineHeight: 26, marginBottom: 44 }}
          numberOfLines={1}
        >
          {email}
        </Text>

        {/* PIN dots */}
        <View style={{ flexDirection: 'row', gap: 14, marginBottom: 8, alignItems: 'center' }}>
          {[...Array(6)].map((_, i) => {
            const filled = i < pin.length;
            return (
              <View
                key={i}
                style={{
                  width: filled ? 15 : 13,
                  height: filled ? 15 : 13,
                  borderRadius: 8,
                  backgroundColor: filled ? iconPrimary : 'transparent',
                  borderWidth: filled ? 0 : 1.5,
                  borderColor: isDark ? '#404040' : '#d4d4d4',
                }}
              />
            );
          })}
        </View>

        {/* Loading */}
        {isLocked && (
          <View style={{ marginTop: 24 }}>
            <ActivityIndicator size="small" color={activityColor} />
          </View>
        )}
      </View>

      {/* Keypad */}
      <VirtualKeypad onPress={handleKeyPress} onDelete={handleDelete} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgSecondary }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}
