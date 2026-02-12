import React from 'react';
import { View, Text, ImageBackground, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      
      {/* Background Image - Remplace URI with a local asset for prod */}
      <ImageBackground 
        source={require('../../assets/images/android-icon-background.png')} 
        className="flex-1 justify-end"
        resizeMode="cover"
      >
        {/* Gradient Overlay (Simulated with plain view for now) */}
        <View className="absolute inset-0 bg-black/30" />

        <SafeAreaView className="p-4 md:p-6 pb-8 md:pb-12">
          {/* Glass Card */}
          <LiquidView intensity={30} tint="dark" className="rounded-3xl p-5 md:p-6 overflow-hidden border border-white/20 w-full max-w-[720px] self-center">
            <View className="mb-6">
              <Text className="text-white/80 text-base md:text-lg font-medium mb-1">Bienvenido a</Text>
              <Text className="text-white text-3xl md:text-4xl font-bold tracking-tight">Neighborhood</Text>
              <Text className="text-white/60 mt-4 text-sm md:text-base leading-6">
                Tu comunidad, conectada. Gestiona pagos, reservas y accesos desde un solo lugar.
              </Text>
            </View>

            <Link href="/login-email" asChild>
              <Pressable className="rounded-2xl overflow-hidden active:opacity-90">
                <LiquidView 
                  intensity={80} 
                  tint="light" 
                  className="flex-row items-center justify-center p-4"
                >
                  <Text className="text-black font-bold text-lg mr-2">Conectar</Text>
                  <ArrowRight size={20} color="black" />
                </LiquidView>
              </Pressable>
            </Link>
          </LiquidView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
