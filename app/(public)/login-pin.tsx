import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { VirtualKeypad } from '@/components/ui/VirtualKeypad';
import { api } from '@/lib/api';
import * as LocalAuthentication from 'expo-local-authentication';
import { Breakpoints } from '@/constants/theme';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default function LoginPinScreen() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const email = useAuth(state => state.emailTemp);
  const login = useAuth(state => state.login);
  const { width } = useWindowDimensions();
  const isLaptop = width >= Breakpoints.laptop;

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(hasHardware && isEnrolled);
  };

  const handleBiometricAuth = async () => {
    // Nota: Esto solo funciona si ya tenemos el PIN guardado seguramente (ej. SecureStore).
    // Por simplicidad en esta demo, simulamos que valida y hace login.
    // En producción: recuperar credenciales de SecureStore tras éxito biométrico.
    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación Biométrica',
        fallbackLabel: 'Usar PIN'
    });

    if (result.success) {
       Alert.alert("Biometría Exitosa", "En producción aquí recuperaríamos las credenciales guardadas.");
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        handleLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = async (completePin: string) => {
    // Validación de seguridad para no enviar request vacío
    if (!email) {
      Alert.alert('Error', 'No se ha detectado el email. Vuelve atrás e ingrésalo nuevamente.');
      return;
    }

    setLoading(true);
    console.log("Enviando login payload:", { email: email, pin: completePin }); // Debug log

    try {
        const response = await api.post('/auth/login', {
            email: email,
            pin: completePin
        });

        if (response.data && response.data.token && response.data.refresh_token) {
            login({
              token: response.data.token,
              refreshToken: response.data.refresh_token,
              userId: response.data.user_id,
              email: response.data.email,
              role: response.data.role,
              isAdmin: response.data.is_admin,
            });
            router.replace('/home');
        }
    } catch (error: any) {
        setPin(''); // Reset PIN on error
        const msg = error.response?.data?.message || 'Error de conexión';
        Alert.alert('Error de acceso', msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <SafeAreaView className="flex-1">
        <ResponsiveContainer maxWidth={560} className="flex-1 py-4 laptop:py-8">
          {/* Header */}
          <View className="py-4 items-start">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 9999,
                backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
              })}
            >
              <ChevronLeft color="white" size={28} />
            </Pressable>
          </View>

          <View className={`flex-1 items-center justify-center ${isLaptop ? 'rounded-3xl border border-white/10 bg-white/[0.03] px-8' : ''}`}>
            <Text className="text-white text-3xl font-bold mb-3 text-center">Ingresa tu PIN</Text>
            <Text className="text-neutral-400 text-lg mb-12 text-center">{email}</Text>

            {/* PIN Dots Display */}
            <View className="flex-row gap-4 mb-12 h-8">
              {[...Array(6)].map((_, i) => (
                <View 
                  key={i} 
                  className={`w-4 h-4 rounded-full ${i < pin.length ? 'bg-white' : 'bg-white/20'}`}
                />
              ))}
            </View>

            {loading && <ActivityIndicator size="large" color="white" className="mb-8" />}
          </View>

          {/* Keypad at bottom */}
          <VirtualKeypad 
            onPress={handleKeyPress} 
            onDelete={handleDelete} 
            biometricAvailable={biometricAvailable}
            onBiometric={handleBiometricAuth}
          />
        </ResponsiveContainer>
      </SafeAreaView>
    </View>
  );
}
