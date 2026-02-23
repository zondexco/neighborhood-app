import { api } from '@/lib/api';
import type {
  DevCondominio,
  CondominioAdmin,
  CreateCondominioPayload,
  UpdateCondominioPayload,
  CreateAdminPayload,
  UpdateAdminPayload,
} from './types';

export async function fetchCondominios(): Promise<{ data: DevCondominio[]; total: number }> {
  const res = await api.get('/dev/condominios');
  return res.data;
}

export async function createCondominio(payload: CreateCondominioPayload): Promise<DevCondominio> {
  const res = await api.post('/dev/condominios', payload);
  return res.data;
}

export async function updateCondominio(
  id: string,
  payload: UpdateCondominioPayload,
): Promise<DevCondominio> {
  const res = await api.put(`/dev/condominios/${id}`, payload);
  return res.data;
}

export async function deleteCondominio(id: string): Promise<void> {
  await api.delete(`/dev/condominios/${id}`);
}

export async function fetchCondominioAdmins(
  condominioId: string,
): Promise<{ data: CondominioAdmin[]; total: number }> {
  const res = await api.get(`/dev/condominios/${condominioId}/admins`);
  return res.data;
}

export async function createAdmin(
  condominioId: string,
  payload: CreateAdminPayload,
): Promise<{ user: CondominioAdmin; pin_temporal: string }> {
  const res = await api.post(`/dev/condominios/${condominioId}/admins`, payload);
  return res.data;
}

export async function updateAdmin(
  condominioId: string,
  userId: string,
  payload: UpdateAdminPayload,
): Promise<CondominioAdmin> {
  const res = await api.put(`/dev/condominios/${condominioId}/admins/${userId}`, payload);
  return res.data;
}

export async function deleteAdmin(
  condominioId: string,
  userId: string,
): Promise<void> {
  await api.delete(`/dev/condominios/${condominioId}/admins/${userId}`);
}

export async function impersonate(
  condominioId: string,
): Promise<{
  token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  nombre: string;
  apellido: string;
  condominio_id: string;
  condominio_nombre: string;
  role: string;
  is_admin: boolean;
  apartment_id: string;
  expires_at: string;
}> {
  const res = await api.post('/dev/impersonate', { condominio_id: condominioId });
  return res.data;
}
