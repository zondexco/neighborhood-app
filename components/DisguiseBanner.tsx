import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, X } from 'lucide-react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthState } from '@/features/auth/hooks/useAuth';
import { router } from 'expo-router';

export default function DisguiseBanner() {
  const isDisguised = useAuth((s: AuthState) => s.isDisguised);
  const condominioName = useAuth((s: AuthState) => s.condominioName);
  const endDisguise = useAuth((s: AuthState) => s.endDisguise);
  const { top } = useSafeAreaInsets();

  if (!isDisguised) return null;

  const handleExit = () => {
    endDisguise();
    router.replace('/dev' as any);
  };

  return (
    <View
      style={{ paddingTop: top + 4 }}
      className="absolute top-0 left-0 right-0 z-50 bg-amber-500 px-4 pb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          <Zap color="white" size={16} />
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>
            Soporte en {condominioName ?? 'condominio'}
          </Text>
        </View>
        <Pressable
          onPress={handleExit}
          className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <X color="white" size={14} />
          <Text className="text-white font-semibold text-xs">Salir</Text>
        </Pressable>
      </View>
    </View>
  );
}
