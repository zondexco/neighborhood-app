export interface AppNotification {
  id: string;
  user_id: string;
  condominio_id: string;
  tipo: 'paquete' | 'reserva';
  titulo: string;
  mensaje: string;
  leido: boolean;
  referencia_id?: string | null;
  fecha_creacion: string;
}

export interface NotificationsListResponse {
  data: AppNotification[];
  total: number;
  page: number;
  page_size: number;
  totalPages: number;
}
