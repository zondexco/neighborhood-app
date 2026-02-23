import { api } from '@/lib/api';
import type { AppNotification, NotificationsListResponse } from './types';

export async function fetchNotifications(page = 1, pageSize = 30): Promise<NotificationsListResponse> {
  const res = await api.get('/notifications', { params: { page, page_size: pageSize } });
  return res.data;
}

export async function fetchNotificationUnreadCount(): Promise<number> {
  const res = await api.get('/notifications/unread-count');
  return res.data.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put('/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
