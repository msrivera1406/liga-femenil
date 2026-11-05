export interface PosicionTabla {
  posicion?: number;
  equipo_id: number;
  nombre_equipo: string;
  escudo_url: string | null;
  pj: number; // Partidos Jugados
  pg: number; // Partidos Ganados (tiempo regular o penales)
  pe: number; // Partidos Empatados
  pp: number; // Partidos Perdidos
  gf: number; // Goles a Favor
  gc: number; // Goles en Contra
  dg: number; // Diferencia de Goles (gf - gc)
  pts: number; // 3 pts al ganador, 0 al perdedor
  penales_ganados?: number;
  forma_reciente?: ('G' | 'P')[];
}
