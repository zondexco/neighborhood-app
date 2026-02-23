import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { createAdminApartment, updateAdminApartment, deleteAdminApartment } from '../api';
import type { AdminApartment, CreateApartmentPayload, UpdateApartmentPayload } from '../types';

interface Props {
  apartment: AdminApartment | null; // null = create mode
  onSaved: () => void;
}

const ApartmentFormSheet = forwardRef<BottomSheet, Props>(({ apartment, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['70%'], []);
  const isEditing = apartment !== null;
  const { isDark, iconPrimary, activityColor, bgCard, sheetHandle, placeholderText } =
    useThemeColors();

  const [numero, setNumero] = useState('');
  const [torre, setTorre] = useState('');
  const [bloque, setBloque] = useState('');
  const [piso, setPiso] = useState('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
  }, []);

  useEffect(() => {
    if (apartment) {
      setNumero(apartment.numero);
      setTorre(apartment.torre ?? '');
      setBloque(apartment.bloque ?? '');
      setPiso(apartment.piso?.toString() ?? '');
      setActivo(apartment.estado === 'activo');
    } else {
      setNumero('');
      setTorre('');
      setBloque('');
      setPiso('');
      setActivo(true);
    }
    setError(null);
  }, [apartment]);

  const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

  const handleSubmit = useCallback(async () => {
    if (!numero.trim()) {
      setError('El número de apartamento es requerido');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const estado = activo ? 'activo' : 'inactivo';
      const pisoNum = piso ? parseInt(piso, 10) : undefined;

      if (isEditing && apartment) {
        const payload: UpdateApartmentPayload = {
          numero: numero.trim(),
          torre: torre.trim() || undefined,
          bloque: bloque.trim() || undefined,
          piso: pisoNum,
          estado,
        };
        await updateAdminApartment(apartment.id, payload);
      } else {
        const payload: CreateApartmentPayload = {
          numero: numero.trim(),
          torre: torre.trim() || undefined,
          bloque: bloque.trim() || undefined,
          piso: pisoNum,
          estado,
        };
        await createAdminApartment(payload);
      }
      close();
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo guardar el apartamento');
    } finally {
      setSubmitting(false);
    }
  }, [numero, torre, bloque, piso, activo, isEditing, apartment, onSaved, ref]);

  const handleDelete = useCallback(() => {
    if (!apartment) return;
    Alert.alert(
      'Eliminar apartamento',
      `¿Eliminar el apartamento ${apartment.numero}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAdminApartment(apartment.id);
              close();
              onSaved();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo eliminar');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [apartment, onSaved, ref]);

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

  const labelClass = 'text-neutral-600 dark:text-neutral-400 text-sm mb-2';

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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 mt-2">
          <Text className="text-neutral-950 dark:text-white text-lg font-bold">
            {isEditing ? 'Editar apartamento' : 'Nuevo apartamento'}
          </Text>
          <Pressable
            onPress={close}
            className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
          >
            <X color={iconPrimary} size={20} />
          </Pressable>
        </View>

        <View className="gap-4">
          {/* Número */}
          <View>
            <Text className={labelClass}>Número *</Text>
            <BottomSheetTextInput
              value={numero}
              onChangeText={setNumero}
              placeholder="Ej: 301"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Torre */}
          <View>
            <Text className={labelClass}>Torre</Text>
            <BottomSheetTextInput
              value={torre}
              onChangeText={setTorre}
              placeholder="Ej: A (opcional)"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Bloque */}
          <View>
            <Text className={labelClass}>Bloque</Text>
            <BottomSheetTextInput
              value={bloque}
              onChangeText={setBloque}
              placeholder="Ej: Norte (opcional)"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Piso */}
          <View>
            <Text className={labelClass}>Piso</Text>
            <BottomSheetTextInput
              value={piso}
              onChangeText={setPiso}
              placeholder="Ej: 3 (opcional)"
              placeholderTextColor={placeholderText}
              keyboardType="number-pad"
              style={inputStyle}
            />
          </View>

          {/* Activo toggle */}
          <View className="flex-row items-center justify-between bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3">
            <Text className="text-neutral-950 dark:text-white font-medium">Activo</Text>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: isDark ? '#333' : '#d4d4d4', true: '#10b981' }}
              thumbColor="white"
            />
          </View>

          {error && (
            <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || deleting}
            className={`rounded-2xl py-4 items-center mt-2 ${submitting ? 'bg-emerald-600/50' : 'bg-emerald-600'}`}
          >
            {submitting ? (
              <ActivityIndicator color={activityColor} />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Crear apartamento'}
              </Text>
            )}
          </Pressable>

          {/* Delete (edit mode only) */}
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              disabled={submitting || deleting}
              className="rounded-2xl py-4 items-center border border-red-500/30 bg-red-500/10"
            >
              {deleting ? (
                <ActivityIndicator color="#f87171" />
              ) : (
                <Text className="text-red-600 dark:text-red-400 font-semibold">
                  Eliminar apartamento
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ApartmentFormSheet.displayName = 'ApartmentFormSheet';
export default ApartmentFormSheet;
