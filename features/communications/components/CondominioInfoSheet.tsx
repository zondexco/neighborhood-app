import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Building2, MapPin, Phone, Mail, FileText, User } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { fetchCondominioPublic } from '../api';
import type { Condominio } from '@/features/admin/types';

interface CondominioFull extends Condominio {
  nit?: string;
  representante_legal?: string;
  logo_url?: string;
}

const CondominioInfoSheet = forwardRef<BottomSheet>((_, ref) => {
  const snapPoints = useMemo(() => ['60%'], []);
  const { isDark, bgCard, sheetHandle, activityColor, iconMuted } = useThemeColors();

  const [condominio, setCondominio] = useState<CondominioFull | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCondominioPublic();
      setCondominio(data as CondominioFull);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  const rows = condominio
    ? [
        { icon: Building2, label: 'Nombre', value: condominio.nombre },
        { icon: MapPin, label: 'Dirección', value: condominio.direccion },
        { icon: MapPin, label: 'Ciudad', value: condominio.ciudad },
        condominio.telefono ? { icon: Phone, label: 'Teléfono', value: condominio.telefono } : null,
        condominio.email ? { icon: Mail, label: 'Email', value: condominio.email } : null,
        condominio.nit ? { icon: FileText, label: 'NIT', value: condominio.nit } : null,
        condominio.representante_legal
          ? { icon: User, label: 'Representante Legal', value: condominio.representante_legal }
          : null,
      ].filter(Boolean) as { icon: any; label: string; value: string }[]
    : [];

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: bgCard }}
      handleIndicatorStyle={{ backgroundColor: sheetHandle }}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-neutral-950 dark:text-white text-xl font-bold mb-1">
          Información del Conjunto
        </Text>
        <Text className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
          Datos generales de tu conjunto residencial
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={activityColor} />
          </View>
        ) : (
          <View className="gap-4">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <View key={row.label} className="flex-row items-start gap-3">
                  <View className="w-9 h-9 rounded-xl bg-blue-500/10 items-center justify-center mt-0.5">
                    <Icon color={iconMuted} size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
                      {row.label}
                    </Text>
                    <Text className="text-neutral-950 dark:text-white text-base font-medium">
                      {row.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

CondominioInfoSheet.displayName = 'CondominioInfoSheet';
export default CondominioInfoSheet;
