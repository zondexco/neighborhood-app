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
        width: '33.33%',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
        marginVertical: isLaptop ? 12 : 16,
      })}
    >
      <View
        style={{
          width: keySize,
          height: keySize,
          borderRadius: keySize / 2,
          backgroundColor: 'rgba(255,255,255,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: isLaptop ? 28 : 32 }}>{digit}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="w-full self-center px-4 pb-8" style={{ maxWidth: 480 }}>
      <View className="flex-row flex-wrap justify-center">
        {digits.map(renderKey)}

        {/* Bottom Row */}
        <View style={{ width: '33.33%', alignItems: 'center', justifyContent: 'center', marginVertical: isLaptop ? 12 : 16 }}>
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
              <Ionicons name="finger-print" size={38} color="#fff" />
            </Pressable>
          )}
        </View>

        {renderKey('0')}

        <View style={{ width: '33.33%', alignItems: 'center', justifyContent: 'center', marginVertical: isLaptop ? 12 : 16 }}>
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => ({
              width: keySize,
              height: keySize,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Delete size={34} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
