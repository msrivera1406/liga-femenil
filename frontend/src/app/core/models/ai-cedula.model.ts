export interface JugadoraCedulaExtracted {
  fila: number;
  dorsal?: string | null;
  nombre: string;
  ta: number;
  tr: number;
  goles: number;
  match_roster?: {
    matched: boolean;
    id: number | null;
    nombre_oficial: string | null;
    dorsal_oficial: number | null;
    confidence: number;
    tipo_match: string;
  };
}

export interface EquipoCedulaExtracted {
  nombre: string;
  titulares: JugadoraCedulaExtracted[];
  cambios: JugadoraCedulaExtracted[];
}

export interface MarcadorCedulaExtracted {
  local: number;
  visitante: number;
}

export interface CedulaExtractedData {
  categoria: string;
  fecha: string;
  hora: string;
  arbitro: string;
  asistente: string;
  equipo_local: EquipoCedulaExtracted;
  equipo_visitante: EquipoCedulaExtracted;
  marcador_final: MarcadorCedulaExtracted;
  firma_capitan_local: boolean;
  firma_capitan_visitante: boolean;
  observaciones?: string;
}

export interface CedulaValidationReport {
  is_math_valid: boolean;
  local_goals_match: boolean;
  visitante_goals_match: boolean;
  goles_calculados: {
    local: number;
    visitante: number;
  };
  goles_marcador: {
    local: number;
    visitante: number;
  };
  firmas_completas: boolean;
  warnings: string[];
  total_jugadoras_local: number;
  total_jugadoras_visitante: number;
}

export interface AiCedulaScanResponse {
  success: boolean;
  model_used: string;
  data: CedulaExtractedData;
  validation: CedulaValidationReport;
  error?: string;
}
