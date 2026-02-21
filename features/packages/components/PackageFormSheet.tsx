import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { X, ChevronDown } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { createPackage, updatePackage, fetchApartments } from '../api';
import type { Package, CreatePackagePayload, UpdatePackagePayload } from '../types';
import type { ApartmentOption } from '../api';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Props {
  pkg: Package | null;
  isAdmin: boolean;
  role: string | null;
  onSaved: () => void;
}

const PackageFormSheet = forwardRef<BottomSheet, Props>(
  ({ pkg, isAdmin, role, onSaved }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const { iconPrimary, activityColor, bgCard, sheetHandle, isDark } = useThemeColors();

    const isEditing = pkg !== null;
    const canEditAllFields = isAdmin;

    const [apartments, setApartments] = useState<ApartmentOption[]>([]);
    const [loadingApts, setLoadingApts] = useState(false);
    const [showApartmentPicker, setShowApartmentPicker] = useState(false);

    const [selectedApartment, setSelectedApartment] = useState<ApartmentOption | null>(null);
    const [resident, setResident] = useState('');
    const [carrier, setCarrier] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleSheetChange = useCallback((index: number) => {
      setSheetOpen(index >= 0);
    }, []);

    const inputStyle = {
      color: isDark ? '#fff' : '#0a0a0a',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    };

    const readonlyStyle = {
      ...inputStyle,
      opacity: 0.6,
    };

    const close = () => (ref as React.RefObject<BottomSheet>)?.current?.close();

    useEffect(() => {
      if (pkg) {
        setResident(pkg.resident);
        setCarrier(pkg.carrier);
        setNotes(pkg.notes ?? '');
        setSelectedApartment({ id: pkg.apartment_id, label: pkg.apartment });
      } else {
        setResident('');
        setCarrier('');
        setNotes('');
        setSelectedApartment(null);
      }
      setShowApartmentPicker(false);
    }, [pkg]);

    useEffect(() => {
      if (!isEditing || canEditAllFields) {
        setLoadingApts(true);
        fetchApartments()
          .then(setApartments)
          .catch(() => {})
          .finally(() => setLoadingApts(false));
      }
    }, [isEditing, canEditAllFields]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const handleSave = useCallback(async () => {
      if (!isEditing) {
        if (!selectedApartment) {
          Alert.alert('Campo requerido', 'Selecciona un apartamento');
          return;
        }
        if (!resident.trim()) {
          Alert.alert('Campo requerido', 'Ingresa el nombre del destinatario');
          return;
        }
        if (!carrier.trim()) {
          Alert.alert('Campo requerido', 'Ingresa el nombre de la transportadora');
          return;
        }
      }

      setSaving(true);
      try {
        if (isEditing && pkg) {
          const payload: UpdatePackagePayload = { notes: notes.trim() || undefined };
          if (canEditAllFields) {
            if (resident.trim() !== pkg.resident) payload.resident = resident.trim();
            if (carrier.trim() !== pkg.carrier) payload.carrier = carrier.trim();
            if (selectedApartment && selectedApartment.id !== pkg.apartment_id) {
              payload.apartment_id = selectedApartment.id;
            }
          }
          await updatePackage(pkg.id, payload);
        } else {
          const payload: CreatePackagePayload = {
            apartment_id: selectedApartment!.id,
            resident: resident.trim(),
            carrier: carrier.trim(),
            notes: notes.trim() || undefined,
          };
          await createPackage(payload);
        }
        close();
        onSaved();
      } catch {
        Alert.alert('Error', isEditing ? 'No se pudo actualizar el paquete' : 'No se pudo registrar el paquete');
      } finally {
        setSaving(false);
      }
    }, [isEditing, pkg, selectedApartment, resident, carrier, notes, canEditAllFields, onSaved]);

    const showApartmentField = !isEditing || canEditAllFields;
    const showResidentField = !isEditing || canEditAllFields;
    const showCarrierField = !isEditing || canEditAllFields;

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
              {isEditing ? 'Editar paquete' : 'Registrar paquete'}
            </Text>
            <Pressable
              onPress={close}
              className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
            >
              <X color={iconPrimary} size={20} />
            </Pressable>
          </View>

          <View className="gap-5">
            {/* Apartment selector / readonly */}
            <View>
              <Text className="text-neutral-500 text-xs font-medium mb-1.5 ml-1">Apartamento</Text>
              {showApartmentField ? (
                <>
                  <Pressable
                    onPress={() => setShowApartmentPicker((v) => !v)}
                    style={{
                      ...inputStyle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{ color: selectedApartment ? (isDark ? '#fff' : '#0a0a0a') : '#9ca3af', fontSize: 15 }}>
                      {selectedApartment ? selectedApartment.label : 'Seleccionar apartamento'}
                    </Text>
                    <ChevronDown color={isDark ? '#9ca3af' : '#6b7280'} size={18} />
                  </Pressable>
                  {showApartmentPicker && (
                    <LiquidView
                      intensity={15}
                      tint="dark"
                      className="mt-1 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden"
                      style={{ maxHeight: 220 }}
                    >
                      {loadingApts ? (
                        <ActivityIndicator color={activityColor} style={{ padding: 16 }} />
                      ) : (
                        <ScrollView nestedScrollEnabled>
                          {apartments.map((apt) => (
                            <Pressable
                              key={apt.id}
                              onPress={() => {
                                setSelectedApartment(apt);
                                setShowApartmentPicker(false);
                              }}
                              className={`px-4 py-3 border-b border-black/5 dark:border-white/5 ${selectedApartment?.id === apt.id ? 'bg-amber-500/10' : ''}`}
                            >
                              <Text className={`text-sm ${selectedApartment?.id === apt.id ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-neutral-950 dark:text-white'}`}>
                                {apt.label}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      )}
                    </LiquidView>
                  )}
                </>
              ) : (
                <View style={readonlyStyle}>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: 15 }}>
                    {pkg?.apartment ?? '-'}
                  </Text>
                </View>
              )}
            </View>

            {/* Destinatario */}
            <View>
              <Text className="text-neutral-500 text-xs font-medium mb-1.5 ml-1">Destinatario</Text>
              {showResidentField ? (
                <BottomSheetTextInput
                  value={resident}
                  onChangeText={setResident}
                  placeholder="Nombre del destinatario"
                  placeholderTextColor="#9ca3af"
                  style={inputStyle}
                  returnKeyType="next"
                />
              ) : (
                <View style={readonlyStyle}>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: 15 }}>
                    {pkg?.resident ?? '-'}
                  </Text>
                </View>
              )}
            </View>

            {/* Transportadora */}
            <View>
              <Text className="text-neutral-500 text-xs font-medium mb-1.5 ml-1">Transportadora</Text>
              {showCarrierField ? (
                <BottomSheetTextInput
                  value={carrier}
                  onChangeText={setCarrier}
                  placeholder="Ej: Servientrega, Coordinadora..."
                  placeholderTextColor="#9ca3af"
                  style={inputStyle}
                  returnKeyType="next"
                />
              ) : (
                <View style={readonlyStyle}>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: 15 }}>
                    {pkg?.carrier ?? '-'}
                  </Text>
                </View>
              )}
            </View>

            {/* Notas */}
            <View>
              <Text className="text-neutral-500 text-xs font-medium mb-1.5 ml-1">Notas (opcional)</Text>
              <BottomSheetTextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Instrucciones especiales, descripción..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                style={{ ...inputStyle, minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* Save button */}
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="bg-amber-500 rounded-2xl py-4 items-center mt-2"
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {isEditing ? 'Guardar cambios' : 'Registrar paquete'}
                </Text>
              )}
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

PackageFormSheet.displayName = 'PackageFormSheet';
export default PackageFormSheet;
