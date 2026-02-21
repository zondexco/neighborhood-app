import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { updateCondominio } from '@/features/communications/api';
import type { Condominio } from '../types';

interface CondominioFull extends Condominio {
  nit?: string;
  representante_legal?: string;
}

interface Props {
  condominio: CondominioFull | null;
  onSaved: () => void;
}

const CondominioEditSheet = forwardRef<BottomSheet, Props>(({ condominio, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);
  const { isDark, bgCard, sheetHandle, iconPrimary, placeholderText, activityColor } =
    useThemeColors();

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nit, setNit] = useState('');
  const [representante, setRepresentante] = useState('');
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
  }, []);

  useEffect(() => {
    if (condominio) {
      setNombre(condominio.nombre ?? '');
      setDireccion(condominio.direccion ?? '');
      setCiudad(condominio.ciudad ?? '');
      setTelefono(condominio.telefono ?? '');
      setEmail(condominio.email ?? '');
      setNit(condominio.nit ?? '');
      setRepresentante(condominio.representante_legal ?? '');
    }
  }, [condominio]);

  const handleSave = useCallback(async () => {
    if (!nombre.trim() || !direccion.trim() || !ciudad.trim()) {
      Alert.alert('Error', 'Nombre, dirección y ciudad son requeridos.');
      return;
    }
    setSaving(true);
    try {
      await updateCondominio({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
        nit: nit.trim() || undefined,
        representante_legal: representante.trim() || undefined,
      });
      (ref as any)?.current?.close();
      onSaved();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la información.');
    } finally {
      setSaving(false);
    }
  }, [nombre, direccion, ciudad, telefono, email, nit, representante, ref, onSaved]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: isDark ? '#fff' : '#0a0a0a',
    fontSize: 15,
  };

  const fields = [
    { label: 'Nombre *', value: nombre, setter: setNombre, placeholder: 'Nombre del conjunto' },
    { label: 'Dirección *', value: direccion, setter: setDireccion, placeholder: 'Dirección' },
    { label: 'Ciudad *', value: ciudad, setter: setCiudad, placeholder: 'Ciudad' },
    { label: 'Teléfono', value: telefono, setter: setTelefono, placeholder: 'Teléfono', keyboard: 'phone-pad' as const },
    { label: 'Email', value: email, setter: setEmail, placeholder: 'Email', keyboard: 'email-address' as const },
    { label: 'NIT', value: nit, setter: setNit, placeholder: 'NIT' },
    { label: 'Representante Legal', value: representante, setter: setRepresentante, placeholder: 'Representante legal' },
  ];

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: bgCard }}
      handleIndicatorStyle={{ backgroundColor: sheetHandle }}
      onChange={handleSheetChange}
      containerStyle={sheetOpen ? undefined : { pointerEvents: 'none' as const }}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View className="flex-row items-center justify-between px-5 pb-3">
        <Text className="text-neutral-950 dark:text-white text-xl font-bold">
          Editar Conjunto
        </Text>
        <Pressable
          onPress={() => (ref as any)?.current?.close()}
          hitSlop={12}
        >
          <X color={iconPrimary} size={22} />
        </Pressable>
      </View>

      <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        {fields.map((field) => (
          <View key={field.label}>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
              {field.label}
            </Text>
            <BottomSheetTextInput
              style={inputStyle}
              value={field.value}
              onChangeText={field.setter}
              placeholder={field.placeholder}
              placeholderTextColor={placeholderText}
              keyboardType={field.keyboard ?? 'default'}
            />
          </View>
        ))}

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="bg-violet-600 rounded-xl py-4 items-center mt-2"
          style={({ pressed }) => ({ opacity: pressed || saving ? 0.7 : 1 })}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Guardar cambios</Text>
          )}
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

CondominioEditSheet.displayName = 'CondominioEditSheet';
export default CondominioEditSheet;
