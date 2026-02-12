import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Delete } from 'lucide-react-native';
import { Breakpoints } from '@/constants/theme';

interface VirtualKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  biometricAvailable?: boolean;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ onPress, onDelete, onBiometric, biometricAvailable }) => {
  const { width } = useWindowDimensions();
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const isLaptop = width >= Breakpoints.laptop;
  const keySize = isLaptop ? 72 : 80;

  return (
    <View className="w-full self-center px-2 pb-8" style={{ maxWidth: 420 }}>
      <View className="flex-row flex-wrap justify-between gap-y-8">
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            onPress={() => onPress(digit)}
            className="w-[30%] items-center justify-center"
            activeOpacity={0.5}
          >
            <View className="rounded-full bg-white/10 items-center justify-center border border-white/5" style={{ width: keySize, height: keySize }}>
              <Text className="text-white font-medium" style={{ fontSize: isLaptop ? 28 : 30 }}>{digit}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Bottom Row */}
        <View className="w-[30%] items-center justify-center">
            {biometricAvailable && (
            <TouchableOpacity onPress={onBiometric} className="items-center justify-center" style={{ width: keySize, height: keySize }} activeOpacity={0.5}>
                    <Ionicons name="finger-print" size={36} color="#fff" />
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity
          onPress={() => onPress('0')}
          className="w-[30%] items-center justify-center"
          activeOpacity={0.5}
        >
          <View className="rounded-full bg-white/10 items-center justify-center border border-white/5" style={{ width: keySize, height: keySize }}>
            <Text className="text-white font-medium" style={{ fontSize: isLaptop ? 28 : 30 }}>0</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          className="w-[30%] items-center justify-center"
          activeOpacity={0.5}
        >
          <View className="items-center justify-center" style={{ width: keySize, height: keySize }}>
                <Delete size={32} color="#fff" />
            </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
