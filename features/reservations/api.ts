import { api } from '@/lib/api';
import type {
  Reservation,
  Space,
  CreateReservationPayload,
  UpdateReservationPayload,
  CreateSpacePayload,
  UpdateSpacePayload,
  PaginatedResponse,
} from './types';

// ── Reservations ──────────────────────────────────────────────

export async function fetchMyReservations(userId: string, page = 1, pageSize = 50) {
  const res = await api.get<PaginatedResponse<Reservation>>(
    `/users/${userId}/reservations`,
    { params: { page, page_size: pageSize } },
  );
  return res.data;
}

export async function fetchAllReservations(page = 1, pageSize = 50) {
  const res = await api.get<PaginatedResponse<Reservation>>(
    '/reservations',
    { params: { page, page_size: pageSize } },
  );
  return res.data;
}

export async function fetchApartmentReservations(apartmentId: string, page = 1, pageSize = 50) {
  const res = await api.get<PaginatedResponse<Reservation>>(
    `/apartments/${apartmentId}/reservations`,
    { params: { page, page_size: pageSize } },
  );
  return res.data;
}

export async function createReservation(payload: CreateReservationPayload) {
  const res = await api.post<Reservation>('/reservations', payload);
  return res.data;
}

export async function updateReservation(id: string, payload: UpdateReservationPayload) {
  const res = await api.put<Reservation>(`/reservations/${id}`, payload);
  return res.data;
}

export async function deleteReservation(id: string) {
  await api.delete(`/reservations/${id}`);
}

// ── Spaces ────────────────────────────────────────────────────

export async function fetchSpaces(page = 1, pageSize = 50) {
  const res = await api.get<PaginatedResponse<Space>>(
    '/spaces',
    { params: { page, page_size: pageSize } },
  );
  return res.data;
}

export async function createSpace(payload: CreateSpacePayload) {
  const res = await api.post<Space>('/spaces', payload);
  return res.data;
}

export async function updateSpace(id: string, payload: UpdateSpacePayload) {
  const res = await api.put<Space>(`/spaces/${id}`, payload);
  return res.data;
}

export async function deleteSpace(id: string) {
  await api.delete(`/spaces/${id}`);
}
