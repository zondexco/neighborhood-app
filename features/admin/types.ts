export interface AdminUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  estado: string;
  apartamento_id?: string;
  apartamento?: string; // label from backend (e.g. "Torre A · Apt 301")
  created_at: string;
}

export interface CreateUserPayload {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: string;
  estado: string;
  apartamento_id?: string;
}

export interface UpdateUserPayload {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  rol?: string;
  estado?: string;
  apartamento_id?: string | null;
}

export interface AdminApartment {
  id: string;
  numero: string;
  bloque?: string;
  torre?: string;
  piso?: number;
  estado: string;
  propietario_id?: string;
}

export interface CreateApartmentPayload {
  numero: string;
  bloque?: string;
  torre?: string;
  piso?: number;
  estado: string;
}

export interface UpdateApartmentPayload {
  numero?: string;
  bloque?: string;
  torre?: string;
  piso?: number;
  estado?: string;
}

export interface AdminStats {
  total_usuarios: number;
  total_apartamentos: number;
  comunicaciones_mes: number;
  facturas_pendientes: number;
  reservas_activas: number;
}

export interface Condominio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  nit?: string;
  representante_legal?: string;
  logo_url?: string;
  permite_soporte: boolean;
}
