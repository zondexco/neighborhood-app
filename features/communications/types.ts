export interface Communication {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  autor: string;
  condominio_id: string;
  programado_para?: string | null;
  roles_destino?: string[] | null;
  icono: string;
  permite_comentarios: boolean;
  publicado: boolean;
  leido: boolean;
  num_comentarios: number;
  created_at: string;
}

export interface Comment {
  id: string;
  id_comunicado: string;
  id_usuario: string;
  contenido: string;
  autor_nombre: string;
  autor_apellido: string;
  fecha_creacion: string;
}

export interface CreateCommunicationPayload {
  titulo: string;
  contenido: string;
  programado_para?: string | null;
  roles_destino?: string[];
  icono: string;
  permite_comentarios: boolean;
  publicado?: boolean;
}

export interface UpdateCommunicationPayload {
  titulo?: string;
  contenido?: string;
  programado_para?: string | null;
  roles_destino?: string[];
  icono?: string;
  permite_comentarios?: boolean;
  publicado?: boolean;
}

export interface UpdateCondominioPayload {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  nit?: string;
  representante_legal?: string;
}
