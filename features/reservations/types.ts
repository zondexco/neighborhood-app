export interface Space {
  id: string;
  nombre: string;
  descripcion?: string | null;
  costo_hora?: number | null;
  estado: string;
  condominio_id: string;
  created_at: string;
  updated_at?: string | null;
}

export interface Reservation {
  id: string;
  espacio_id: string;
  espacio_nombre?: string;
  usuario_id: string;
  valor_base?: number | null;
  costo_total?: number | null;
  fecha_inicio: string;
  fecha_fin: string;
  personas_esperadas: number;
  estado: 'pendiente' | 'confirmada' | 'cancelado';
  condominio_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationPayload {
  espacio_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  personas_esperadas: number;
}

export interface UpdateReservationPayload {
  fecha_inicio?: string;
  fecha_fin?: string;
  personas_esperadas?: number;
  estado?: string;
}

export interface CreateSpacePayload {
  nombre: string;
  descripcion?: string;
  costo_hora?: number;
  estado?: string;
}

export interface UpdateSpacePayload {
  nombre?: string;
  descripcion?: string;
  costo_hora?: number;
  estado?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  data: T[];
}
