import { Partido } from './partido.model';

export interface Jornada {
  id: number;
  torneo_id: number;
  numero_jornada: number;
  fecha_domingo: string; // Formato YYYY-MM-DD
  partidos?: Partido[];
}
