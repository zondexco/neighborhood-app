import { api } from '@/lib/api';
import type {
  Package,
  PackagesResponse,
  CreatePackagePayload,
  UpdatePackagePayload,
  PackageFilters,
} from './types';

function buildDateRange(dateFilter: PackageFilters['dateFilter']): { date_from?: string; date_to?: string } {
  if (dateFilter === 'all') return {};
  const now = new Date();
  const date_to = now.toISOString();
  if (dateFilter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { date_from: start.toISOString(), date_to };
  }
  const days = dateFilter === '7d' ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { date_from: start.toISOString(), date_to };
}

export async function fetchPackages(
  filters: Partial<PackageFilters> & { page?: number; page_size?: number }
): Promise<PackagesResponse> {
  const params: Record<string, string> = {
    page: String(filters.page ?? 1),
    page_size: String(filters.page_size ?? 100),
  };

  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.apartmentId) params.apartment_id = filters.apartmentId;
  if (filters.carrier) params.carrier = filters.carrier;
  if (filters.search) params.search = filters.search;

  if (filters.dateFilter && filters.dateFilter !== 'all') {
    const range = buildDateRange(filters.dateFilter);
    if (range.date_from) params.date_from = range.date_from;
    if (range.date_to) params.date_to = range.date_to;
  }

  const res = await api.get<PackagesResponse>('/packages', { params });
  return res.data;
}

export async function fetchPackageById(id: string): Promise<Package> {
  const res = await api.get<Package>(`/packages/${id}`);
  return res.data;
}

export async function createPackage(payload: CreatePackagePayload): Promise<Package> {
  const res = await api.post<Package>('/packages', payload);
  return res.data;
}

export async function updatePackage(id: string, payload: UpdatePackagePayload): Promise<Package> {
  const res = await api.put<Package>(`/packages/${id}`, payload);
  return res.data;
}

export async function markDelivered(id: string): Promise<Package> {
  const res = await api.put<Package>(`/packages/${id}/deliver`);
  return res.data;
}

export async function deletePackage(id: string): Promise<void> {
  await api.delete(`/packages/${id}`);
}

export interface ApartmentOption {
  id: string;
  label: string;
}

export async function fetchApartments(): Promise<ApartmentOption[]> {
  const res = await api.get<{ data: Array<{ id: string; numero: string; torre: string; bloque: string; piso: number }> }>('/apartments', {
    params: { page: 1, page_size: 200 },
  });
  return (res.data.data ?? []).map((a) => {
    const parts: string[] = [];
    if (a.torre) parts.push(`Torre ${a.torre}`);
    if (a.piso) parts.push(`Piso ${a.piso}`);
    if (a.numero) parts.push(`Apt ${a.numero}`);
    return { id: a.id, label: parts.join(' • ') || `Apt ${a.numero}` };
  });
}
