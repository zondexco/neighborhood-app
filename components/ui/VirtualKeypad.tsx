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

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ 
  onPress, 
  onDelete, 
  onBiometric, 
  biometricAvailable 
}) => {
  const { width } = useWindowDimensions();
  const isLaptop = width >= Breakpoints.laptop;
  const keySize = isLaptop ? 72 : 80;

  const renderKey = (digit: string) => (
    <Pressable
      key={digit}
      onPress={() => onPress(digit)}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: keySize,
          height: keySize,
          borderRadius: keySize / 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.18)',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: isLaptop ? 30 : 34 }}>{digit}</Text>
      </View>
    </Pressable>
  );

  return (
    <View className="w-full self-center px-6 pb-12" style={{ maxWidth: 480 }}>
      {/* Grid structure using rows to force 3-column layout */}
      <View className="gap-y-10">
        {/* Row 1: 1, 2, 3 */}
        <View className="flex-row items-center justify-between">
          {['1', '2', '3'].map(renderKey)}
        </View>

        {/* Row 2: 4, 5, 6 */}
        <View className="flex-row items-center justify-between">
          {['4', '5', '6'].map(renderKey)}
        </View>

        {/* Row 3: 7, 8, 9 */}
        <View className="flex-row items-center justify-between">
          {['7', '8', '9'].map(renderKey)}
        </View>

        {/* Row 4: Biometry, 0, Backspace */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 items-center justify-center">
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
                <Ionicons name="finger-print" size={40} color="#fff" />
              </Pressable>
            )}
          </View>

          {renderKey('0')}

          <View className="flex-1 items-center justify-center">
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
              <Delete size={38} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};
