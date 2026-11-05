export type RolUsuario = 'superadmin' | 'capitana';

export interface Usuario {
  id: number;
  email: string;
  rol: RolUsuario;
  nombre_contacto: string;
  creado_en?: string;
}
