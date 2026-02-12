import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delete } from 'lucide-react-native';

interface VirtualKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  biometricAvailable?: boolean;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ onPress, onDelete, onBiometric, biometricAvailable }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View className="w-full px-8 pb-10">
      <View className="flex-row flex-wrap justify-between gap-y-8">
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            onPress={() => onPress(digit)}
            className="w-[30%] items-center justify-center"
            activeOpacity={0.5}
          >
            <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center border border-white/5">
              <Text className="text-white text-3xl font-medium">{digit}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Bottom Row */}
        <View className="w-[30%] items-center justify-center">
            {biometricAvailable && (
                <TouchableOpacity onPress={onBiometric} className="w-20 h-20 items-center justify-center" activeOpacity={0.5}>
                    <Ionicons name="finger-print" size={36} color="#fff" />
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity
          onPress={() => onPress('0')}
          className="w-[30%] items-center justify-center"
          activeOpacity={0.5}
        >
          <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center border border-white/5">
            <Text className="text-white text-3xl font-medium">0</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          className="w-[30%] items-center justify-center"
          activeOpacity={0.5}
        >
            <View className="w-20 h-20 items-center justify-center">
                <Delete size={32} color="#fff" />
            </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
