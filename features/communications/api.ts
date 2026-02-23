import { api } from '@/lib/api';
import type {
  Communication,
  Comment,
  CreateCommunicationPayload,
  UpdateCommunicationPayload,
  UpdateCondominioPayload,
} from './types';
import type { Condominio } from '@/features/admin/types';

// ── Communications (any authenticated user) ──────────────────────────────────

export async function fetchCommunications(
  page = 1,
  pageSize = 20,
): Promise<{ data: Communication[]; total: number }> {
  const res = await api.get('/communications', { params: { page, pageSize } });
  return res.data;
}

export async function fetchCommunication(id: string): Promise<Communication> {
  const res = await api.get(`/communications/${id}`);
  return res.data;
}

export async function markCommunicationRead(id: string): Promise<void> {
  await api.put(`/communications/${id}/read`);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get('/communications/unread-count');
  return res.data.count;
}

export async function fetchComments(communicationId: string): Promise<Comment[]> {
  const res = await api.get(`/communications/${communicationId}/comments`);
  return res.data.data ?? [];
}

export async function createComment(communicationId: string, contenido: string): Promise<Comment> {
  const res = await api.post(`/communications/${communicationId}/comments`, { contenido });
  return res.data;
}

// ── Admin communications ─────────────────────────────────────────────────────

export async function fetchAdminCommunications(
  page = 1,
  pageSize = 50,
): Promise<{ data: Communication[]; total: number }> {
  const res = await api.get('/admin/communications', { params: { page, pageSize } });
  return res.data;
}

export async function createAdminCommunication(
  payload: CreateCommunicationPayload,
): Promise<Communication> {
  const res = await api.post('/admin/communications', payload);
  return res.data;
}

export async function updateAdminCommunication(
  id: string,
  payload: UpdateCommunicationPayload,
): Promise<Communication> {
  const res = await api.put(`/admin/communications/${id}`, payload);
  return res.data;
}

export async function deleteAdminCommunication(id: string): Promise<void> {
  await api.delete(`/admin/communications/${id}`);
}

// ── Condominio (read for all, write for admin) ──────────────────────────────

export async function fetchCondominioPublic(): Promise<Condominio> {
  const res = await api.get('/condominio');
  return res.data;
}

export async function updateCondominio(payload: UpdateCondominioPayload): Promise<Condominio> {
  const res = await api.put('/admin/condominio', payload);
  return res.data;
}
