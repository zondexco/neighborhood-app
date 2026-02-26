import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { createCondominio, updateCondominio, deleteCondominio } from '../api';
import type { DevCondominio, CreateCondominioPayload, UpdateCondominioPayload } from '../types';

interface Props {
  condominio: DevCondominio | null; // null = create mode
  onSaved: () => void;
}

const CondominioFormSheet = forwardRef<BottomSheet, Props>(({ condominio, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const isEditing = condominio !== null;
  const { isDark, iconPrimary, activityColor, bgCard, sheetHandle, placeholderText } =
    useThemeColors();

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nit, setNit] = useState('');
  const [representante, setRepresentante] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
  }, []);

  useEffect(() => {
    if (condominio) {
      setNombre(condominio.nombre);
      setDireccion(condominio.direccion);
      setCiudad(condominio.ciudad);
      setTelefono(condominio.telefono ?? '');
      setEmail(condominio.email ?? '');
      setNit(condominio.nit ?? '');
      setRepresentante(condominio.representante_legal ?? '');
    } else {
      setNombre('');
      setDireccion('');
      setCiudad('');
      setTelefono('');
      setEmail('');
      setNit('');
      setRepresentante('');
    }
    setError(null);
  }, [condominio]);

  const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

  const handleSubmit = useCallback(async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!direccion.trim()) {
      setError('La dirección es requerida');
      return;
    }
    if (!ciudad.trim()) {
      setError('La ciudad es requerida');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && condominio) {
        const payload: UpdateCondominioPayload = {
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          telefono: telefono.trim() || undefined,
          email: email.trim() || undefined,
          nit: nit.trim() || undefined,
          representante_legal: representante.trim() || undefined,
        };
        await updateCondominio(condominio.id, payload);
      } else {
        const payload: CreateCondominioPayload = {
          nombre: nombre.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          telefono: telefono.trim() || undefined,
          email: email.trim() || undefined,
          nit: nit.trim() || undefined,
          representante_legal: representante.trim() || undefined,
        };
        await createCondominio(payload);
      }
      close();
      onSaved();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo guardar el condominio');
    } finally {
      setSubmitting(false);
    }
  }, [nombre, direccion, ciudad, telefono, email, nit, representante, isEditing, condominio, onSaved, ref]);

  const handleDelete = useCallback(() => {
    if (!condominio) return;
    Alert.alert(
      'Eliminar condominio',
      `¿Eliminar "${condominio.nombre}"? Esta acción eliminará todos los datos asociados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteCondominio(condominio.id);
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
  }, [condominio, onSaved, ref]);

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
      enableDynamicSizing={true}
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
            {isEditing ? 'Editar condominio' : 'Nuevo condominio'}
          </Text>
          <Pressable
            onPress={close}
            className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
          >
            <X color={iconPrimary} size={20} />
          </Pressable>
        </View>

        <View className="gap-4">
          {/* Nombre */}
          <View>
            <Text className={labelClass}>Nombre *</Text>
            <BottomSheetTextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Conjunto Residencial Los Pinos"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Dirección */}
          <View>
            <Text className={labelClass}>Dirección *</Text>
            <BottomSheetTextInput
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Ej: Calle 123 #45-67"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Ciudad */}
          <View>
            <Text className={labelClass}>Ciudad *</Text>
            <BottomSheetTextInput
              value={ciudad}
              onChangeText={setCiudad}
              placeholder="Ej: Bogotá"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Teléfono */}
          <View>
            <Text className={labelClass}>Teléfono</Text>
            <BottomSheetTextInput
              value={telefono}
              onChangeText={setTelefono}
              placeholder="(opcional)"
              placeholderTextColor={placeholderText}
              keyboardType="phone-pad"
              style={inputStyle}
            />
          </View>

          {/* Email */}
          <View>
            <Text className={labelClass}>Email</Text>
            <BottomSheetTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="(opcional)"
              placeholderTextColor={placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
            />
          </View>

          {/* NIT */}
          <View>
            <Text className={labelClass}>NIT</Text>
            <BottomSheetTextInput
              value={nit}
              onChangeText={setNit}
              placeholder="(opcional)"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Representante Legal */}
          <View>
            <Text className={labelClass}>Representante legal</Text>
            <BottomSheetTextInput
              value={representante}
              onChangeText={setRepresentante}
              placeholder="(opcional)"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {error && (
            <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || deleting}
            className={`rounded-2xl py-4 items-center mt-2 ${submitting ? 'bg-cyan-600/50' : 'bg-cyan-600'}`}
          >
            {submitting ? (
              <ActivityIndicator color={activityColor} />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Crear condominio'}
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
                  Eliminar condominio
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

CondominioFormSheet.displayName = 'CondominioFormSheet';
export default CondominioFormSheet;
