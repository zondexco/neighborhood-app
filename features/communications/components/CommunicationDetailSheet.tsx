import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { X, Send, MessageCircle, Clock, Eye } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import {
  markCommunicationRead,
  fetchComments,
  createComment,
} from '../api';
import type { Communication, Comment } from '../types';

interface Props {
  communication: Communication | null;
  onRead: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

const CommunicationDetailSheet = forwardRef<BottomSheet, Props>(
  ({ communication, onRead }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const { isDark, bgCard, sheetHandle, iconPrimary, iconMuted, placeholderText, activityColor } =
      useThemeColors();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [sending, setSending] = useState(false);

    // Load comments and mark as read when communication changes
    useEffect(() => {
      if (!communication) return;

      // Mark as read
      if (!communication.leido) {
        markCommunicationRead(communication.id).then(() => onRead()).catch(() => {});
      }

      // Load comments if allowed
      if (communication.permite_comentarios) {
        setLoadingComments(true);
        fetchComments(communication.id)
          .then(setComments)
          .catch(() => {})
          .finally(() => setLoadingComments(false));
      }
    }, [communication]);

    const handleSendComment = useCallback(async () => {
      if (!communication || !newComment.trim()) return;
      setSending(true);
      try {
        const comment = await createComment(communication.id, newComment.trim());
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      } catch {
        // silent
      } finally {
        setSending(false);
      }
    }, [communication, newComment]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    if (!communication) return null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: bgCard }}
        handleIndicatorStyle={{ backgroundColor: sheetHandle }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={60}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pb-3">
            <View className="flex-1 mr-3">
              <Text
                className="text-neutral-950 dark:text-white text-xl font-bold"
                numberOfLines={2}
              >
                {communication.titulo}
              </Text>
            </View>
            <Pressable onPress={() => (ref as any)?.current?.close()} hitSlop={12}>
              <X color={iconPrimary} size={22} />
            </Pressable>
          </View>

          <BottomSheetScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 20, gap: 16 }}
          >
            {/* Meta */}
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Clock color={iconMuted} size={14} />
                <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                  {formatDate(communication.fecha)}
                </Text>
              </View>
              {communication.num_comentarios > 0 && (
                <View className="flex-row items-center gap-1.5">
                  <MessageCircle color={iconMuted} size={14} />
                  <Text className="text-neutral-500 dark:text-neutral-400 text-xs">
                    {communication.num_comentarios} comentario
                    {communication.num_comentarios !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {communication.leido && (
                <View className="flex-row items-center gap-1.5">
                  <Eye color={iconMuted} size={14} />
                  <Text className="text-neutral-500 dark:text-neutral-400 text-xs">Leído</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <Text className="text-neutral-800 dark:text-neutral-200 text-base leading-6">
              {communication.contenido}
            </Text>

            {/* Comments section */}
            {communication.permite_comentarios && (
              <View className="mt-4">
                <Text className="text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Comentarios
                </Text>

                {loadingComments ? (
                  <ActivityIndicator color={activityColor} />
                ) : comments.length === 0 ? (
                  <Text className="text-neutral-400 dark:text-neutral-500 text-sm text-center py-4">
                    Sin comentarios aún. ¡Sé el primero!
                  </Text>
                ) : (
                  <View className="gap-3">
                    {comments.map((comment) => (
                      <View
                        key={comment.id}
                        className="bg-black/5 dark:bg-white/5 rounded-xl p-3"
                      >
                        <View className="flex-row items-center gap-2 mb-1">
                          <View className="w-7 h-7 rounded-full bg-violet-500/20 items-center justify-center">
                            <Text className="text-violet-600 dark:text-violet-400 text-xs font-bold">
                              {getInitials(
                                comment.autor_nombre || '?',
                                comment.autor_apellido || '?',
                              )}
                            </Text>
                          </View>
                          <Text className="text-neutral-950 dark:text-white text-sm font-semibold flex-1">
                            {comment.autor_nombre} {comment.autor_apellido}
                          </Text>
                          <Text className="text-neutral-400 dark:text-neutral-500 text-xs">
                            {formatDateTime(comment.fecha_creacion)}
                          </Text>
                        </View>
                        <Text className="text-neutral-700 dark:text-neutral-300 text-sm pl-9">
                          {comment.contenido}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </BottomSheetScrollView>

          {/* Comment input */}
          {communication.permite_comentarios && (
            <View className="px-5 pb-5 pt-2 flex-row items-end gap-2 border-t border-black/5 dark:border-white/5">
              <TextInput
                className="flex-1 bg-black/5 dark:bg-white/5 rounded-xl px-4 py-3 text-neutral-950 dark:text-white text-base"
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Escribe un comentario..."
                placeholderTextColor={placeholderText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSendComment}
                disabled={sending || !newComment.trim()}
                className="w-11 h-11 rounded-xl bg-violet-600 items-center justify-center"
                style={({ pressed }) => ({
                  opacity: pressed || sending || !newComment.trim() ? 0.5 : 1,
                })}
              >
                {sending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Send color="white" size={18} />
                )}
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  },
);

CommunicationDetailSheet.displayName = 'CommunicationDetailSheet';
export default CommunicationDetailSheet;
