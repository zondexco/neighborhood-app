import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, Users, MapPin, ChevronLeft, X, Timer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidView } from '@/components/native/LiquidView';
import { fetchSpaces, createReservation } from '../api';
import type { Space, CreateReservationPayload } from '../types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  onCreated: () => void;
}

type Step = 'space' | 'datetime' | 'people' | 'confirm';

const DURATION_OPTIONS = [
  { label: '30 min', value: 0.5 },
  { label: '1 hora', value: 1 },
  { label: '1.5 horas', value: 1.5 },
  { label: '2 horas', value: 2 },
  { label: '3 horas', value: 3 },
  { label: '4 horas', value: 4 },
  { label: '6 horas', value: 6 },
  { label: '8 horas', value: 8 },
];

const CreateReservationSheet = forwardRef<BottomSheet, Props>(({ onCreated }, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const { bottom: safeBottom } = useSafeAreaInsets();
  const { isDark, iconPrimary, activityColor, bgCard, sheetHandle } = useThemeColors();

  // Form state
  const [step, setStep] = useState<Step>('space');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [durationHours, setDurationHours] = useState(2);
  const [people, setPeople] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Picker visibility: always visible on iOS/web, toggled on Android
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS !== 'android');
  const [showStartPicker, setShowStartPicker] = useState(Platform.OS !== 'android');

  const loadSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    try {
      const res = await fetchSpaces();
      setSpaces(res.data.filter((s) => s.estado === 'activo'));
    } catch {
      setSpaces([]);
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // Computed end time from start + duration
  const endTime = useMemo(() => {
    const end = new Date(startTime);
    end.setMinutes(end.getMinutes() + durationHours * 60);
    return end;
  }, [startTime, durationHours]);

  const estimatedCost = useMemo(() => {
    if (!selectedSpace?.costo_hora) return null;
    return selectedSpace.costo_hora * durationHours;
  }, [selectedSpace, durationHours]);

  const resetForm = useCallback(() => {
    setStep('space');
    setSelectedSpace(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDate(tomorrow);
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    setStartTime(start);
    setDurationHours(2);
    setPeople('');
    setError(null);
    setShowDatePicker(Platform.OS !== 'android');
    setShowStartPicker(Platform.OS !== 'android');
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    setSheetOpen(index >= 0);
    if (index === -1) resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!selectedSpace) return;
    const peopleNum = parseInt(people, 10);
    if (!peopleNum || peopleNum <= 0) {
      setError('Ingresa un número válido de personas');
      return;
    }

    const fechaInicio = new Date(date);
    fechaInicio.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
    const fechaFin = new Date(date);
    fechaFin.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // Handle overnight (end time past midnight)
    if (fechaFin <= fechaInicio) {
      fechaFin.setDate(fechaFin.getDate() + 1);
    }

    const payload: CreateReservationPayload = {
      espacio_id: selectedSpace.id,
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
      personas_esperadas: peopleNum,
    };

    setSubmitting(true);
    setError(null);
    try {
      await createReservation(payload);
      try { (ref as React.RefObject<BottomSheet>)?.current?.close(); } catch { /* ignore sheet close errors on web */ }
      onCreated();
    } catch (e: any) {
      const rawMsg = e?.response?.data?.message;
      setError(typeof rawMsg === 'string' ? rawMsg : 'No se pudo crear la reserva');
    } finally {
      setSubmitting(false);
    }
  }, [selectedSpace, people, date, startTime, endTime, ref, onCreated, resetForm]);

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) setDate(selected);
  };

  const handleStartChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (selected) setStartTime(selected);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const formatDate2 = (d: Date) =>
    d.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short' });

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${hours * 60} min`;
    if (hours === 1) return '1 hora';
    if (hours % 1 === 0) return `${hours} horas`;
    const h = Math.floor(hours);
    const m = (hours % 1) * 60;
    return `${h}h ${m}min`;
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    [],
  );

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
      containerStyle={sheetOpen
        ? { backgroundColor: 'transparent' }
        : { pointerEvents: 'none' as const, backgroundColor: 'transparent' }
      }
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(safeBottom, 20) + 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          {step !== 'space' ? (
            <Pressable
              onPress={() => {
                if (step === 'datetime') setStep('space');
                else if (step === 'people') setStep('datetime');
                else if (step === 'confirm') setStep('people');
              }}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
            >
              <ChevronLeft color={iconPrimary} size={20} />
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
          <Text className="text-neutral-950 dark:text-white text-lg font-bold flex-1 text-center">Nueva Reserva</Text>
          <Pressable
            onPress={() => {
              resetForm();
              (ref as React.RefObject<BottomSheet>)?.current?.close();
            }}
            className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
          >
            <X color={iconPrimary} size={20} />
          </Pressable>
        </View>

        {/* Step indicators */}
        <View className="flex-row gap-2 mb-6">
          {(['space', 'datetime', 'people', 'confirm'] as Step[]).map((s, i) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${
                i <= ['space', 'datetime', 'people', 'confirm'].indexOf(step)
                  ? 'bg-blue-500'
                  : 'bg-black/10 dark:bg-white/10'
              }`}
            />
          ))}
        </View>

        {/* Step: Select Space */}
        {step === 'space' && (
          <View>
            <View className="flex-row items-center gap-2 mb-4">
              <MapPin color="#60a5fa" size={18} />
              <Text className="text-neutral-950 dark:text-white font-semibold text-base">Selecciona un espacio</Text>
            </View>
            {loadingSpaces ? (
              <ActivityIndicator color={activityColor} className="mt-8" />
            ) : spaces.length === 0 ? (
              <Text className="text-neutral-600 dark:text-neutral-400 text-center mt-8">
                No hay espacios disponibles
              </Text>
            ) : (
              <View className="gap-3">
                {spaces.map((space) => (
                  <Pressable
                    key={space.id}
                    onPress={() => {
                      setSelectedSpace(space);
                      setStep('datetime');
                    }}
                  >
                    <LiquidView
                      intensity={15}
                      tint="dark"
                      className={`p-4 rounded-2xl border ${
                        selectedSpace?.id === space.id ? 'border-blue-500/50' : 'border-black/5 dark:border-white/10'
                      }`}
                    >
                      <Text className="text-neutral-950 dark:text-white font-semibold text-base">{space.nombre}</Text>
                      {space.descripcion && (
                        <Text className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">{space.descripcion}</Text>
                      )}
                      {space.costo_hora != null && (
                        <Text className="text-blue-600 dark:text-blue-400 text-sm mt-2 font-medium">
                          ${space.costo_hora.toLocaleString()}/hora
                        </Text>
                      )}
                    </LiquidView>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && (
          <View className="gap-6">
            {/* Date */}
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <Calendar color="#60a5fa" size={18} />
                <Text className="text-neutral-950 dark:text-white font-semibold">Fecha</Text>
              </View>
              {Platform.OS === 'web' ? (
                <TextInput
                  value={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
                  onChangeText={(val) => {
                    const d = new Date(val + 'T00:00:00');
                    if (!isNaN(d.getTime())) setDate(d);
                  }}
                  // @ts-ignore — web-only HTML prop
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  style={{ color: isDark ? '#fff' : '#0a0a0a', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 }}
                />
              ) : Platform.OS === 'android' && !showDatePicker ? (
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3"
                >
                  <Text className="text-neutral-950 dark:text-white text-base">{formatDate2(date)}</Text>
                </Pressable>
              ) : (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}
            </View>

            {/* Start Time */}
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <Clock color="#4ade80" size={18} />
                <Text className="text-neutral-950 dark:text-white font-semibold">Hora de inicio</Text>
              </View>
              {Platform.OS === 'web' ? (
                <TextInput
                  value={`${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`}
                  onChangeText={(val) => {
                    const [h, m] = val.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(m)) {
                      const t = new Date(startTime);
                      t.setHours(h, m, 0, 0);
                      setStartTime(t);
                    }
                  }}
                  // @ts-ignore — web-only HTML prop
                  type="time"
                  style={{ color: isDark ? '#fff' : '#0a0a0a', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 }}
                />
              ) : Platform.OS === 'android' && !showStartPicker ? (
                <Pressable
                  onPress={() => setShowStartPicker(true)}
                  className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-3"
                >
                  <Text className="text-neutral-950 dark:text-white text-base">{formatTime(startTime)}</Text>
                </Pressable>
              ) : (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  minuteInterval={30}
                  onChange={handleStartChange}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}
            </View>

            {/* Duration */}
            <View>
              <View className="flex-row items-center gap-2 mb-3">
                <Timer color="#fb923c" size={18} />
                <Text className="text-neutral-950 dark:text-white font-semibold">Duración</Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const selected = durationHours === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setDurationHours(opt.value)}
                      className={`px-4 py-2.5 rounded-xl border ${
                        selected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selected ? 'text-white' : 'text-neutral-950 dark:text-white'
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Computed end time preview */}
            <LiquidView
              intensity={15}
              tint="dark"
              className="p-3 rounded-xl border border-black/5 dark:border-white/10 flex-row items-center justify-between"
            >
              <Text className="text-neutral-500 dark:text-neutral-400 text-sm">Hora de fin estimada</Text>
              <Text className="text-neutral-950 dark:text-white font-semibold">
                {formatTime(endTime)}
              </Text>
            </LiquidView>

            {estimatedCost != null && (
              <LiquidView
                intensity={15}
                tint="dark"
                className="p-3 rounded-xl border border-black/5 dark:border-white/10 flex-row items-center justify-between"
              >
                <Text className="text-neutral-500 dark:text-neutral-400 text-sm">Costo estimado</Text>
                <Text className="text-green-600 dark:text-green-400 font-bold">
                  ${estimatedCost.toLocaleString()}
                </Text>
              </LiquidView>
            )}

            <Pressable
              onPress={() => setStep('people')}
              className="bg-blue-600 rounded-2xl py-4 items-center mt-2"
            >
              <Text className="text-white font-bold text-base">Continuar</Text>
            </Pressable>
          </View>
        )}

        {/* Step: People */}
        {step === 'people' && (
          <View className="gap-6">
            <View className="flex-row items-center gap-2">
              <Users color="#60a5fa" size={18} />
              <Text className="text-neutral-950 dark:text-white font-semibold">Personas esperadas</Text>
            </View>
            <BottomSheetTextInput
              value={people}
              onChangeText={setPeople}
              placeholder="Ej: 10"
              placeholderTextColor={isDark ? '#666' : '#a3a3a3'}
              keyboardType="number-pad"
              style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}
              className="bg-black/10 dark:bg-white/10 rounded-xl px-4 py-4 text-lg"
            />
            <Pressable
              onPress={() => {
                const num = parseInt(people, 10);
                if (!num || num <= 0) {
                  setError('Ingresa un número válido');
                  return;
                }
                setError(null);
                setStep('confirm');
              }}
              className="bg-blue-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-bold text-base">Revisar reserva</Text>
            </Pressable>
            {error && <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>}
          </View>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <View className="gap-4">
            <Text className="text-neutral-950 dark:text-white font-semibold text-base mb-2">Resumen de tu reserva</Text>

            <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-black/5 dark:border-white/10 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">Espacio</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{selectedSpace?.nombre}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">Fecha</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{formatDate2(date)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">Horario</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">Duración</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{formatDuration(durationHours)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-600 dark:text-neutral-400">Personas</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{people}</Text>
              </View>
              {estimatedCost != null && (
                <View className="flex-row justify-between border-t border-black/10 dark:border-white/10 pt-3 mt-1">
                  <Text className="text-neutral-600 dark:text-neutral-400 font-semibold">Costo estimado</Text>
                  <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                    ${estimatedCost.toLocaleString()}
                  </Text>
                </View>
              )}
            </LiquidView>

            {error && <Text className="text-red-600 dark:text-red-400 text-sm text-center">{error}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${submitting ? 'bg-blue-600/50' : 'bg-blue-600'}`}
            >
              {submitting ? (
                <ActivityIndicator color={activityColor} />
              ) : (
                <Text className="text-white font-bold text-base">Confirmar reserva</Text>
              )}
            </Pressable>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

CreateReservationSheet.displayName = 'CreateReservationSheet';
export default CreateReservationSheet;
