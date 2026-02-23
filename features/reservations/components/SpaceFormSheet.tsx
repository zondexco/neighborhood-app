import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Switch } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { createSpace, updateSpace } from '../api';
import type { Space } from '../types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  space: Space | null; // null = create mode
  onSaved: () => void;
}

const SpaceFormSheet = forwardRef<BottomSheet, Props>(({ space, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['60%'], []);
  const { bottom: safeBottom } = useSafeAreaInsets();
  const isEditing = space !== null;
  const { isDark, iconPrimary, activityColor, bgCard, sheetHandle, placeholderText } = useThemeColors();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costoHora, setCostoHora] = useState('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
  }, []);

  useEffect(() => {
    if (space) {
      setNombre(space.nombre);
      setDescripcion(space.descripcion ?? '');
      setCostoHora(space.costo_hora?.toString() ?? '');
      setActivo(space.estado === 'activo');
    } else {
      setNombre('');
      setDescripcion('');
      setCostoHora('');
      setActivo(true);
    }
    setError(null);
  }, [space]);

  const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

  const handleSubmit = useCallback(async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const costo = costoHora ? parseFloat(costoHora) : undefined;
      const estado = activo ? 'activo' : 'inactivo';

      if (isEditing && space) {
        await updateSpace(space.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          costo_hora: costo,
          estado,
        });
      } else {
        await createSpace({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          costo_hora: costo,
          estado,
        });
      }
      close();
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSubmitting(false);
    }
  }, [nombre, descripcion, costoHora, activo, isEditing, space, onSaved, ref]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

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
      style={sheetOpen ? undefined : { zIndex: -1 }}
      onChange={handleSheetChange}
      containerStyle={sheetOpen ? undefined : { pointerEvents: 'none' as const }}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(safeBottom, 20) + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-neutral-950 dark:text-white text-lg font-bold">
            {isEditing ? 'Editar Espacio' : 'Nuevo Espacio'}
          </Text>
          <Pressable
            onPress={close}
            className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
          >
            <X color={iconPrimary} size={20} />
          </Pressable>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">Nombre *</Text>
            <BottomSheetTextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Salón Social"
              placeholderTextColor={isDark ? '#666' : '#a3a3a3'}
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: isDark ? '#fff' : '#0a0a0a',
                fontSize: 15,
              }}
            />
          </View>

          <View>
            <Text className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">Descripción</Text>
            <BottomSheetTextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción del espacio..."
              placeholderTextColor={isDark ? '#666' : '#a3a3a3'}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: isDark ? '#fff' : '#0a0a0a',
                fontSize: 15,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <View>
            <Text className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">Costo por hora ($)</Text>
            <BottomSheetTextInput
              value={costoHora}
              onChangeText={setCostoHora}
              placeholder="0"
              placeholderTextColor={isDark ? '#666' : '#a3a3a3'}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: isDark ? '#fff' : '#0a0a0a',
                fontSize: 15,
              }}
            />
          </View>

          <View className="flex-row items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3">
            <Text className="text-neutral-950 dark:text-white font-medium">Activo</Text>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: isDark ? '#333' : '#d4d4d4', true: '#3b82f6' }}
              thumbColor="white"
            />
          </View>

          {error && <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-2xl py-4 items-center mt-2 ${
              submitting ? 'bg-blue-600/50' : 'bg-blue-600'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color={activityColor} />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Crear espacio'}
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

SpaceFormSheet.displayName = 'SpaceFormSheet';
export default SpaceFormSheet;
