import React, { useState, useRef, useEffect } from 'react';
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
    // Use a longer timeout for web focus
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

  // Use plain View on web to avoid event issues with KeyboardAvoidingView
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
        style={({ pressed }) => [
          s.backButton,
          pressed && s.backButtonPressed,
        ]}
        hitSlop={15}
      >
        <ArrowLeft color="#a3a3a3" size={24} />
        <Text style={s.backText}>Atrás</Text>
      </Pressable>

      <View style={s.centerContent}>
        {/* Icon */}
        <View style={s.iconContainer}>
          <Mail color="#ffffff" size={30} />
        </View>

        {/* Header */}
        <Text style={s.title}>Identifícate</Text>
        <Text style={s.subtitle}>
          Ingresa tu correo electrónico para continuar con el inicio de sesión.
        </Text>

        {/* Email Input */}
        <View style={[s.inputBox, email.length > 0 && s.inputBoxActive]}>
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
            style={s.textInput}
          />
        </View>

        {/* Domain Suggestions */}
        {filteredDomains.length > 0 && (
          <View style={s.chipsWrapper}>
            {filteredDomains.map((domain) => (
              <Pressable
                key={domain}
                onPress={() => handleDomainSelect(domain)}
                style={({ pressed }) => [
                  s.chip,
                  pressed && s.chipPressed,
                  // @ts-ignore
                  Platform.OS === 'web' && { cursor: 'pointer' }
                ]}
              >
                <Text style={s.chipText}>{domain}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Validation indicator */}
        {isValidEmail && (
          <View style={s.validationBox}>
            <Text style={s.validationTxt}>✓ Formato de correo válido</Text>
          </View>
        )}
      </View>

      {/* Footer Button */}
      <View style={s.footer}>
        <Pressable
          onPress={handleNext}
          disabled={!isValidEmail}
          style={({ pressed }) => [
            s.continueBtn,
            {
              backgroundColor: isValidEmail ? '#FFFFFF' : '#171717',
              borderColor: isValidEmail ? '#FFFFFF' : '#262626',
              opacity: pressed && isValidEmail ? 0.9 : 1,
            },
          ]}
        >
          <Text
            style={[
              s.continueTxt,
              { color: isValidEmail ? '#000000' : '#404040' },
            ]}
          >
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  backButtonPressed: {
    opacity: 0.5,
  },
  backText: {
    color: '#a3a3a3',
    fontSize: 18,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    color: '#737373',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 44,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 68,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#171717',
  },
  inputBoxActive: {
    borderColor: '#404040',
    backgroundColor: '#1c1c1c',
  },
  textInput: {
    flex: 1,
    marginLeft: 14,
    color: '#FFFFFF',
    fontSize: 19,
    height: '100%',
    // @ts-ignore web
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  chip: {
    backgroundColor: '#171717',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262626',
  },
  chipPressed: {
    backgroundColor: '#262626',
  },
  chipText: {
    color: '#a3a3a3',
    fontSize: 15,
    fontWeight: '500',
  },
  validationBox: {
    marginTop: 28,
    padding: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  validationTxt: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    maxWidth: 520,
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  continueTxt: {
    fontWeight: '800',
    fontSize: 19,
    marginRight: 10,
  },
});
