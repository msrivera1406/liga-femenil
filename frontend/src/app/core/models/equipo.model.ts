import { JugadoraPublica } from './jugadora.model';

export interface Equipo {
  id: number;
  capitana_id: number | null;
  nombre: string;
  escudo_url: string | null;
  video_url: string | null;
  creado_en?: string;
  jugadoras?: JugadoraPublica[];
  total_jugadoras?: number;
}
