export interface AiVoiceIncidentData {
  tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'sustitucion' | 'falta' | 'desconocido';
  equipo: 'local' | 'visitante';
  equipo_nombre: string;
  equipo_id: number | null;
  minuto: number;
  dorsal: number | null;
  jugadora_id: number | null;
  jugadora: string;
  tipo_gol?: 'jugada' | 'tiro_libre' | 'penal' | 'autogol';
  detalle: string;
  jugadora_entra?: string | null;
  dorsal_entra?: number | null;
  jugadora_sale?: string | null;
  dorsal_sale?: number | null;
  resumen: string;
  confianza: number;
  valido?: boolean;
  mensaje?: string;
}

export interface AiVoiceIncidentResponse {
  success: boolean;
  model_used: string;
  raw_transcript: string;
  data: AiVoiceIncidentData;
  error?: string;
}
