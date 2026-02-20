export interface Package {
  id: string;
  apartment_id: string;
  apartment: string;
  resident: string;
  carrier: string;
  notes: string | null;
  received_at: string;
  delivered_at: string | null;
  condominio_id: string;
  created_at: string;
  updated_at: string;
}

export interface PackagesResponse {
  data: Package[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreatePackagePayload {
  apartment_id: string;
  resident: string;
  carrier: string;
  notes?: string;
}

export interface UpdatePackagePayload {
  notes?: string;
  resident?: string;
  carrier?: string;
  apartment_id?: string;
}

export interface PackageFilters {
  status: 'all' | 'pending' | 'delivered';
  dateFilter: 'all' | 'today' | '7d' | '30d';
  apartmentId: string | null;
  carrier: string | null;
  search: string;
}
