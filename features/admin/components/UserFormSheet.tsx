import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { X, ChevronDown, Building2, Shield } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { createAdminUser, updateAdminUser, deleteAdminUser, fetchAdminApartments } from '../api';
import type { AdminUser, AdminApartment, CreateUserPayload, UpdateUserPayload } from '../types';

interface Props {
  user: AdminUser | null; // null = create mode
  callerRole: string | null;
  callerUserId: string | null;
  onSaved: () => void;
}

const ALL_ROL_OPTIONS = [
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

const UserFormSheet = forwardRef<BottomSheet, Props>(({ user, callerRole, callerUserId, onSaved }, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const isEditing = user !== null;
  const isDev = callerRole === 'dev';
  const isTargetProtected = isEditing && (user.rol === 'administrador' || user.rol === 'admin' || user.rol === 'dev');
  const canEdit = isDev || !isTargetProtected;
  const canDelete = canEdit && !(isEditing && user.id === callerUserId);
  const ROL_OPTIONS = isDev ? ALL_ROL_OPTIONS : ALL_ROL_OPTIONS.filter((o) => o.value !== 'administrador');
  const { isDark, iconPrimary, iconMuted, activityColor, bgCard, sheetHandle, placeholderText } =
    useThemeColors();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('residente');
  const [estado, setEstado] = useState('activo');
  const [apartamentoId, setApartamentoId] = useState<string | null>(null);
  const [showRolPicker, setShowRolPicker] = useState(false);
  const [showEstadoPicker, setShowEstadoPicker] = useState(false);
  const [showApartmentPicker, setShowApartmentPicker] = useState(false);
  const [apartments, setApartments] = useState<AdminApartment[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
    if (index >= 0 && apartments.length === 0) {
      loadApartments();
    }
  }, [apartments.length]);

  const loadApartments = useCallback(async () => {
    setLoadingApts(true);
    try {
      const res = await fetchAdminApartments();
      setApartments(res.data ?? []);
    } catch {
      // silent
    } finally {
      setLoadingApts(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setApellido(user.apellido);
      setEmail(user.email);
      setTelefono(user.telefono ?? '');
      setRol(user.rol);
      setEstado(user.estado);
      setApartamentoId(user.apartamento_id ?? null);
    } else {
      setNombre('');
      setApellido('');
      setEmail('');
      setTelefono('');
      setRol('residente');
      setEstado('activo');
      setApartamentoId(null);
    }
    setError(null);
    setShowRolPicker(false);
    setShowEstadoPicker(false);
    setShowApartmentPicker(false);
  }, [user]);

  const selectedApt = useMemo(
    () => apartments.find((a) => a.id === apartamentoId),
    [apartments, apartamentoId],
  );

  const aptLabel = selectedApt
    ? `${selectedApt.numero}${selectedApt.torre ? ` - Torre ${selectedApt.torre}` : ''}${selectedApt.bloque ? ` - ${selectedApt.bloque}` : ''}`
    : null;

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
          apartamento_id: apartamentoId,
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
          apartamento_id: apartamentoId ?? undefined,
        };
        const result = await createAdminUser(payload);
        close();
        onSaved();
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
  }, [nombre, apellido, email, telefono, rol, estado, apartamentoId, isEditing, user, onSaved, ref]);

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

  const closeAllPickers = () => {
    setShowRolPicker(false);
    setShowEstadoPicker(false);
    setShowApartmentPicker(false);
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: isDark ? '#fff' : '#0a0a0a',
    fontSize: 15,
  };
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
      onChange={handleSheetChange}
      containerStyle={sheetOpen ? undefined : { pointerEvents: 'none' as const }}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
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

        {/* Protected user banner */}
        {isEditing && !canEdit && (
          <View className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2">
            <Shield color="#f59e0b" size={16} />
            <Text className="text-amber-700 dark:text-amber-400 text-sm flex-1">
              Este usuario tiene un rol protegido y no puede ser modificado.
            </Text>
          </View>
        )}

        {isEditing && canEdit && !canDelete && (
          <View className="bg-blue-500/15 border border-blue-500/30 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-2">
            <Shield color="#60a5fa" size={16} />
            <Text className="text-blue-700 dark:text-blue-400 text-sm flex-1">
              No puedes eliminarte a ti mismo.
            </Text>
          </View>
        )}

        <View className="gap-4" style={!canEdit ? { opacity: 0.5 } : undefined} pointerEvents={canEdit ? 'auto' : 'none'}>
          {/* Nombre */}
          <View>
            <Text className={labelClass}>Nombre *</Text>
            <BottomSheetTextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Apellido */}
          <View>
            <Text className={labelClass}>Apellido *</Text>
            <BottomSheetTextInput
              value={apellido}
              onChangeText={setApellido}
              placeholder="Apellido"
              placeholderTextColor={placeholderText}
              style={inputStyle}
            />
          </View>

          {/* Email */}
          <View>
            <Text className={labelClass}>Email *</Text>
            <BottomSheetTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={placeholderText}
              keyboardType="email-address"
              autoCapitalize="none"
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

          {/* Apartamento picker */}
          <View>
            <Text className={labelClass}>Apartamento</Text>
            <Pressable
              onPress={() => {
                closeAllPickers();
                setShowApartmentPicker(!showApartmentPicker);
              }}
              className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Building2 color={apartamentoId ? iconPrimary : iconMuted} size={16} />
                <Text
                  className={apartamentoId ? 'text-neutral-950 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}
                  numberOfLines={1}
                >
                  {aptLabel ?? 'Sin asignar'}
                </Text>
              </View>
              <ChevronDown color={iconMuted} size={18} />
            </Pressable>
            {showApartmentPicker && (
              <View className="mt-1 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10" style={{ maxHeight: 200 }}>
                {loadingApts ? (
                  <ActivityIndicator color={activityColor} style={{ padding: 16 }} />
                ) : (
                  <ScrollView nestedScrollEnabled>
                    {/* Option: sin asignar */}
                    <Pressable
                      onPress={() => { setApartamentoId(null); setShowApartmentPicker(false); }}
                      className={`px-4 py-3 border-b border-black/5 dark:border-white/5 ${!apartamentoId ? 'bg-violet-500/20' : ''}`}
                    >
                      <Text className={!apartamentoId ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-neutral-500 dark:text-neutral-400'}>
                        Sin asignar
                      </Text>
                    </Pressable>
                    {apartments
                      .filter((a) => a.estado === 'activo')
                      .map((apt) => {
                        const label = `${apt.numero}${apt.torre ? ` - Torre ${apt.torre}` : ''}${apt.bloque ? ` - ${apt.bloque}` : ''}`;
                        const isSelected = apartamentoId === apt.id;
                        return (
                          <Pressable
                            key={apt.id}
                            onPress={() => { setApartamentoId(apt.id); setShowApartmentPicker(false); }}
                            className={`px-4 py-3 border-b border-black/5 dark:border-white/5 ${isSelected ? 'bg-violet-500/20' : ''}`}
                          >
                            <Text className={isSelected ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-neutral-950 dark:text-white'}>
                              {label}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Rol picker */}
          <View>
            <Text className={labelClass}>Rol</Text>
            <Pressable
              onPress={() => { closeAllPickers(); setShowRolPicker(!showRolPicker); }}
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
              onPress={() => { closeAllPickers(); setShowEstadoPicker(!showEstadoPicker); }}
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

          {/* Delete (edit mode only, not self, not protected) */}
          {isEditing && canDelete && (
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
