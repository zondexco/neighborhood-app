import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Pressable, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Mail, ArrowRight } from 'lucide-react-native';
import { DomainSuggestions } from '@/components/ui/DomainSuggestions';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Breakpoints } from '@/constants/theme';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const inputRef = useRef<TextInput>(null);
  const setEmailTemp = useAuth(state => state.setEmailTemp);
  const { width } = useWindowDimensions();
  const isLaptop = width >= Breakpoints.laptop;
  const useLiquid = Platform.OS === 'ios';

  const emailTrim = email.trim().toLowerCase();
  const canContinue = EMAIL_REGEX.test(emailTrim);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value.replace(/\s/g, ''));
  }, []);

  const handleNext = useCallback(() => {
    if (!canContinue) {
      Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido (ej: usuario@dominio.com).');
      return;
    }
    setEmailTemp(emailTrim);
    router.push('/login-pin');
  }, [canContinue, emailTrim, setEmailTemp]);

  const handleDomainSelect = useCallback((domain: string) => {
    const newEmail = email.includes('@')
      ? email.split('@')[0] + domain
      : email + domain;
    setEmail(newEmail);
    // Mantener foco en el input después de seleccionar dominio
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [email]);

  // Componente del input reutilizado para ambas ramas (iOS / no-iOS)
  const renderEmailInput = (isLiquid: boolean) => (
    <View
      className={`rounded-2xl border border-white/10 flex-row items-center px-4 ${isLiquid ? '' : 'bg-black/55'}`}
      style={{ height: 64 }}
    >
      <Mail color="#A3A3A3" size={20} />
      <TextInput
        ref={inputRef}
        placeholder="usuario@dominio.com"
        placeholderTextColor="#666"
        className="flex-1 ml-3"
        style={{ color: '#FFFFFF', fontSize: 18, paddingVertical: 12 }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        inputMode="email"
        value={email}
        onChangeText={handleEmailChange}
        onSubmitEditing={handleNext}
        returnKeyType="next"
        autoFocus
      />
    </View>
  );

  const renderForm = () => (
    <>
      <View className="mb-10">
        <Text className="text-white text-4xl font-bold mb-3">Identifícate</Text>
        <Text className="text-neutral-400 text-xl leading-8">
          Ingresa tu correo para continuar con el inicio de sesión.
        </Text>
      </View>

      <View className="gap-y-4">
        {useLiquid ? (
          <LiquidView intensity={20} tint="dark" className="rounded-2xl border border-white/10 flex-row items-center px-4" style={{ height: 64 }}>
            <Mail color="#A3A3A3" size={20} />
            <TextInput
              ref={inputRef}
              placeholder="usuario@dominio.com"
              placeholderTextColor="#666"
              className="flex-1 ml-3"
              style={{ color: '#FFFFFF', fontSize: 18, paddingVertical: 12 }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              inputMode="email"
              value={email}
              onChangeText={handleEmailChange}
              onSubmitEditing={handleNext}
              returnKeyType="next"
              autoFocus
            />
          </LiquidView>
        ) : (
          renderEmailInput(false)
        )}

        <DomainSuggestions email={email} onSelect={handleDomainSelect} />
      </View>

      <View className="mt-8 flex-row justify-end">
        <Pressable
          onPress={handleNext}
          disabled={!canContinue}
          style={({ pressed }) => [
            {
              height: 56,
              paddingHorizontal: 32,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: canContinue ? '#FFFFFF' : '#262626',
            },
            pressed && canContinue && { opacity: 0.85 },
          ]}
        >
          <Text
            style={{
              fontWeight: '700',
              fontSize: 18,
              marginRight: 8,
              color: canContinue ? '#000000' : '#737373',
            }}
          >
            Continuar
          </Text>
          <ArrowRight color={canContinue ? '#000000' : '#525252'} size={20} />
        </Pressable>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-neutral-900">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Background Gradients */}
      <View className="absolute bg-blue-600/30 rounded-full" style={{ width: 300, height: 300, top: -100, left: -50 }} />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* ScrollView con keyboardShouldPersistTaps para que los botones
              de dominio y "Continuar" funcionen con el teclado abierto */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <ResponsiveContainer maxWidth={560} className="justify-center">
              {useLiquid ? (
                <LiquidView
                  intensity={isLaptop ? 25 : 15}
                  tint="dark"
                  className={`rounded-3xl border border-white/10 ${isLaptop ? 'px-8 py-10' : 'px-6 py-8'}`}
                >
                  {renderForm()}
                </LiquidView>
              ) : (
                <View className={`rounded-3xl border border-white/10 bg-black/65 ${isLaptop ? 'px-8 py-10' : 'px-6 py-8'}`}>
                  {renderForm()}
                </View>
              )}
            </ResponsiveContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
