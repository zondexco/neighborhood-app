import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, CalendarClock, Megaphone, Package } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { isDark, bgSecondary, iconPrimary, iconMuted } = useThemeColors();
  const isCompact = width < 380 || height < 720;

  return (
    <View style={[s.root, { backgroundColor: bgSecondary }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        pointerEvents="none"
        style={[
          s.blob,
          {
            width: Math.min(width * 0.9, 520),
            height: Math.min(width * 0.9, 520),
            right: -Math.min(width * 0.22, 120),
            top: -Math.min(width * 0.2, 100),
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.20)' : 'rgba(37, 99, 235, 0.12)',
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          s.blob,
          {
            width: Math.min(width * 0.75, 420),
            height: Math.min(width * 0.75, 420),
            left: -Math.min(width * 0.25, 140),
            bottom: -Math.min(width * 0.2, 110),
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(139, 92, 246, 0.10)',
          },
        ]}
      />

      <SafeAreaView style={[s.safeArea, { paddingHorizontal: isCompact ? 20 : 24 }]}>
        <View style={s.topSection}>
          <View
            style={[
              s.logoWrap,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
              },
            ]}
          >
            <Image
              source={require('@/assets/brand/icons/icon_128.png')}
              style={{ width: isCompact ? 36 : 42, height: isCompact ? 36 : 42 }}
            />
          </View>

          <Text style={[s.eyebrow, { color: iconMuted }]}>Bienvenido a</Text>
          <Text
            style={[s.title, { color: isDark ? '#fff' : '#0a0a0a', fontSize: isCompact ? 36 : 42 }]}
          >
            Neighborhood
          </Text>
          <Text style={[s.subtitle, { color: iconMuted }]}>
            Tu comunidad en una sola app: reservas, paquetería y comunicados.
          </Text>
        </View>

        <View
          style={[
            s.infoCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)',
            },
          ]}
        >
          <FeatureItem
            icon={<CalendarClock color={iconPrimary} size={18} />}
            label="Reserva espacios comunes"
            textColor={isDark ? '#fff' : '#0a0a0a'}
            subColor={iconMuted}
          />
          <FeatureItem
            icon={<Package color={iconPrimary} size={18} />}
            label="Consulta paquetería"
            textColor={isDark ? '#fff' : '#0a0a0a'}
            subColor={iconMuted}
          />
          <FeatureItem
            icon={<Megaphone color={iconPrimary} size={18} />}
            label="Recibe avisos del condominio"
            textColor={isDark ? '#fff' : '#0a0a0a'}
            subColor={iconMuted}
          />
        </View>

        <View style={s.bottomSection}>
          <View
            style={[
              s.primaryBtnShell,
              {
                height: isCompact ? 56 : 60,
                backgroundColor: isDark ? '#fff' : '#0a0a0a',
                borderColor: isDark ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.2)',
                shadowColor: isDark ? '#ffffff' : '#000000',
              },
            ]}
          >
            <Pressable
              onPress={() => router.push('/login-email')}
              style={({ pressed }) => [s.primaryBtnTap, { opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={s.primaryBtnContent}>
                <Text style={[s.primaryBtnText, { color: isDark ? '#0a0a0a' : '#fff' }]}>Continuar</Text>
                <View
                  style={[
                    s.arrowBadge,
                    {
                      backgroundColor: isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.14)',
                      borderColor: isDark ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)',
                    },
                  ]}
                >
                  <ArrowRight size={18} color={isDark ? '#0a0a0a' : '#fff'} />
                </View>
              </View>
            </Pressable>
          </View>

          <Text style={[s.footnote, { color: iconMuted }]}>Ingresarás con tu correo y PIN.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureItem({
  icon,
  label,
  textColor,
  subColor,
}: {
  icon: React.ReactNode;
  label: string;
  textColor: string;
  subColor: string;
}) {
  return (
    <View style={s.featureRow}>
      <View style={s.featureIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[s.featureLabel, { color: textColor }]}>{label}</Text>
        <Text style={[s.featureSub, { color: subColor }]}>Acceso rápido y simple.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1, paddingTop: 14, paddingBottom: 18 },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  topSection: {
    marginTop: 20,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 420,
  },
  infoCard: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  featureSub: {
    marginTop: 2,
    fontSize: 12,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  primaryBtnShell: {
    width: '100%',
    borderRadius: 18,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryBtnTap: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryBtnContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  arrowBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footnote: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },
});
