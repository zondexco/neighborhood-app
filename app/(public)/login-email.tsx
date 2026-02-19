import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const setEmailTemp = useAuth((state) => state.setEmailTemp);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const emailTrim = email.trim().toLowerCase();
  const isValidEmail = EMAIL_REGEX.test(emailTrim);

  const handleEmailChange = (text: string) => {
    setEmail(text.replace(/\s/g, ''));
  };

  const handleNext = () => {
    if (!isValidEmail) {
      if (Platform.OS === 'web') {
        window.alert('Por favor ingresa un correo electrónico válido.');
      } else {
        Alert.alert('Email inválido', 'Por favor ingresa un correo electrónico válido.');
      }
      return;
    }
    setEmailTemp(emailTrim);
    router.push('/login-pin');
  };

  const handleDomainSelect = (domain: string) => {
    const base = email.includes('@') ? email.split('@')[0] : email;
    const newEmail = (base || '') + domain;
    setEmail(newEmail);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const filteredDomains = !email.includes('@')
    ? DOMAINS
    : DOMAINS.filter((d) => {
        const typed = '@' + (email.split('@')[1] || '').toLowerCase();
        return d.startsWith(typed) && d !== typed;
      });

  const MainContent = (
    <ScrollView 
      style={s.scroll}
      contentContainerStyle={[
        s.scrollContent, 
        { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }
      ]}
      keyboardShouldPersistTaps="always"
    >
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center mb-10 gap-x-2 active:opacity-50"
        hitSlop={15}
      >
        <ArrowLeft color="#a3a3a3" size={24} />
        <Text className="text-[#a3a3a3] text-lg font-medium">Atrás</Text>
      </Pressable>

      <View className="flex-1 justify-center max-w-[520px] w-full self-center">
        {/* Icon */}
        <View className="w-[68px] h-[68px] rounded-[22px] bg-neutral-900 border border-neutral-800 items-center justify-center mb-8">
          <Mail color="#ffffff" size={30} />
        </View>

        {/* Header */}
        <Text className="text-white text-4xl font-extrabold tracking-tighter mb-3">Identifícate</Text>
        <Text className="text-neutral-500 text-lg leading-7 mb-11">
          Ingresa tu correo electrónico para continuar con el inicio de sesión.
        </Text>

        {/* Email Input */}
        <View className={`flex-row items-center px-5 h-[68px] rounded-2xl border ${email.length > 0 ? 'border-neutral-700 bg-neutral-800/50' : 'border-neutral-800 bg-neutral-900'}`}>
          <Mail color="#525252" size={20} />
          <TextInput
            ref={inputRef}
            placeholder="usuario@dominio.com"
            placeholderTextColor="#404040"
            value={email}
            onChangeText={handleEmailChange}
            onSubmitEditing={handleNext}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            className="flex-1 ml-3.5 text-white text-lg h-full"
            // @ts-ignore web
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
          />
        </View>

        {/* Domain Suggestions - Mobile Fix with direct gap and margins */}
        {filteredDomains.length > 0 && (
          <View className="flex-row flex-wrap mt-6 -mx-1.5">
            {filteredDomains.map((domain) => (
              <Pressable
                key={domain}
                onPress={() => handleDomainSelect(domain)}
                className="bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-700 m-1.5 active:bg-neutral-800 active:border-neutral-600"
                style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
              >
                <Text className="text-neutral-300 text-sm font-medium">{domain}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Validation indicator */}
        {isValidEmail && (
          <View className="mt-7 padding-3.5 bg-green-500/10 rounded-xl border border-green-500/30 p-3.5">
            <Text className="text-green-400 text-sm font-semibold text-center">✓ Formato de correo válido</Text>
          </View>
        )}
      </View>

      {/* Footer Button */}
      <View className="py-8 items-center">
        <Pressable
          onPress={handleNext}
          disabled={!isValidEmail}
          className={`w-full max-w-[520px] h-16 rounded-2xl flex-row items-center justify-center border ${isValidEmail ? 'bg-white border-white active:opacity-90' : 'bg-neutral-900 border-neutral-800'}`}
        >
          <Text className={`font-extrabold text-lg mr-2.5 ${isValidEmail ? 'text-black' : 'text-neutral-600'}`}>
            Continuar
          </Text>
          <ArrowRight color={isValidEmail ? '#000000' : '#404040'} size={22} />
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={s.flex1}>
          {MainContent}
        </KeyboardAvoidingView>
      ) : (
        MainContent
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  flex1: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
});
