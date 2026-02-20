import React from 'react';
import { View, Text, ImageBackground, Pressable, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />

      <ImageBackground
        source={require('../../assets/images/android-icon-background.png')}
        style={s.bg}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFillObject, s.overlay]} />

        <SafeAreaView style={s.safeArea}>
          <View style={s.card}>
            <View style={s.cardContent}>
              <Text style={s.eyebrow}>Bienvenido a</Text>
              <Text style={s.title}>Neighborhood</Text>
              <Text style={s.subtitle}>
                Tu comunidad, conectada. Gestiona pagos, reservas y accesos desde un solo lugar.
              </Text>
            </View>

            <Link href="/login-email" asChild>
              <Pressable style={({ pressed }) => [s.primaryBtn, pressed && s.pressed]}>
                <Text style={s.primaryBtnText}>Conectar</Text>
                <ArrowRight size={20} color="#000" />
              </Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1, justifyContent: 'flex-end' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.50)' },
  safeArea: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    padding: 20,
  },
  cardContent: { marginBottom: 24 },
  eyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500', marginBottom: 4 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 22, marginTop: 12 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 18 },
  pressed: { opacity: 0.75 },
});
