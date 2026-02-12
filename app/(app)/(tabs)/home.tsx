import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { Wallet, QrCode, Bell, ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-black">
      {/* Decorative Gradients */}
      <View className="absolute top-0 right-0 w-[400] h-[400] bg-blue-600/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2" />
      
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-6">
          
          {/* Header */}
          <View className="mb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-neutral-400 text-base font-medium">Buenos días,</Text>
              <Text className="text-white text-3xl font-bold">Cristian ☀️</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center border border-white/10">
              <Bell color="white" size={20} />
            </TouchableOpacity>
          </View>

          {/* Status Cards */}
          <View className="flex-row gap-4 mb-8">
            {/* Balance Card */}
            <LiquidView intensity={30} tint="dark" className="flex-1 p-4 rounded-3xl border border-white/10 gap-3">
              <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center">
                <Wallet color="#4ade80" size={20} />
              </View>
              <View>
                <Text className="text-neutral-400 text-xs font-bold uppercase tracking-wider">Estado de cuenta</Text>
                <Text className="text-white text-xl font-bold mt-1">Al día</Text>
                <Text className="text-green-400 text-xs mt-1">Sin deuda pendiente</Text>
              </View>
            </LiquidView>

            {/* Access Card */}
            <TouchableOpacity className="flex-1" activeOpacity={0.8}>
              <LiquidView intensity={30} tint="dark" className="flex-1 p-4 rounded-3xl border border-white/10 gap-3 bg-blue-600/20">
                <View className="w-10 h-10 rounded-full bg-blue-500/30 items-center justify-center">
                  <QrCode color="#60a5fa" size={20} />
                </View>
                <View>
                  <Text className="text-blue-200/60 text-xs font-bold uppercase tracking-wider">Acceso Rápido</Text>
                  <Text className="text-white text-xl font-bold mt-1">Generar QR</Text>
                  <Text className="text-blue-300 text-xs mt-1">Vence en 5 min</Text>
                </View>
              </LiquidView>
            </TouchableOpacity>
          </View>

          {/* Quick Actions List */}
          <Text className="text-white text-lg font-bold mb-4">Actividad Reciente</Text>
          <View className="gap-y-3">
            {[1, 2, 3].map((item) => (
              <LiquidView key={item} intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-2 h-2 rounded-full bg-orange-500" />
                  <View>
                    <Text className="text-white font-medium">Paquete Recibido</Text>
                    <Text className="text-neutral-500 text-xs">Recepción • Hace 2h</Text>
                  </View>
                </View>
                <ChevronRight color="#666" size={16} />
              </LiquidView>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
