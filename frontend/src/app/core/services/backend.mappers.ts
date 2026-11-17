/**
 * Traducen las filas que devuelve backend/consulta.php a los modelos del frontend.
 * MySQL entrega los TINYINT como 0/1 y los SUM/DECIMAL como texto, por eso se
 * convierten aquí a boolean y number.
 */
import {
  Equipo,
  EstadoPartido,
  IncidenciaPartido,
  Jornada,
  JugadoraPublica,
  Partido,
  PosicionJugadora,
  PosicionTabla,
  TipoIncidencia
} from '../models';

type Num = number | string;
type Bool = number | boolean | string;

const num = (v: Num | null | undefined): number => Number(v ?? 0);
const numOrNull = (v: Num | null | undefined): number | null => (v === null || v === undefined ? null : Number(v));
const bool = (v: Bool | null | undefined): boolean => v === true || Number(v) === 1;

// ---------- Posiciones (vista_posiciones) ----------
export interface PosicionApi {
  pos: Num;
  equipo_id: Num;
  equipo: string;
  escudo_url: string | null;
  PJ: Num; PG: Num; PE: Num; PP: Num; GF: Num; GC: Num; DG: Num; Pts: Num;
}

export function mapPosicion(r: PosicionApi): PosicionTabla {
  return {
    posicion: num(r.pos),
    equipo_id: num(r.equipo_id),
    nombre_equipo: r.equipo,
    escudo_url: r.escudo_url,
    pj: num(r.PJ),
    pg: num(r.PG),
    pe: num(r.PE),
    pp: num(r.PP),
    gf: num(r.GF),
    gc: num(r.GC),
    dg: num(r.DG),
    pts: num(r.Pts)
  };
}

// ---------- Jornadas, partidos e incidencias ----------
export interface IncidenciaApi {
  id: Num;
  partido_id: Num;
  jugadora_id: Num;
  equipo_id: Num;
  tipo: TipoIncidencia;
  minuto: Num;
  nombre_jugadora: string;
  dorsal: Num | null;
  nombre_equipo: string;
}

export interface PartidoApi {
  id: Num;
  jornada_id: Num;
  horario: string;
  cancha: string;
  estado: EstadoPartido;
  goles_local: Num;
  goles_visitante: Num;
  empate_minuto_18: Bool;
  penales_local: Num | null;
  penales_visitante: Num | null;
  ganador_id: Num | null;
  equipo_local_id: Num;
  equipo_local: string;
  escudo_local: string | null;
  equipo_visitante_id: Num;
  equipo_visitante: string;
  escudo_visitante: string | null;
  incidencias?: IncidenciaApi[];
}

export interface JornadaApi {
  jornada_id: Num;
  torneo_id: Num;
  numero_jornada: Num;
  fecha_domingo: string;
  partidos: PartidoApi[];
}

function equipoBasico(id: number, nombre: string, escudo_url: string | null): Equipo {
  return { id, nombre, escudo_url, capitana_id: null, video_url: null };
}

function mapIncidencia(r: IncidenciaApi): IncidenciaPartido {
  return {
    id: num(r.id),
    partido_id: num(r.partido_id),
    jugadora_id: num(r.jugadora_id),
    equipo_id: num(r.equipo_id),
    tipo: r.tipo,
    minuto: num(r.minuto),
    nombre_jugadora: r.nombre_jugadora,
    nombre_equipo: r.nombre_equipo,
    dorsal: numOrNull(r.dorsal)
  };
}

export function mapPartido(r: PartidoApi): Partido {
  const local = equipoBasico(num(r.equipo_local_id), r.equipo_local, r.escudo_local);
  const visitante = equipoBasico(num(r.equipo_visitante_id), r.equipo_visitante, r.escudo_visitante);
  const ganadorId = numOrNull(r.ganador_id);
  return {
    id: num(r.id),
    jornada_id: num(r.jornada_id),
    equipo_local_id: local.id,
    equipo_visitante_id: visitante.id,
    horario: (r.horario || '').slice(0, 5),
    goles_local: num(r.goles_local),
    goles_visitante: num(r.goles_visitante),
    empate_minuto_18: bool(r.empate_minuto_18),
    penales_local: numOrNull(r.penales_local),
    penales_visitante: numOrNull(r.penales_visitante),
    ganador_id: ganadorId,
    estado: r.estado,
    cancha: r.cancha,
    notas_mesa: null, // Las notas de mesa son internas; consulta.php no las expone
    equipo_local: local,
    equipo_visitante: visitante,
    ganador: ganadorId === local.id ? local : ganadorId === visitante.id ? visitante : undefined,
    incidencias: (r.incidencias || []).map(mapIncidencia)
  };
}

export function mapJornada(r: JornadaApi): Jornada {
  return {
    id: num(r.jornada_id),
    torneo_id: num(r.torneo_id),
    numero_jornada: num(r.numero_jornada),
    fecha_domingo: r.fecha_domingo,
    partidos: (r.partidos || []).map(mapPartido)
  };
}

// ---------- Equipos y jugadoras públicas ----------
export interface EquipoApi {
  id: Num;
  capitana_id: Num | null;
  nombre: string;
  escudo_url: string | null;
  video_url: string | null;
  total_jugadoras?: Num;
}

export interface JugadoraPublicaApi {
  id: Num;
  nombre_deportivo: string;
  dorsal: Num | null;
  posicion: PosicionJugadora;
  foto_url: string | null;
  autoriza_imagen: Bool;
}

export interface EquipoDetalleApi extends EquipoApi {
  jugadoras: JugadoraPublicaApi[];
}

export function mapEquipo(r: EquipoApi): Equipo {
  return {
    id: num(r.id),
    capitana_id: numOrNull(r.capitana_id),
    nombre: r.nombre,
    escudo_url: r.escudo_url,
    video_url: r.video_url,
    ...(r.total_jugadoras !== undefined ? { total_jugadoras: num(r.total_jugadoras) } : {})
  };
}

export function mapJugadoraPublica(r: JugadoraPublicaApi, equipo: Pick<Equipo, 'id' | 'nombre'>): JugadoraPublica {
  return {
    id: num(r.id),
    equipo_id: equipo.id,
    nombre_deportivo: r.nombre_deportivo,
    dorsal: numOrNull(r.dorsal),
    posicion: r.posicion,
    foto_url: r.foto_url,
    autoriza_imagen: bool(r.autoriza_imagen),
    es_independiente: false,
    activo: true, // consulta.php solo devuelve jugadoras activas
    nombre_equipo: equipo.nombre
  };
}

export function mapEquipoDetalle(r: EquipoDetalleApi): Equipo {
  const equipo = mapEquipo(r);
  const jugadoras = (r.jugadoras || []).map(j => mapJugadoraPublica(j, equipo));
  return { ...equipo, jugadoras, total_jugadoras: jugadoras.length };
}
