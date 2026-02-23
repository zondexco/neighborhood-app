import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, MapPin, X } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { updateReservation, deleteReservation } from '../api';
import type { Reservation } from '../types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  reservation: Reservation | null;
  role: string | null;
  isAdmin: boolean;
  onUpdated: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/20' },
  confirmada: { label: 'Confirmada', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/20' },
  cancelado:  { label: 'Cancelada',  color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-500/20'    },
};

const ReservationDetailSheet = forwardRef<BottomSheet, Props>(
  ({ reservation, role, isAdmin, onUpdated }, ref) => {
    const snapPoints = useMemo(() => ['55%'], []);
    const { bottom: safeBottom } = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { iconPrimary, activityColor, bgCard, sheetHandle } = useThemeColors();

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
    }, []);

    const isResidente = !isAdmin && role !== 'empleado';
    const canCancel =
      reservation?.estado === 'pendiente' && (isResidente || isAdmin);
    const canConfirm = reservation?.estado === 'pendiente' && isAdmin;
    const canDelete = isAdmin;

    const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

    const handleAction = useCallback(
      async (action: 'confirm' | 'cancel' | 'delete') => {
        if (!reservation) return;

        const messages = {
          confirm: 'Confirmar esta reserva?',
          cancel: 'Cancelar esta reserva?',
          delete: 'Eliminar esta reserva? Esta acción no se puede deshacer.',
        };

        Alert.alert('Confirmar', messages[action], [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí',
            style: action === 'delete' ? 'destructive' : 'default',
            onPress: async () => {
              setLoading(true);
              try {
                if (action === 'delete') {
                  await deleteReservation(reservation.id);
                } else {
                  await updateReservation(reservation.id, {
                    estado: action === 'confirm' ? 'confirmada' : 'cancelado',
                  });
                }
                close();
                onUpdated();
              } catch {
                Alert.alert('Error', 'No se pudo realizar la acción');
              } finally {
                setLoading(false);
              }
            },
          },
        ]);
      },
      [reservation, onUpdated, ref],
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    if (!reservation) return null;

    const status = statusConfig[reservation.estado] ?? statusConfig.pendiente;

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    const formatTime = (iso: string) =>
      new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

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
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(safeBottom, 20) + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-neutral-950 dark:text-white text-lg font-bold">Detalle de Reserva</Text>
              <View className={`px-2 py-0.5 rounded-full ${status.bg}`}>
                <Text className={`text-xs font-bold ${status.color}`}>{status.label}</Text>
              </View>
            </View>
            <Pressable
              onPress={close}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
            >
              <X color={iconPrimary} size={20} />
            </Pressable>
          </View>

          {/* Details */}
          <LiquidView
            intensity={15}
            tint="dark"
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 gap-4 mb-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center">
                <MapPin color="#60a5fa" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Espacio</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">
                  {reservation.espacio_nombre || 'Espacio reservado'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center">
                <Calendar color="#60a5fa" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Fecha</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">
                  {formatDate(reservation.fecha_inicio)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-green-500/20 items-center justify-center">
                <Clock color="#4ade80" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Horario</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">
                  {formatTime(reservation.fecha_inicio)} - {formatTime(reservation.fecha_fin)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-purple-500/20 items-center justify-center">
                <Users color="#a78bfa" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Personas</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">
                  {reservation.personas_esperadas}
                </Text>
              </View>
            </View>

            {reservation.costo_total != null && (
              <View className="border-t border-black/10 dark:border-white/10 pt-3 flex-row justify-between items-center">
                <Text className="text-neutral-600 dark:text-neutral-400">Costo</Text>
                <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                  ${reservation.costo_total.toLocaleString()}
                </Text>
              </View>
            )}
          </LiquidView>

          {/* Actions */}
          {loading ? (
            <ActivityIndicator color={activityColor} className="mt-4" />
          ) : (
            <View className="gap-3">
              {canConfirm && (
                <Pressable
                  onPress={() => handleAction('confirm')}
                  className="bg-green-600 rounded-2xl py-3.5 items-center"
                >
                  <Text className="text-white font-bold">Confirmar reserva</Text>
                </Pressable>
              )}
              {canCancel && (
                <Pressable
                  onPress={() => handleAction('cancel')}
                  className="bg-black/10 dark:bg-white/10 rounded-2xl py-3.5 items-center border border-red-500/30"
                >
                  <Text className="text-red-600 dark:text-red-400 font-bold">Cancelar reserva</Text>
                </Pressable>
              )}
              {canDelete && (
                <Pressable
                  onPress={() => handleAction('delete')}
                  className="bg-red-600/20 rounded-2xl py-3.5 items-center"
                >
                  <Text className="text-red-400 font-bold">Eliminar</Text>
                </Pressable>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

ReservationDetailSheet.displayName = 'ReservationDetailSheet';
export default ReservationDetailSheet;
