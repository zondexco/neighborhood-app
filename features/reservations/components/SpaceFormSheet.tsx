import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ActivityIndicator, Switch } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { createSpace, updateSpace } from '../api';
import type { Space } from '../types';

interface Props {
  space: Space | null; // null = create mode
  onSaved: () => void;
}

const SpaceFormSheet = forwardRef<BottomSheet, Props>(({ space, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['60%'], []);
  const isEditing = space !== null;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costoHora, setCostoHora] = useState('');
  const [activo, setActivo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#141414' }}
      handleIndicatorStyle={{ backgroundColor: '#555' }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-lg font-bold">
            {isEditing ? 'Editar Espacio' : 'Nuevo Espacio'}
          </Text>
          <Pressable
            onPress={close}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <X color="white" size={20} />
          </Pressable>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-neutral-400 text-sm mb-2">Nombre *</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Salón Social"
              placeholderTextColor="#666"
              className="bg-white/10 rounded-xl px-4 py-3.5 text-white"
            />
          </View>

          <View>
            <Text className="text-neutral-400 text-sm mb-2">Descripción</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción del espacio..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              className="bg-white/10 rounded-xl px-4 py-3.5 text-white"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          <View>
            <Text className="text-neutral-400 text-sm mb-2">Costo por hora ($)</Text>
            <TextInput
              value={costoHora}
              onChangeText={setCostoHora}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              className="bg-white/10 rounded-xl px-4 py-3.5 text-white"
            />
          </View>

          <View className="flex-row items-center justify-between bg-white/5 rounded-xl px-4 py-3">
            <Text className="text-white font-medium">Activo</Text>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: '#333', true: '#3b82f6' }}
              thumbColor="white"
            />
          </View>

          {error && <Text className="text-red-400 text-sm text-center">{error}</Text>}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`rounded-2xl py-4 items-center mt-2 ${
              submitting ? 'bg-blue-600/50' : 'bg-blue-600'
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Crear espacio'}
              </Text>
            )}
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

SpaceFormSheet.displayName = 'SpaceFormSheet';
export default SpaceFormSheet;
