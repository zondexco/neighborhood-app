import { api } from '@/lib/api';
import type {
  AdminUser,
  AdminApartment,
  AdminStats,
  Condominio,
  CreateUserPayload,
  UpdateUserPayload,
  CreateApartmentPayload,
  UpdateApartmentPayload,
} from './types';

// ── Users ─────────────────────────────────────────────────────────────────────

export async function fetchAdminUsers(): Promise<{ data: AdminUser[]; total: number }> {
  const res = await api.get('/admin/users', { params: { page: 1, pageSize: 500 } });
  return res.data;
}

export async function createAdminUser(
  payload: CreateUserPayload,
): Promise<{ user: AdminUser; pin_temporal: string }> {
  const res = await api.post('/admin/users', payload);
  return res.data;
}

export async function updateAdminUser(id: string, payload: UpdateUserPayload): Promise<AdminUser> {
  const res = await api.put(`/admin/users/${id}`, payload);
  return res.data;
}

export async function deleteAdminUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}

// ── Apartments ────────────────────────────────────────────────────────────────

export async function fetchAdminApartments(): Promise<{ data: AdminApartment[]; total: number }> {
  const res = await api.get('/admin/apartments', { params: { page: 1, pageSize: 500 } });
  return res.data;
}

export async function createAdminApartment(payload: CreateApartmentPayload): Promise<AdminApartment> {
  const res = await api.post('/admin/apartments', payload);
  return res.data;
}

export async function updateAdminApartment(
  id: string,
  payload: UpdateApartmentPayload,
): Promise<AdminApartment> {
  const res = await api.put(`/admin/apartments/${id}`, payload);
  return res.data;
}

export async function deleteAdminApartment(id: string): Promise<void> {
  await api.delete(`/admin/apartments/${id}`);
}

// ── Stats & Condominio ────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function fetchCondominio(): Promise<Condominio> {
  const res = await api.get('/admin/condominio');
  return res.data;
}

export async function updateAdminCondominio(
  payload: Partial<{ nombre: string; direccion: string; ciudad: string; telefono: string; email: string; nit: string; representante_legal: string; permite_soporte: boolean }>,
): Promise<Condominio> {
  const res = await api.put('/admin/condominio', payload);
  return res.data;
}
