import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { X, ChevronDown } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { createAdminUser, updateAdminUser, deleteAdminUser } from '../api';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '../types';

interface Props {
  user: AdminUser | null; // null = create mode
  onSaved: () => void;
}

const ROL_OPTIONS = [
  { value: 'residente', label: 'Residente' },
  { value: 'empleado', label: 'Empleado' },
  { value: 'administrador', label: 'Administrador' },
];

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'suspendido', label: 'Suspendido' },
];

const UserFormSheet = forwardRef<BottomSheet, Props>(({ user, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['85%'], []);
  const isEditing = user !== null;
  const { isDark, iconPrimary, iconMuted, activityColor, bgCard, sheetHandle, placeholderText } =
    useThemeColors();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('residente');
  const [estado, setEstado] = useState('activo');
  const [showRolPicker, setShowRolPicker] = useState(false);
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setApellido(user.apellido);
      setEmail(user.email);
      setTelefono(user.telefono ?? '');
      setRol(user.rol);
      setEstado(user.estado);
    } else {
      setNombre('');
      setApellido('');
      setEmail('');
      setTelefono('');
      setRol('residente');
      setEstado('activo');
    }
    setError(null);
    setShowRolPicker(false);
    setShowEstadoPicker(false);
  }, [user]);

  const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

  const handleSubmit = useCallback(async () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError('Nombre, apellido y email son requeridos');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && user) {
        const payload: UpdateUserPayload = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          rol,
          estado,
        };
        await updateAdminUser(user.id, payload);
        close();
        onSaved();
      } else {
        const payload: CreateUserPayload = {
          nombres: nombre.trim(),
          apellidos: apellido.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          rol,
          estado,
        };
        const result = await createAdminUser(payload);
        close();
        onSaved();
        // Show PIN to admin after closing sheet
        setTimeout(() => {
          Alert.alert(
            'Usuario creado',
            `PIN temporal: ${result.pin_temporal}\n\nComparte este PIN con el usuario para que pueda iniciar sesión.`,
            [{ text: 'Entendido' }],
          );
        }, 400);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'No se pudo guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  }, [nombre, apellido, email, telefono, rol, estado, isEditing, user, onSaved, ref]);

  const handleDelete = useCallback(() => {
    if (!user) return;
    Alert.alert(
      'Eliminar usuario',
      `¿Eliminar a ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAdminUser(user.id);
              close();
              onSaved();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'No se pudo eliminar el usuario');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [user, onSaved, ref]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

  const inputClass =
    'bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3.5 text-neutral-950 dark:text-white';
  const labelClass = 'text-neutral-600 dark:text-neutral-400 text-sm mb-2';

  const rolLabel = ROL_OPTIONS.find((o) => o.value === rol)?.label ?? rol;
  const estadoLabel = ESTADO_OPTIONS.find((o) => o.value === estado)?.label ?? estado;

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
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 mt-2">
          <Text className="text-neutral-950 dark:text-white text-lg font-bold">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
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
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor={placeholderText}
              className={inputClass}
            />
          </View>

          {/* Apellido */}
          <View>
            <Text className={labelClass}>Apellido *</Text>
            <TextInput
              value={apellido}
              onChangeText={setApellido}
              placeholder="Apellido"
              placeholderTextColor={placeholderText}
              className={inputClass}
            />
          </View>

          {/* Email */}
          <View>
            <Text className={labelClass}>Email *</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
              className={inputClass}
            />
          </View>

          {/* Teléfono */}
          <View>
            <Text className={labelClass}>Teléfono</Text>
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              placeholder="(opcional)"
              placeholderTextColor={placeholderText}
              keyboardType="phone-pad"
              className={inputClass}
            />
          </View>

          {/* Rol picker */}
          <View>
            <Text className={labelClass}>Rol</Text>
            <Pressable
              onPress={() => { setShowRolPicker(!showRolPicker); setShowEstadoPicker(false); }}
              className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text className="text-neutral-950 dark:text-white">{rolLabel}</Text>
              <ChevronDown color={iconMuted} size={18} />
            </Pressable>
            {showRolPicker && (
              <View className="mt-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                {ROL_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => { setRol(opt.value); setShowRolPicker(false); }}
                    className={`px-4 py-3 ${rol === opt.value ? 'bg-violet-500/20' : ''}`}
                  >
                    <Text
                      className={`${rol === opt.value ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-neutral-950 dark:text-white'}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Estado picker */}
          <View>
            <Text className={labelClass}>Estado</Text>
            <Pressable
              onPress={() => { setShowEstadoPicker(!showEstadoPicker); setShowRolPicker(false); }}
              className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text className="text-neutral-950 dark:text-white">{estadoLabel}</Text>
              <ChevronDown color={iconMuted} size={18} />
            </Pressable>
            {showEstadoPicker && (
              <View className="mt-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                {ESTADO_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => { setEstado(opt.value); setShowEstadoPicker(false); }}
                    className={`px-4 py-3 ${estado === opt.value ? 'bg-violet-500/20' : ''}`}
                  >
                    <Text
                      className={`${estado === opt.value ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-neutral-950 dark:text-white'}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {error && (
            <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || deleting}
            className={`rounded-2xl py-4 items-center mt-2 ${submitting ? 'bg-violet-600/50' : 'bg-violet-600'}`}
          >
            {submitting ? (
              <ActivityIndicator color={activityColor} />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Crear usuario'}
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
                  Eliminar usuario
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

UserFormSheet.displayName = 'UserFormSheet';
export default UserFormSheet;
