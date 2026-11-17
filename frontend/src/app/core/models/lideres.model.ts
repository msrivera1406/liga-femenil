// Jugadoras destacadas calculadas por el backend (consulta.php, filtro 'lideres').
// foto_url llega en null si la jugadora no autorizó su imagen (modo Ghost Player).
interface JugadoraLider {
  jugadora_id: number;
  nombre_deportivo: string;
  dorsal: number | null;
  foto_url: string | null;
  equipo_id: number;
  equipo: string;
  escudo_url: string | null;
}

export interface Goleadora extends JugadoraLider {
  goles: number;
  partidos_equipo: number;
}

export interface PorteraLider extends JugadoraLider {
  vallas_invictas: number;
  goles_recibidos: number;
  partidos_jugados: number;
}

export interface FiguraJornada extends JugadoraLider {
  numero_jornada: number;
  goles: number;
  rival: string;
  marcador: string; // "2-1", desde el punto de vista del equipo de la jugadora
  gano: boolean;
}

export interface LideresTorneo {
  goleadoras: Goleadora[];
  porteras: PorteraLider[];
  figura_jornada: FiguraJornada | null;
}
