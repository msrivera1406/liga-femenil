export type IgContentType = 
  | 'resultados_jornada' 
  | 'partido_destacado' 
  | 'tabla_posiciones' 
  | 'goleadora_jornada' 
  | 'portera_segura';

export type IgFormat = 'feed_4_5' | 'cuadrado_1_1' | 'story_9_16';

export type IgTone = 'emocionante' | 'comunitario' | 'institucional';

export interface IgPartidoResumen {
  equipo_local: string;
  equipo_local_escudo?: string | null;
  goles_local: number;
  goles_visitante: number;
  equipo_visitante: string;
  equipo_visitante_escudo?: string | null;
  cancha?: string;
  horario?: string;
  goleadores?: string;
}

export interface IgPosicionResumen {
  posicion: number;
  equipo: string;
  escudo?: string | null;
  puntos: number;
  partidos_jugados: number;
  diferencia_goles: number;
}

export interface IgJugadoraDestacada {
  nombre: string;
  equipo: string;
  dorsal: number | string;
  logro: string;
  estadistica: string;
  posicion?: string;
  foto_url?: string;
}

export interface IgContentRequest {
  tipo_contenido: IgContentType;
  formato: IgFormat;
  tono: IgTone;
  jornada_numero: number;
  fecha: string;
  datos_partidos?: IgPartidoResumen[];
  tabla_posiciones?: IgPosicionResumen[];
  jugadora_destacada?: IgJugadoraDestacada;
}

export interface IgContentData {
  titular: string;
  subtitulo: string;
  caption: string;
  dato_clave: string;
  llamado_accion: string;
  hashtags: string[];
}

export interface IgContentResponse {
  success: boolean;
  model_used: string;
  data: IgContentData;
  error?: string;
}
