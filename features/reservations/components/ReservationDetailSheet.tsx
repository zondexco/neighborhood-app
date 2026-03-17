import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, MapPin, X, User, FileText } from 'lucide-react-native';
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
    const snapPoints = useMemo(() => ['90%'], []);
    const { bottom: safeBottom } = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'confirm' | 'cancel' | 'delete' | null>(null);
    const { iconPrimary, activityColor, bgCard, sheetHandle } = useThemeColors();

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
      if (index < 0) setPendingAction(null);
    }, []);

    const isResidente = !isAdmin && role !== 'empleado';
    const canCancel =
      reservation?.estado === 'pendiente' && (isResidente || isAdmin);
    const canConfirm = reservation?.estado === 'pendiente' && isAdmin;
    const canDelete = isAdmin;

    const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

    const handleConfirmAction = useCallback(async () => {
      if (!reservation || !pendingAction) return;
      setLoading(true);
      try {
        if (pendingAction === 'delete') {
          await deleteReservation(reservation.id);
        } else {
          await updateReservation(reservation.id, {
            estado: pendingAction === 'confirm' ? 'confirmada' : 'cancelado',
          });
        }
        setPendingAction(null);
        try { (ref as React.RefObject<BottomSheet>)?.current?.close(); } catch { /* ignore on web */ }
        onUpdated();
      } catch {
        setPendingAction(null);
      } finally {
        setLoading(false);
      }
    }, [reservation, pendingAction, onUpdated, ref]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const status = reservation ? (statusConfig[reservation.estado] ?? statusConfig.pendiente) : statusConfig.pendiente;

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
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(safeBottom, 20) + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {reservation && (
            <>
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
                className="p-4 rounded-2xl border border-black/5 dark:border-white/10 gap-4 mb-4"
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

                {isAdmin && reservation.usuario_nombre && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-full bg-orange-500/20 items-center justify-center">
                      <User color="#fb923c" size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 text-xs">Solicitante</Text>
                      <Text className="text-neutral-950 dark:text-white font-medium">
                        {reservation.usuario_nombre}
                      </Text>
                    </View>
                  </View>
                )}

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

                {isAdmin && reservation.fecha_solicitud && (
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-full bg-neutral-500/20 items-center justify-center">
                      <FileText color="#9ca3af" size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neutral-500 text-xs">Solicitada el</Text>
                      <Text className="text-neutral-950 dark:text-white font-medium">
                        {formatDate(reservation.fecha_solicitud)}
                      </Text>
                    </View>
                  </View>
                )}

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
              ) : pendingAction ? (
                <LiquidView
                  intensity={15}
                  tint="dark"
                  className="rounded-2xl border border-black/10 dark:border-white/10 p-4 gap-3"
                >
                  <Text className="text-neutral-950 dark:text-white font-semibold text-center">
                    {pendingAction === 'confirm' && '¿Confirmar esta reserva?'}
                    {pendingAction === 'cancel' && '¿Cancelar esta reserva?'}
                    {pendingAction === 'delete' && '¿Eliminar esta reserva? Esta acción no se puede deshacer.'}
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setPendingAction(null)}
                      className="flex-1 bg-black/10 dark:bg-white/10 rounded-xl py-3 items-center"
                    >
                      <Text className="text-neutral-950 dark:text-white font-semibold">Cancelar</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleConfirmAction}
                      className={`flex-1 rounded-xl py-3 items-center ${
                        pendingAction === 'delete' ? 'bg-red-600' : pendingAction === 'confirm' ? 'bg-green-600' : 'bg-red-500'
                      }`}
                    >
                      <Text className="text-white font-bold">
                        {pendingAction === 'confirm' ? 'Confirmar' : pendingAction === 'cancel' ? 'Cancelar reserva' : 'Eliminar'}
                      </Text>
                    </Pressable>
                  </View>
                </LiquidView>
              ) : (
                <View className="gap-3">
                  {canConfirm && (
                    <Pressable
                      onPress={() => setPendingAction('confirm')}
                      className="bg-green-600 rounded-2xl py-3.5 items-center"
                    >
                      <Text className="text-white font-bold">Confirmar reserva</Text>
                    </Pressable>
                  )}
                  {canCancel && (
                    <Pressable
                      onPress={() => setPendingAction('cancel')}
                      className="bg-black/10 dark:bg-white/10 rounded-2xl py-3.5 items-center border border-red-500/30"
                    >
                      <Text className="text-red-600 dark:text-red-400 font-bold">Cancelar reserva</Text>
                    </Pressable>
                  )}
                  {canDelete && (
                    <Pressable
                      onPress={() => setPendingAction('delete')}
                      className="bg-red-600/20 rounded-2xl py-3.5 items-center"
                    >
                      <Text className="text-red-400 font-bold">Eliminar</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

ReservationDetailSheet.displayName = 'ReservationDetailSheet';
export default ReservationDetailSheet;
