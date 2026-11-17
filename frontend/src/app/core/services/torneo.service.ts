import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { JornadaApi, LideresApi, PosicionApi, mapJornada, mapLideres, mapPosicion } from './backend.mappers';
import { PosicionTabla, Jornada, Partido, GuardarActaPartidoDTO, ApiResponse, LideresTorneo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private api = inject(BackendApiService);

  getPosiciones(): Observable<PosicionTabla[]> {
    return this.api.consulta<PosicionApi[]>('posiciones')
      .pipe(map(rows => rows.map(mapPosicion)));
  }

  // Goleadoras, porteras y figura de la última jornada (solo partidos finalizados)
  getLideres(): Observable<LideresTorneo> {
    return this.api.consulta<LideresApi>('lideres').pipe(map(mapLideres));
  }

  getJornadas(torneoId: number = 1): Observable<Jornada[]> {
    return this.api.consulta<JornadaApi[]>('jornadas', { torneo_id: torneoId })
      .pipe(map(rows => rows.map(mapJornada)));
  }

  getJornadaActual(): Observable<Jornada> {
    // Jornada actual = la primera con algún partido sin finalizar (o la última si ya terminó el torneo)
    return this.getJornadas().pipe(
      map(jornadas => jornadas.find(j => j.partidos?.some(p => p.estado !== 'finalizado')) ?? jornadas[jornadas.length - 1])
    );
  }

  getPartidoById(partidoId: number): Observable<Partido | undefined> {
    return this.getJornadas().pipe(
      map(jornadas => jornadas.flatMap(j => j.partidos ?? []).find(p => p.id === partidoId))
    );
  }

  guardarActaPartido(dto: GuardarActaPartidoDTO): Observable<ApiResponse<{ guardado: boolean }>> {
    // El backend recalcula el ganador y reemplaza las incidencias del partido
    return this.api.registrar<{ ok: true; ganador_id: number | null }>('guardar_acta', { ...dto }).pipe(
      map(() => ({ success: true, data: { guardado: true }, message: 'Acta arbitral guardada.' }))
    );
  }

  actualizarCalendarioJornada(jornadaId: number, fecha: string, partidos: Partido[]): Observable<ApiResponse<{ actualizado: boolean }>> {
    return this.api.modificar<{ ok: true }>('calendario', {
      jornada_id: jornadaId,
      fecha_domingo: fecha,
      partidos: partidos.map(p => ({
        id: p.id,
        horario: p.horario,
        cancha: p.cancha,
        equipo_local_id: p.equipo_local_id,
        equipo_visitante_id: p.equipo_visitante_id,
        estado: p.estado
      }))
    }).pipe(
      map(() => ({ success: true, data: { actualizado: true }, message: 'Calendario oficial de la jornada actualizado correctamente.' }))
    );
  }
}

