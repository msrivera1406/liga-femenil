export type PosicionJugadora = 'Portera' | 'Defensa' | 'Medio' | 'Delantera';
export type NivelExperiencia = 'Iniciación' | 'Intermedio' | 'Avanzado';
export type TipoSangre = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'Desconocido';

export interface JugadoraPublica {
  id: number;
  equipo_id: number | null;
  nombre_deportivo: string;
  dorsal: number | null;
  posicion: PosicionJugadora;
  foto_url: string | null;
  autoriza_imagen: boolean; // Si es false, se renderiza avatar con silueta y dorsal (Ghost Player)
  es_independiente: boolean;
  activo: boolean;
  creado_en?: string;
  nombre_equipo?: string;

  // Datos integrados del formulario público de la web
  folio_registro?: string;
  nombre_legal?: string;
  edad?: number | null;
  telefono_contacto?: string;
  tipo_sangre?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_parentesco?: string;
  alergias_condiciones?: string;
  nivel_experiencia?: string;
}

export interface JugadoraCompleta extends JugadoraPublica {
  // Datos privados y sensibles (solo accesibles por la Directora / Superadmin)
  aviso_privacidad_aceptado: boolean;
}

export type Jugadora = JugadoraPublica | JugadoraCompleta;

// Coincide con lo que valida backend/registrar.php (filtro 'jugadora_independiente').
// tipo_sangre y alergias_condiciones se guardan en la tabla jugadoras_datos_medicos.
export interface RegistroJugadoraIndependienteDTO {
  nombre_deportivo: string;
  posicion: PosicionJugadora;
  nivel_experiencia: NivelExperiencia;
  nombre_legal: string;
  edad: number;
  telefono_contacto: string;
  tipo_sangre: TipoSangre;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_parentesco: string;
  alergias_condiciones?: string;
  autoriza_imagen: boolean;
  aviso_privacidad_aceptado: boolean;
}
