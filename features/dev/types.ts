export interface DevCondominio {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  nit?: string;
  representante_legal?: string;
  estado: string;
  permite_soporte: boolean;
  fecha_creacion: string;
}

export interface CondominioAdmin {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  estado: string;
}

export interface CreateCondominioPayload {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  nit?: string;
  representante_legal?: string;
}

export interface UpdateCondominioPayload {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  nit?: string;
  representante_legal?: string;
  permite_soporte?: boolean;
  estado?: string;
}
