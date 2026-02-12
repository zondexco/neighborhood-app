import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Mail, ArrowRight } from 'lucide-react-native';
import { DomainSuggestions } from '@/components/ui/DomainSuggestions';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const setEmailTemp = useAuth(state => state.setEmailTemp);

  const handleNext = () => {
    const emailTrim = email.trim();
    // Validación más estricta de regex para evitar error 400 del backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailTrim || !emailRegex.test(emailTrim)) {
      Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido (ej: usuario@dominio.com).');
      return;
    }
    
    setEmailTemp(emailTrim);
    router.push('/login-pin');
  };

  const handleDomainSelect = (domain: string) => {
    if (email.includes('@')) {
      setEmail(email.split('@')[0] + domain);
    } else {
      setEmail(email + domain);
    }
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      {/* Background Gradients */}
      <View className="absolute top-[-100] left-[-50] w-[300] h-[300] bg-blue-600/30 rounded-full blur-3xl" />

      <SafeAreaView className="flex-1 justify-center">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1 justify-center px-8"
        >
          
          <View className="mb-12">
            <Text className="text-white text-4xl font-bold mb-3">Identifícate</Text>
            <Text className="text-neutral-400 text-xl leading-8">
              Ingresa tu correo para continuar con el inicio de sesión.
            </Text>
          </View>

          <View className="gap-y-4">
            <LiquidView intensity={20} tint="dark" className="rounded-2xl border border-white/10 flex-row items-center px-4 h-16">
              <Mail color="#A3A3A3" size={20} />
              <TextInput 
                placeholder="usuario@dominio.com" 
                placeholderTextColor="#666"
                className="flex-1 text-white ml-3 text-lg h-full"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                autoFocus
              />
            </LiquidView>
            
            <DomainSuggestions onSelect={handleDomainSelect} />
          </View>

          <View className="mt-8 flex-row justify-end">
            <TouchableOpacity 
              className={`h-14 px-8 rounded-full items-center justify-center flex-row ${email.length > 5 ? 'bg-white' : 'bg-neutral-800'}`}
              onPress={handleNext}
              disabled={email.length < 5}
            >
              <Text className={`font-bold text-lg mr-2 ${email.length > 5 ? 'text-black' : 'text-neutral-500'}`}>Continuar</Text>
              <ArrowRight color={email.length > 5 ? 'black' : '#525252'} size={20} />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
