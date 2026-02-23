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
import { createAdmin, updateAdmin, deleteAdmin } from '../api';
import type { CondominioAdmin, CreateAdminPayload, UpdateAdminPayload } from '../types';

interface Props {
  condominioId: string;
  admin: CondominioAdmin | null; // null = create mode
  onSaved: () => void;
}

const ESTADO_OPTIONS = [
  { value: 'activo', label: 'Activo', color: 'bg-emerald-600' },
  { value: 'suspendido', label: 'Suspendido', color: 'bg-yellow-600' },
  { value: 'inactivo', label: 'Inactivo', color: 'bg-neutral-500' },
] as const;

const AdminFormSheet = forwardRef<BottomSheet, Props>(
  ({ condominioId, admin, onSaved }, ref) => {
    const snapPoints = useMemo(() => ['75%'], []);
    const isEditing = admin !== null;
    const { isDark, iconPrimary, activityColor, bgCard, sheetHandle, placeholderText } =
      useThemeColors();

    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('activo');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pinResult, setPinResult] = useState<string | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
      if (index < 0) setPinResult(null);
    }, []);

    useEffect(() => {
      if (admin) {
        setNombres(admin.nombre ?? '');
        setApellidos(admin.apellido ?? '');
        setEmail(admin.email ?? '');
        setTelefono(admin.telefono ?? '');
        setEstado(admin.estado ?? 'activo');
      } else {
        setNombres('');
        setApellidos('');
        setEmail('');
        setTelefono('');
        setEstado('activo');
      }
      setError(null);
      setPinResult(null);
    }, [admin]);

    const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

    const handleSubmit = useCallback(async () => {
      if (!nombres.trim()) {
        setError('Los nombres son requeridos');
        return;
      }
      if (!apellidos.trim()) {
        setError('Los apellidos son requeridos');
        return;
      }
      if (!email.trim()) {
        setError('El email es requerido');
        return;
      }
      setSubmitting(true);
      setError(null);
      try {
        if (isEditing && admin) {
          const payload: UpdateAdminPayload = {
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            email: email.trim(),
            telefono: telefono.trim() || undefined,
            estado,
          };
          await updateAdmin(condominioId, admin.id, payload);
          close();
          onSaved();
        } else {
          const payload: CreateAdminPayload = {
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            email: email.trim(),
            telefono: telefono.trim() || undefined,
          };
          const result = await createAdmin(condominioId, payload);
          setPinResult(result.pin_temporal);
          onSaved();
        }
      } catch (e: any) {
        setError(e?.response?.data?.message ?? 'No se pudo guardar el administrador');
      } finally {
        setSubmitting(false);
      }
    }, [nombres, apellidos, email, telefono, estado, isEditing, admin, condominioId, onSaved, ref]);

    const handleDelete = useCallback(() => {
      if (!admin) return;
      Alert.alert(
        'Eliminar administrador',
        `¿Eliminar a "${admin.nombre} ${admin.apellido}"? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                await deleteAdmin(condominioId, admin.id);
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
    }, [admin, condominioId, onSaved, ref]);

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
              {isEditing ? 'Editar administrador' : 'Nuevo administrador'}
            </Text>
            <Pressable
              onPress={close}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
            >
              <X color={iconPrimary} size={20} />
            </Pressable>
          </View>

          {/* PIN result after creation */}
          {pinResult && (
            <View className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 mb-5 items-center gap-2">
              <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                Administrador creado
              </Text>
              <Text className="text-neutral-600 dark:text-neutral-300 text-sm text-center">
                PIN temporal (compártelo al administrador):
              </Text>
              <Text className="text-neutral-950 dark:text-white text-3xl font-mono font-bold tracking-widest">
                {pinResult}
              </Text>
              <Pressable
                onPress={close}
                className="bg-emerald-600 rounded-xl px-6 py-2.5 mt-2"
              >
                <Text className="text-white font-semibold">Cerrar</Text>
              </Pressable>
            </View>
          )}

          {!pinResult && (
            <View className="gap-4">
              {/* Nombres */}
              <View>
                <Text className={labelClass}>Nombres *</Text>
                <BottomSheetTextInput
                  value={nombres}
                  onChangeText={setNombres}
                  placeholder="Ej: Juan Carlos"
                  placeholderTextColor={placeholderText}
                  style={inputStyle}
                />
              </View>

              {/* Apellidos */}
              <View>
                <Text className={labelClass}>Apellidos *</Text>
                <BottomSheetTextInput
                  value={apellidos}
                  onChangeText={setApellidos}
                  placeholder="Ej: Rodríguez Pérez"
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
                  placeholder="admin@ejemplo.com"
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

              {/* Estado (solo en edición) */}
              {isEditing && (
                <View>
                  <Text className={labelClass}>Estado</Text>
                  <View className="flex-row gap-2">
                    {ESTADO_OPTIONS.map((opt) => {
                      const active = estado === opt.value;
                      return (
                        <Pressable
                          key={opt.value}
                          onPress={() => setEstado(opt.value)}
                          className={`flex-1 py-3 rounded-xl items-center ${
                            active ? opt.color : 'bg-black/5 dark:bg-white/10'
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              active ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {error && (
                <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>
              )}

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={submitting || deleting}
                className={`rounded-2xl py-4 items-center mt-2 ${
                  submitting ? 'bg-violet-600/50' : 'bg-violet-600'
                }`}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    {isEditing ? 'Guardar cambios' : 'Crear administrador'}
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
                      Eliminar administrador
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

AdminFormSheet.displayName = 'AdminFormSheet';
export default AdminFormSheet;
