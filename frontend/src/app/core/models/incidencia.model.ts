export type TipoIncidencia = 'gol' | 'autogol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'falta';

export interface IncidenciaPartido {
  id: number;
  partido_id: number;
  jugadora_id: number;
  equipo_id: number;
  tipo: TipoIncidencia;
  minuto: number;
  nombre_jugadora?: string;
  nombre_equipo?: string;
  dorsal?: number | null;
}

export interface RegistrarIncidenciaDTO {
  jugadora_id: number;
  equipo_id: number;
  tipo: TipoIncidencia;
  minuto: number;
}
