import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Mail, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

export default function LoginEmailScreen() {
  const [email, setEmail] = useState('');
  const setEmailTemp = useAuth((state) => state.setEmailTemp);

  const emailTrim = email.trim().toLowerCase();
  const isValidEmail = EMAIL_REGEX.test(emailTrim);

  const handleEmailChange = (text: string) => {
    setEmail(text.replace(/\s/g, ''));
  };

  const handleNext = () => {
    if (!isValidEmail) {
      Alert.alert(
        'Email inválido',
        'Por favor ingresa un correo electrónico válido (ej: usuario@dominio.com).',
      );
      return;
    }
    setEmailTemp(emailTrim);
    router.push('/login-pin');
  };

  const handleDomainSelect = (domain: string) => {
    const base = email.includes('@') ? email.split('@')[0] : email;
    setEmail(base + domain);
  };

  const filteredDomains = !email.includes('@')
    ? DOMAINS
    : DOMAINS.filter((d) => {
        const typed = '@' + (email.split('@')[1] || '');
        return d.startsWith(typed) && d !== typed;
      });

  return (
    <View style={s.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <View style={s.container}>
        <View style={s.card}>
          {/* Header */}
          <Text style={s.title}>Identifícate</Text>
          <Text style={s.subtitle}>
            Ingresa tu correo para continuar con el inicio de sesión.
          </Text>

          {/* Email Input */}
          <View style={s.inputRow}>
            <Mail color="#A3A3A3" size={20} />
            <TextInput
              placeholder="usuario@dominio.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={handleEmailChange}
              onSubmitEditing={handleNext}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              style={s.textInput as any}
            />
          </View>

          {/* Domain suggestions */}
          {filteredDomains.length > 0 && (
            <View style={s.chipsContainer}>
              {filteredDomains.map((domain) => (
                <Pressable
                  key={domain}
                  onPress={() => handleDomainSelect(domain)}
                  style={({ pressed }) => [
                    s.chip,
                    pressed && s.chipPressed,
                    Platform.OS === 'web' && (s.chipWeb as any),
                  ]}
                >
                  <Text style={s.chipText}>{domain}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Continue button */}
          <View style={s.buttonRow}>
            <Pressable
              onPress={handleNext}
              disabled={!isValidEmail}
              style={({ pressed }) => [
                s.continueBtn,
                {
                  backgroundColor: isValidEmail ? '#FFFFFF' : '#262626',
                  opacity: pressed && isValidEmail ? 0.8 : 1,
                },
                Platform.OS === 'web' && (s.continueBtnWeb as any),
              ]}
            >
              <Text
                style={[
                  s.continueTxt,
                  { color: isValidEmail ? '#000' : '#737373' },
                ]}
              >
                Continuar
              </Text>
              <ArrowRight color={isValidEmail ? '#000' : '#525252'} size={20} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#171717',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 20,
    lineHeight: 32,
    marginBottom: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 18,
    height: 48,
    // @ts-ignore - web only
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipWeb: {
    // @ts-ignore - web only
    cursor: 'pointer',
    userSelect: 'none',
  },
  chipPressed: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  continueBtn: {
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnWeb: {
    // @ts-ignore - web only
    cursor: 'pointer',
    userSelect: 'none',
    outlineStyle: 'none',
  },
  continueTxt: {
    fontWeight: '700',
    fontSize: 18,
    marginRight: 8,
  },
});
