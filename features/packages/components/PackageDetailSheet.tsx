import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Package, MapPin, Truck, User, Clock, CheckCircle, X, Trash2, Edit3 } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { markDelivered, deletePackage } from '../api';
import type { Package as Pkg } from '../types';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  pkg: Pkg | null;
  role: string | null;
  isAdmin: boolean;
  onUpdated: () => void;
  onEdit: (pkg: Pkg) => void;
}

const PackageDetailSheet = forwardRef<BottomSheet, Props>(
  ({ pkg, role, isAdmin, onUpdated, onEdit }, ref) => {
    const snapPoints = useMemo(() => ['65%'], []);
    const [loading, setLoading] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { iconPrimary, activityColor, bgCard, sheetHandle } = useThemeColors();

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
    }, []);

    const isEmpleadoOrAdmin = isAdmin || role === 'empleado';
    const isPending = !pkg?.delivered_at;
    const canDeliver = isEmpleadoOrAdmin && isPending;
    const canEdit = isEmpleadoOrAdmin;
    const canDelete = isAdmin;

    const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const handleDeliver = useCallback(() => {
      if (!pkg) return;
      Alert.alert('Marcar como entregado', '¿Confirmar entrega del paquete?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await markDelivered(pkg.id);
              close();
              onUpdated();
            } catch {
              Alert.alert('Error', 'No se pudo registrar la entrega');
            } finally {
              setLoading(false);
            }
          },
        },
      ]);
    }, [pkg, onUpdated]);

    const handleDelete = useCallback(() => {
      if (!pkg) return;
      Alert.alert('Eliminar paquete', 'Esta acción no se puede deshacer. ¿Continuar?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deletePackage(pkg.id);
              close();
              onUpdated();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el paquete');
            } finally {
              setLoading(false);
            }
          },
        },
      ]);
    }, [pkg, onUpdated]);

    const handleEdit = useCallback(() => {
      if (!pkg) return;
      close();
      setTimeout(() => onEdit(pkg), 300);
    }, [pkg, onEdit]);

    if (!pkg) return null;

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('es', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

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
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <View className="flex-row items-center gap-2 flex-1 mr-3">
              <View className="w-9 h-9 rounded-full bg-amber-500/20 items-center justify-center">
                <Package color="#f59e0b" size={18} />
              </View>
              <Text className="text-neutral-950 dark:text-white text-lg font-bold flex-1" numberOfLines={1}>
                Paquete recibido
              </Text>
              <View className={`px-2 py-0.5 rounded-full flex-shrink-0 ${isPending ? 'bg-amber-500/20' : 'bg-green-500/20'}`}>
                <Text className={`text-xs font-bold ${isPending ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {isPending ? 'Pendiente' : 'Entregado'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={close}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
            >
              <X color={iconPrimary} size={20} />
            </Pressable>
          </View>

          {/* Details card */}
          <LiquidView
            intensity={15}
            tint="dark"
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 gap-4 mb-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-amber-500/20 items-center justify-center">
                <Truck color="#f59e0b" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Transportadora</Text>
                <Text className="text-neutral-950 dark:text-white font-semibold">{pkg.carrier}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-blue-500/20 items-center justify-center">
                <User color="#60a5fa" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Destinatario</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{pkg.resident}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-purple-500/20 items-center justify-center">
                <MapPin color="#a78bfa" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-500 text-xs">Apartamento</Text>
                <Text className="text-neutral-950 dark:text-white font-medium">{pkg.apartment}</Text>
              </View>
            </View>

            {pkg.notes && (
              <View className="border-t border-black/10 dark:border-white/10 pt-3">
                <Text className="text-neutral-500 text-xs mb-1">Notas</Text>
                <Text className="text-neutral-700 dark:text-neutral-300 text-sm">{pkg.notes}</Text>
              </View>
            )}

            <View className="border-t border-black/10 dark:border-white/10 pt-3 gap-2">
              <View className="flex-row items-center gap-2">
                <Clock color="#9ca3af" size={14} />
                <Text className="text-neutral-500 text-xs">Recibido: {formatDate(pkg.received_at)}</Text>
              </View>
              {pkg.delivered_at && (
                <View className="flex-row items-center gap-2">
                  <CheckCircle color="#4ade80" size={14} />
                  <Text className="text-green-600 dark:text-green-400 text-xs">
                    Entregado: {formatDate(pkg.delivered_at)}
                  </Text>
                </View>
              )}
            </View>
          </LiquidView>

          {/* Actions */}
          {loading ? (
            <ActivityIndicator color={activityColor} style={{ marginTop: 8 }} />
          ) : (
            <View className="gap-3">
              {canDeliver && (
                <Pressable
                  onPress={handleDeliver}
                  className="bg-green-600 rounded-2xl py-3.5 items-center"
                >
                  <Text className="text-white font-bold">Marcar como entregado</Text>
                </Pressable>
              )}
              {canEdit && (
                <Pressable
                  onPress={handleEdit}
                  className="flex-row items-center justify-center gap-2 bg-black/10 dark:bg-white/10 rounded-2xl py-3.5"
                >
                  <Edit3 color={iconPrimary} size={16} />
                  <Text className="text-neutral-950 dark:text-white font-semibold">Editar</Text>
                </Pressable>
              )}
              {canDelete && (
                <Pressable
                  onPress={handleDelete}
                  className="flex-row items-center justify-center gap-2 bg-red-600/15 rounded-2xl py-3.5 border border-red-500/20"
                >
                  <Trash2 color="#ef4444" size={16} />
                  <Text className="text-red-600 dark:text-red-400 font-bold">Eliminar paquete</Text>
                </Pressable>
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

PackageDetailSheet.displayName = 'PackageDetailSheet';
export default PackageDetailSheet;
