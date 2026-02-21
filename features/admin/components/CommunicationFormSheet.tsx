import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { X, ChevronDown, Trash2 } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  createAdminCommunication,
  updateAdminCommunication,
  deleteAdminCommunication,
} from '@/features/communications/api';
import type { Communication, CreateCommunicationPayload } from '@/features/communications/types';

interface Props {
  communication: Communication | null; // null = create mode
  onSaved: () => void;
}

const ICON_OPTIONS = [
  { value: 'megaphone', label: 'Megáfono' },
  { value: 'alert-triangle', label: 'Alerta' },
  { value: 'info', label: 'Información' },
  { value: 'calendar', label: 'Evento' },
  { value: 'wrench', label: 'Mantenimiento' },
  { value: 'shield', label: 'Seguridad' },
  { value: 'heart', label: 'Comunidad' },
  { value: 'zap', label: 'Urgente' },
];

const ROLE_OPTIONS = [
  { value: 'residente', label: 'Residentes' },
  { value: 'empleado', label: 'Empleados' },
  { value: 'administrador', label: 'Administradores' },
];

const CommunicationFormSheet = forwardRef<BottomSheet, Props>(
  ({ communication, onSaved }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);
    const isEditing = communication !== null;
    const { isDark, bgCard, sheetHandle, iconPrimary, iconMuted, placeholderText, activityColor } =
      useThemeColors();

    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [icono, setIcono] = useState('megaphone');
    const [permiteComentarios, setPermiteComentarios] = useState(false);
    const [publicado, setPublicado] = useState(true);
    const [programar, setProgramar] = useState(false);
    const [fechaProgramada, setFechaProgramada] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
    }, []);

    useEffect(() => {
      if (communication) {
        setTitulo(communication.titulo);
        setContenido(communication.contenido);
        setIcono(communication.icono || 'megaphone');
        setPermiteComentarios(communication.permite_comentarios);
        setPublicado(communication.publicado);
        setSelectedRoles(communication.roles_destino ?? []);
        if (communication.programado_para) {
          setProgramar(true);
          setFechaProgramada(new Date(communication.programado_para));
        } else {
          setProgramar(false);
        }
      } else {
        setTitulo('');
        setContenido('');
        setIcono('megaphone');
        setPermiteComentarios(false);
        setPublicado(true);
        setProgramar(false);
        setFechaProgramada(new Date());
        setSelectedRoles([]);
      }
    }, [communication]);

    const toggleRole = useCallback(
      (role: string) => {
        setSelectedRoles((prev) =>
          prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
        );
      },
      [],
    );

    const handleSave = useCallback(async () => {
      if (!titulo.trim() || !contenido.trim()) {
        Alert.alert('Error', 'Título y contenido son requeridos.');
        return;
      }

      setSaving(true);
      try {
        const payload: CreateCommunicationPayload = {
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          icono,
          permite_comentarios: permiteComentarios,
          publicado,
          programado_para: programar ? fechaProgramada.toISOString() : null,
          roles_destino: selectedRoles.length > 0 ? selectedRoles : undefined,
        };

        if (isEditing) {
          await updateAdminCommunication(communication!.id, payload);
        } else {
          await createAdminCommunication(payload);
        }

        (ref as any)?.current?.close();
        onSaved();
      } catch {
        Alert.alert('Error', 'No se pudo guardar el comunicado.');
      } finally {
        setSaving(false);
      }
    }, [
      titulo, contenido, icono, permiteComentarios, publicado,
      programar, fechaProgramada, selectedRoles, isEditing, communication, ref, onSaved,
    ]);

    const handleDelete = useCallback(() => {
      if (!communication) return;
      Alert.alert('Eliminar comunicado', '¿Estás seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminCommunication(communication.id);
              (ref as any)?.current?.close();
              onSaved();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar.');
            }
          },
        },
      ]);
    }, [communication, ref, onSaved]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
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

    const formatDate = (d: Date) =>
      d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatTime = (d: Date) =>
      d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

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
            {isEditing ? 'Editar Comunicado' : 'Nuevo Comunicado'}
          </Text>
          <Pressable onPress={() => (ref as any)?.current?.close()} hitSlop={12}>
            <X color={iconPrimary} size={22} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <View>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Título *
            </Text>
            <BottomSheetTextInput
              style={inputStyle}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Título del comunicado"
              placeholderTextColor={placeholderText}
            />
          </View>

          {/* Contenido */}
          <View>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Contenido *
            </Text>
            <BottomSheetTextInput
              style={{ ...inputStyle, minHeight: 120, textAlignVertical: 'top' }}
              value={contenido}
              onChangeText={setContenido}
              placeholder="Escribe el contenido del comunicado..."
              placeholderTextColor={placeholderText}
              multiline
            />
          </View>

          {/* Icono */}
          <View>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Icono
            </Text>
            <Pressable
              onPress={() => setShowIconPicker(!showIconPicker)}
              className="bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <Text className="text-neutral-950 dark:text-white text-base">
                {ICON_OPTIONS.find((o) => o.value === icono)?.label ?? icono}
              </Text>
              <ChevronDown color={iconMuted} size={18} />
            </Pressable>
            {showIconPicker && (
              <View className="bg-black/5 dark:bg-white/5 rounded-xl mt-2 overflow-hidden">
                {ICON_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      setIcono(opt.value);
                      setShowIconPicker(false);
                    }}
                    className={`px-4 py-3 border-b border-black/5 dark:border-white/5 ${
                      opt.value === icono ? 'bg-violet-500/10' : ''
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        opt.value === icono
                          ? 'text-violet-600 dark:text-violet-400 font-semibold'
                          : 'text-neutral-950 dark:text-white'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Roles destino */}
          <View>
            <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Visible para (vacío = todos)
            </Text>
            <View className="flex-row gap-2 flex-wrap">
              {ROLE_OPTIONS.map((role) => {
                const selected = selectedRoles.includes(role.value);
                return (
                  <Pressable
                    key={role.value}
                    onPress={() => toggleRole(role.value)}
                    className={`px-4 py-2 rounded-full border ${
                      selected
                        ? 'bg-violet-600 border-violet-600'
                        : 'bg-transparent border-black/10 dark:border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-white' : 'text-neutral-950 dark:text-white'
                      }`}
                    >
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Switches */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-950 dark:text-white text-base">
                Permitir comentarios
              </Text>
              <Switch
                value={permiteComentarios}
                onValueChange={setPermiteComentarios}
                trackColor={{ false: isDark ? '#333' : '#d4d4d4', true: '#7c3aed' }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-950 dark:text-white text-base">Publicado</Text>
              <Switch
                value={publicado}
                onValueChange={setPublicado}
                trackColor={{ false: isDark ? '#333' : '#d4d4d4', true: '#7c3aed' }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-neutral-950 dark:text-white text-base">
                Programar publicación
              </Text>
              <Switch
                value={programar}
                onValueChange={setProgramar}
                trackColor={{ false: isDark ? '#333' : '#d4d4d4', true: '#7c3aed' }}
              />
            </View>
          </View>

          {/* Date/Time picker */}
          {programar && (
            <View className="gap-3">
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3"
              >
                <Text className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">Fecha</Text>
                <Text className="text-neutral-950 dark:text-white text-base">
                  {formatDate(fechaProgramada)}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3"
              >
                <Text className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">Hora</Text>
                <Text className="text-neutral-950 dark:text-white text-base">
                  {formatTime(fechaProgramada)}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={fechaProgramada}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) setFechaProgramada(date);
                  }}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={fechaProgramada}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, date) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (date) setFechaProgramada(date);
                  }}
                />
              )}
            </View>
          )}

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="bg-violet-600 rounded-xl py-4 items-center mt-2"
            style={({ pressed }) => ({ opacity: pressed || saving ? 0.7 : 1 })}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                {isEditing ? 'Guardar cambios' : 'Publicar comunicado'}
              </Text>
            )}
          </Pressable>

          {/* Delete */}
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              className="border border-red-500/30 rounded-xl py-3 items-center flex-row justify-center gap-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Trash2 color="#ef4444" size={18} />
              <Text className="text-red-500 font-semibold text-base">Eliminar comunicado</Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

CommunicationFormSheet.displayName = 'CommunicationFormSheet';
export default CommunicationFormSheet;
