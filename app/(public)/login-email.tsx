import React, { useState, useRef, useCallback } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useThemeColors } from '@/hooks/useThemeColors';

// Strict ASCII-only email: local part allows alphanum + . _ % + -, domain requires valid TLD (2+ alpha chars)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const { width, height } = useWindowDimensions();
  const setEmailTemp = useAuth((state) => state.setEmailTemp);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, iconPrimary, iconMuted, bgSecondary, placeholderText } = useThemeColors();
  const isCompact = width < 380 || height < 720;
  const contentPaddingHorizontal = isCompact ? 20 : 28;
  const iconSize = isCompact ? 58 : 68;
  const inputHeight = isCompact ? 60 : 68;
  const ctaHeight = isCompact ? 58 : 64;

  const scrollRef = useRef<ScrollView>(null);
  const emailTrim = email.trim().toLowerCase();
  const isValidEmail = EMAIL_REGEX.test(emailTrim);

  const scrollToInput = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, []);

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
      ref={scrollRef}
      style={s.scroll}
      contentContainerStyle={[
        s.scrollContent,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: contentPaddingHorizontal,
        },
      ]}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="interactive"
    >
      {/* Back Button */}
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center mb-10 gap-x-2 active:opacity-50"
        hitSlop={15}
      >
        <ArrowLeft color={iconMuted} size={24} />
        <Text className="text-neutral-500 text-lg font-medium">Atrás</Text>
      </Pressable>

      <View className="flex-1 justify-center max-w-[520px] w-full self-center">
        {/* Icon */}
        <View
          className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 items-center justify-center mb-8"
          style={{ width: iconSize, height: iconSize, borderRadius: isCompact ? 18 : 22 }}
        >
          <Mail color={iconPrimary} size={30} />
        </View>

        {/* Header */}
        <Text
          className="text-neutral-950 dark:text-white font-extrabold tracking-tighter mb-3"
          style={{ fontSize: isCompact ? 32 : 36 }}
        >
          Identifícate
        </Text>
        <Text
          className="text-neutral-500 leading-7 mb-11"
          style={{ fontSize: isCompact ? 16 : 18 }}
        >
          Ingresa tu correo electrónico para continuar con el inicio de sesión.
        </Text>

        {/* Email Input */}
        <View
          className={`flex-row items-center px-5 rounded-2xl border ${email.length > 0 ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50' : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900'}`}
          style={{ height: inputHeight }}
        >
          <Mail color="#525252" size={20} />
          <TextInput
            ref={inputRef}
            placeholder="usuario@dominio.com"
            placeholderTextColor={placeholderText}
            value={email}
            onChangeText={handleEmailChange}
            onSubmitEditing={handleNext}
            onFocus={scrollToInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            className="flex-1 ml-3.5 text-neutral-950 dark:text-white text-lg h-full"
            // @ts-ignore web
            style={Platform.OS === 'web' ? { outlineStyle: 'none' } : {}}
          />
        </View>

        {/* Domain Suggestions */}
        {filteredDomains.length > 0 && (
          <View className="flex-row flex-wrap mt-6 -mx-1.5">
            {filteredDomains.map((domain) => (
              <Pressable
                key={domain}
                onPress={() => handleDomainSelect(domain)}
                className="bg-neutral-100 dark:bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 m-1.5 active:bg-neutral-200 dark:active:bg-neutral-800"
                style={Platform.OS === 'web' ? { cursor: 'pointer' } : {}}
              >
                <Text className="text-neutral-700 dark:text-neutral-300 text-sm font-medium">{domain}</Text>
              </Pressable>
            ))}
          </View>
        )}

      </View>

      {/* Footer Button */}
      <View className="py-8 items-center">
        <Pressable
          onPress={handleNext}
          disabled={!isValidEmail}
          className={`w-full max-w-[520px] rounded-2xl flex-row items-center justify-center border ${isValidEmail ? 'bg-neutral-950 dark:bg-white border-neutral-950 dark:border-white active:opacity-90' : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}
          style={{ height: ctaHeight }}
        >
          <Text className={`font-extrabold text-lg mr-2.5 ${isValidEmail ? 'text-white dark:text-black' : 'text-neutral-400 dark:text-neutral-600'}`}>
            Continuar
          </Text>
          <ArrowRight color={isValidEmail ? (isDark ? '#000000' : '#ffffff') : '#a3a3a3'} size={22} />
        </Pressable>
      </View>
    </ScrollView>
  );

  return (
    <View style={[s.container, { backgroundColor: bgSecondary }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.flex1}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {MainContent}
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor set inline from useThemeColors
  },
  flex1: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
