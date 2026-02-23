import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, Plus, Edit3, Trash2 } from 'lucide-react-native';
import { LiquidView } from '@/components/native/LiquidView';
import { useThemeColors } from '@/hooks/useThemeColors';
import { deleteSpace } from '../api';
import type { Space } from '../types';

interface Props {
  spaces: Space[];
  loading: boolean;
  onRefresh: () => void;
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
}

export default function SpacesManagement({
  spaces,
  loading,
  onRefresh,
  onCreateSpace,
  onEditSpace,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { isDark, iconMuted, activityColor } = useThemeColors();

  const handleDelete = (space: Space) => {
    Alert.alert(
      'Eliminar espacio',
      `Eliminar "${space.nombre}"? Las reservas existentes no se verán afectadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(space.id);
            try {
              await deleteSpace(space.id);
              onRefresh();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el espacio');
            } finally {
              setDeleting(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between mb-3"
      >
        <Text className="text-neutral-950 dark:text-white text-lg font-bold">Gestión de Espacios</Text>
        <View className="flex-row items-center gap-2">
          <View className="bg-blue-500/20 px-2.5 py-0.5 rounded-full">
            <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">{spaces.length}</Text>
          </View>
          {expanded ? (
            <ChevronUp color={iconMuted} size={20} />
          ) : (
            <ChevronDown color={iconMuted} size={20} />
          )}
        </View>
      </Pressable>

      {expanded && (
        <View className="gap-3">
          {/* Add button */}
          <Pressable
            onPress={onCreateSpace}
            className="border border-dashed border-black/20 dark:border-white/20 rounded-2xl py-3 items-center flex-row justify-center gap-2"
          >
            <Plus color="#60a5fa" size={18} />
            <Text className="text-blue-600 dark:text-blue-400 font-semibold">Agregar espacio</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator color={activityColor} className="mt-4" />
          ) : (
            spaces.map((space) => (
              <LiquidView
                key={space.id}
                intensity={15}
                tint={isDark ? 'dark' : 'light'}
                className="p-4 rounded-2xl border border-black/5 dark:border-white/10"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-neutral-950 dark:text-white font-semibold">{space.nombre}</Text>
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          space.estado === 'activo' ? 'bg-green-500/20' : 'bg-neutral-500/20'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            space.estado === 'activo'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {space.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Text>
                      </View>
                    </View>
                    {space.descripcion && (
                      <Text className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{space.descripcion}</Text>
                    )}
                    {space.costo_hora != null && (
                      <Text className="text-blue-600 dark:text-blue-400 text-sm mt-1 font-medium">
                        ${space.costo_hora.toLocaleString()}/hora
                      </Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => onEditSpace(space)}
                      className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center"
                    >
                      <Edit3 color={iconMuted} size={16} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(space)}
                      disabled={deleting === space.id}
                      className="w-9 h-9 rounded-full bg-red-500/10 items-center justify-center"
                    >
                      {deleting === space.id ? (
                        <ActivityIndicator size="small" color="#f87171" />
                      ) : (
                        <Trash2 color="#f87171" size={16} />
                      )}
                    </Pressable>
                  </View>
                </View>
              </LiquidView>
            ))
          )}
        </View>
      )}
    </View>
  );
}
