import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock, Users, MapPin, ChevronLeft, X } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { fetchSpaces, createReservation } from '../api';
import type { Space, CreateReservationPayload } from '../types';

interface Props {
  onCreated: () => void;
}

type Step = 'space' | 'datetime' | 'people' | 'confirm';

const CreateReservationSheet = forwardRef<BottomSheet, Props>(({ onCreated }, ref) => {
  const snapPoints = useMemo(() => ['92%'], []);

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
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(11, 0, 0, 0);
    return d;
  });
  const [people, setPeople] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Picker visibility (Android only)
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [showStartPicker, setShowStartPicker] = useState(Platform.OS === 'ios');
  const [showEndPicker, setShowEndPicker] = useState(Platform.OS === 'ios');

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

  const estimatedHours = useMemo(() => {
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.max(Math.ceil(diffMs / (1000 * 60 * 60)), 0);
  }, [startTime, endTime]);

  const estimatedCost = useMemo(() => {
    if (!selectedSpace?.costo_hora) return null;
    return selectedSpace.costo_hora * estimatedHours;
  }, [selectedSpace, estimatedHours]);

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
    const end = new Date();
    end.setHours(11, 0, 0, 0);
    setEndTime(end);
    setPeople('');
    setError(null);
  }, []);

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

    if (fechaFin <= fechaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return;
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
      resetForm();
      (ref as React.RefObject<BottomSheet>)?.current?.close();
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo crear la reserva');
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

  const handleEndChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (selected) setEndTime(selected);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const formatDate2 = (d: Date) =>
    d.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'short' });

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
      onChange={(index) => {
        if (index === -1) resetForm();
      }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          {step !== 'space' ? (
            <Pressable
              onPress={() => {
                if (step === 'datetime') setStep('space');
                else if (step === 'people') setStep('datetime');
                else if (step === 'confirm') setStep('people');
              }}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              <ChevronLeft color="white" size={20} />
            </Pressable>
          ) : (
            <View className="w-10" />
          )}
          <Text className="text-white text-lg font-bold flex-1 text-center">Nueva Reserva</Text>
          <Pressable
            onPress={() => {
              resetForm();
              (ref as React.RefObject<BottomSheet>)?.current?.close();
            }}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <X color="white" size={20} />
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
                  : 'bg-white/10'
              }`}
            />
          ))}
        </View>

        {/* Step: Select Space */}
        {step === 'space' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center gap-2 mb-4">
              <MapPin color="#60a5fa" size={18} />
              <Text className="text-white font-semibold text-base">Selecciona un espacio</Text>
            </View>
            {loadingSpaces ? (
              <ActivityIndicator color="white" className="mt-8" />
            ) : spaces.length === 0 ? (
              <Text className="text-neutral-400 text-center mt-8">
                No hay espacios disponibles
              </Text>
            ) : (
              <View className="gap-3 pb-8">
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
                        selectedSpace?.id === space.id ? 'border-blue-500/50' : 'border-white/5'
                      }`}
                    >
                      <Text className="text-white font-semibold text-base">{space.nombre}</Text>
                      {space.descripcion && (
                        <Text className="text-neutral-400 text-sm mt-1">{space.descripcion}</Text>
                      )}
                      {space.costo_hora != null && (
                        <Text className="text-blue-400 text-sm mt-2 font-medium">
                          ${space.costo_hora.toLocaleString()}/hora
                        </Text>
                      )}
                    </LiquidView>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Step: Date & Time */}
        {step === 'datetime' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-6 pb-8">
              {/* Date */}
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Calendar color="#60a5fa" size={18} />
                  <Text className="text-white font-semibold">Fecha</Text>
                </View>
                {Platform.OS === 'android' && !showDatePicker && (
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="bg-white/10 rounded-xl px-4 py-3"
                  >
                    <Text className="text-white text-base">{formatDate2(date)}</Text>
                  </Pressable>
                )}
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                    themeVariant="dark"
                  />
                )}
              </View>

              {/* Start Time */}
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Clock color="#4ade80" size={18} />
                  <Text className="text-white font-semibold">Hora de inicio</Text>
                </View>
                {Platform.OS === 'android' && !showStartPicker && (
                  <Pressable
                    onPress={() => setShowStartPicker(true)}
                    className="bg-white/10 rounded-xl px-4 py-3"
                  >
                    <Text className="text-white text-base">{formatTime(startTime)}</Text>
                  </Pressable>
                )}
                {showStartPicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minuteInterval={30}
                    onChange={handleStartChange}
                    themeVariant="dark"
                  />
                )}
              </View>

              {/* End Time */}
              <View>
                <View className="flex-row items-center gap-2 mb-3">
                  <Clock color="#f87171" size={18} />
                  <Text className="text-white font-semibold">Hora de fin</Text>
                </View>
                {Platform.OS === 'android' && !showEndPicker && (
                  <Pressable
                    onPress={() => setShowEndPicker(true)}
                    className="bg-white/10 rounded-xl px-4 py-3"
                  >
                    <Text className="text-white text-base">{formatTime(endTime)}</Text>
                  </Pressable>
                )}
                {showEndPicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minuteInterval={30}
                    onChange={handleEndChange}
                    themeVariant="dark"
                  />
                )}
              </View>

              <Pressable
                onPress={() => setStep('people')}
                className="bg-blue-600 rounded-2xl py-4 items-center mt-2"
              >
                <Text className="text-white font-bold text-base">Continuar</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* Step: People */}
        {step === 'people' && (
          <View className="gap-6">
            <View className="flex-row items-center gap-2">
              <Users color="#60a5fa" size={18} />
              <Text className="text-white font-semibold">Personas esperadas</Text>
            </View>
            <TextInput
              value={people}
              onChangeText={setPeople}
              placeholder="Ej: 10"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              className="bg-white/10 rounded-xl px-4 py-4 text-white text-lg"
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
            {error && <Text className="text-red-400 text-sm text-center">{error}</Text>}
          </View>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <View className="gap-4">
            <Text className="text-white font-semibold text-base mb-2">Resumen de tu reserva</Text>

            <LiquidView intensity={15} tint="dark" className="p-4 rounded-2xl border border-white/5 gap-3">
              <View className="flex-row justify-between">
                <Text className="text-neutral-400">Espacio</Text>
                <Text className="text-white font-medium">{selectedSpace?.nombre}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-400">Fecha</Text>
                <Text className="text-white font-medium">{formatDate2(date)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-400">Horario</Text>
                <Text className="text-white font-medium">
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-400">Duración</Text>
                <Text className="text-white font-medium">{estimatedHours}h</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-neutral-400">Personas</Text>
                <Text className="text-white font-medium">{people}</Text>
              </View>
              {estimatedCost != null && (
                <View className="flex-row justify-between border-t border-white/10 pt-3 mt-1">
                  <Text className="text-neutral-400 font-semibold">Costo estimado</Text>
                  <Text className="text-green-400 font-bold text-lg">
                    ${estimatedCost.toLocaleString()}
                  </Text>
                </View>
              )}
            </LiquidView>

            {error && <Text className="text-red-400 text-sm text-center">{error}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${submitting ? 'bg-blue-600/50' : 'bg-blue-600'}`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Confirmar reserva</Text>
              )}
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

CreateReservationSheet.displayName = 'CreateReservationSheet';
export default CreateReservationSheet;
