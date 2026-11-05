export type PosicionJugadora = 'Portera' | 'Defensa' | 'Medio' | 'Delantera';

export interface JugadoraPublica {
  id: number;
  equipo_id: number | null;
  nombre_deportivo: string;
  pronombres: string;
  dorsal: number | null;
  posicion: PosicionJugadora;
  foto_url: string | null;
  autoriza_imagen: boolean; // Si es false, se renderiza avatar con silueta y dorsal (Ghost Player)
  es_independiente: boolean;
  activo: boolean;
  creado_en?: string;
  nombre_equipo?: string;
}

export interface JugadoraCompleta extends JugadoraPublica {
  // Datos privados y sensibles (solo accesibles por la Directora / Superadmin)
  nombre_legal: string;
  telefono_contacto: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  aviso_privacidad_aceptado: boolean;
}

export type Jugadora = JugadoraPublica | JugadoraCompleta;

export interface RegistroJugadoraIndependienteDTO {
  nombre_deportivo: string;
  pronombres?: string;
  posicion: PosicionJugadora;
  nombre_legal: string;
  telefono_contacto: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  autoriza_imagen: boolean;
  aviso_privacidad_aceptado: boolean;
  nivel_experiencia?: string;
  notas_convivencia?: string;
}
