import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
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

  const renderKey = (digit: string) => (
    <Pressable
      key={digit}
      onPress={() => onPress(digit)}
      style={({ pressed }) => ({
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <View
        style={{
          width: keySize,
          height: keySize,
          borderRadius: keySize / 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '500', fontSize: isLaptop ? 28 : 30 }}>{digit}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="w-full self-center px-2 pb-8" style={{ maxWidth: 420 }}>
      <View className="flex-row flex-wrap justify-between gap-y-8">
        {digits.map(renderKey)}

        {/* Bottom Row */}
        <View style={{ width: '30%', alignItems: 'center', justifyContent: 'center' }}>
          {biometricAvailable && (
            <Pressable
              onPress={onBiometric}
              style={({ pressed }) => ({
                width: keySize,
                height: keySize,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Ionicons name="finger-print" size={36} color="#fff" />
            </Pressable>
          )}
        </View>

        {renderKey('0')}

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            width: '30%',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <View style={{ width: keySize, height: keySize, alignItems: 'center', justifyContent: 'center' }}>
            <Delete size={32} color="#fff" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};
