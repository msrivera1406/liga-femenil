import { Equipo } from './equipo.model';
import { IncidenciaPartido, RegistrarIncidenciaDTO } from './incidencia.model';

export type EstadoPartido = 'programado' | 'en_juego' | 'finalizado' | 'suspendido';

export interface Partido {
  id: number;
  jornada_id: number;
  equipo_local_id: number;
  equipo_visitante_id: number;
  horario: string; // Formato HH:mm:ss o HH:mm
  goles_local: number;
  goles_visitante: number;
  empate_minuto_18: boolean;
  penales_local: number | null;
  penales_visitante: number | null;
  ganador_id: number | null;
  estado: EstadoPartido;
  cancha: string;
  notas_mesa: string | null;

  // Propiedades enriquecidas para UI
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
  ganador?: Equipo;
  incidencias?: IncidenciaPartido[];
}

export interface GuardarActaPartidoDTO {
  partido_id: number;
  goles_local: number;
  goles_visitante: number;
  empate_minuto_18: boolean;
  penales_local?: number | null;
  penales_visitante?: number | null;
  ganador_id?: number | null;
  estado: EstadoPartido;
  notas_mesa?: string | null;
  incidencias: RegistrarIncidenciaDTO[];
}
