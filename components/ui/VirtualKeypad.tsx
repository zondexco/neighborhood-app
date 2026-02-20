import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Delete } from 'lucide-react-native';
import { Breakpoints } from '@/constants/theme';
import { useThemeColors } from '@/hooks/useThemeColors';

interface VirtualKeypadProps {
  onPress: (digit: string) => void;
  onDelete: () => void;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({ onPress, onDelete }) => {
  const { width } = useWindowDimensions();
  const isLaptop = width >= Breakpoints.laptop;
  const keySize = isLaptop ? 68 : 74;

  const { isDark, iconPrimary } = useThemeColors();

  const keyBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const keyBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)';
  const keyPressedBg = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';

  const renderKey = (digit: string) => (
    <Pressable
      key={digit}
      onPress={() => onPress(digit)}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {({ pressed }) => (
        <View
          style={{
            width: keySize,
            height: keySize,
            borderRadius: keySize / 2,
            backgroundColor: pressed ? keyPressedBg : keyBg,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: keyBorder,
          }}
        >
          <Text
            style={{
              color: iconPrimary,
              fontWeight: '400',
              fontSize: isLaptop ? 26 : 28,
              letterSpacing: 0,
            }}
          >
            {digit}
          </Text>
        </View>
      )}
    </Pressable>
  );

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <View style={{ width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 8, maxWidth: 480 }}>
      <View style={{ gap: 12 }}>
        {rows.map((row) => (
          <View key={row.join()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {row.map(renderKey)}
          </View>
        ))}

        {/* Bottom row: [empty] [0] [delete] */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Empty — keeps grid balance */}
          <View style={{ flex: 1 }} />

          {renderKey('0')}

          {/* Delete — styled as a proper key */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Pressable onPress={onDelete} style={{ alignItems: 'center', justifyContent: 'center' }}>
              {({ pressed }) => (
                <View
                  style={{
                    width: keySize,
                    height: keySize,
                    borderRadius: keySize / 2,
                    backgroundColor: pressed ? keyPressedBg : keyBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: keyBorder,
                  }}
                >
                  <Delete size={22} color={iconPrimary} strokeWidth={1.75} />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};
