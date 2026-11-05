export interface HorarioDia {
  activo: boolean;
  horas: string[]; // Ej: ['07:00 - 08:30', '18:00 - 19:30']
}

export interface DisponibilidadEntrenador {
  lunes?: HorarioDia;
  martes?: HorarioDia;
  miercoles?: HorarioDia;
  jueves?: HorarioDia;
  viernes?: HorarioDia;
  sabado?: HorarioDia;
  domingo?: HorarioDia;
  [dia: string]: HorarioDia | undefined;
}

export interface Entrenador {
  id: number;
  nombre_completo: string;
  disciplinas: string; // Ej: 'Boxeo, Karate, Acondicionamiento funcional'
  zonas_cobertura: string; // Ej: 'Cuauhtémoc, Coyoacán, Benito Juárez'
  bio: string;
  precio_sesion: number;
  telefono_publico: string;
  disponibilidad_json: DisponibilidadEntrenador | null;
  activo: boolean;
  foto_url?: string | null;
}
