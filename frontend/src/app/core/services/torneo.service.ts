import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { JornadaApi, PosicionApi, mapJornada, mapPosicion } from './backend.mappers';
import { environment } from '../../../environments/environment';
import { PosicionTabla, Jornada, Partido, GuardarActaPartidoDTO, ApiResponse } from '../models';
import { MOCK_POSICIONES, MOCK_JORNADAS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private api = inject(BackendApiService);

  getPosiciones(): Observable<PosicionTabla[]> {
    if (environment.mocks.torneo) {
      return of(MOCK_POSICIONES).pipe(delay(150));
    }
    return this.api.consulta<PosicionApi[]>('posiciones')
      .pipe(map(rows => rows.map(mapPosicion)));
  }

  getJornadas(torneoId: number = 1): Observable<Jornada[]> {
    if (environment.mocks.torneo) {
      return of(MOCK_JORNADAS).pipe(delay(200));
    }
    return this.api.consulta<JornadaApi[]>('jornadas', { torneo_id: torneoId })
      .pipe(map(rows => rows.map(mapJornada)));
  }

  getJornadaActual(): Observable<Jornada> {
    if (environment.mocks.torneo) {
      // Jornada 5 es la próxima en disputa
      const jornada = MOCK_JORNADAS.find(j => j.numero_jornada === 5) || MOCK_JORNADAS[0];
      return of(jornada).pipe(delay(150));
    }
    // Jornada actual = la primera con algún partido sin finalizar (o la última si ya terminó el torneo)
    return this.getJornadas().pipe(
      map(jornadas => jornadas.find(j => j.partidos?.some(p => p.estado !== 'finalizado')) ?? jornadas[jornadas.length - 1])
    );
  }

  getPartidoById(partidoId: number): Observable<Partido | undefined> {
    if (environment.mocks.torneo) {
      for (const jornada of MOCK_JORNADAS) {
        const found = jornada.partidos?.find(p => p.id === partidoId);
        if (found) return of(found).pipe(delay(100));
      }
      return of(undefined);
    }
    return this.getJornadas().pipe(
      map(jornadas => jornadas.flatMap(j => j.partidos ?? []).find(p => p.id === partidoId))
    );
  }

  guardarActaPartido(dto: GuardarActaPartidoDTO): Observable<ApiResponse<{ guardado: boolean }>> {
    if (environment.mocks.admin) {
      return of({
        success: true,
        data: { guardado: true },
        message: 'Acta arbitral guardada exitosamente en modo simulación.'
      }).pipe(delay(300));
    }
    // El backend recalcula el ganador y reemplaza las incidencias del partido
    return this.api.registrar<{ ok: true; ganador_id: number | null }>('guardar_acta', { ...dto }).pipe(
      map(() => ({ success: true, data: { guardado: true }, message: 'Acta arbitral guardada.' }))
    );
  }

  actualizarCalendarioJornada(jornadaId: number, fecha: string, partidos: Partido[]): Observable<ApiResponse<{ actualizado: boolean }>> {
    if (environment.mocks.admin) {
      const idx = MOCK_JORNADAS.findIndex(j => j.id === jornadaId);
      if (idx !== -1) {
        MOCK_JORNADAS[idx].fecha_domingo = fecha;
        MOCK_JORNADAS[idx].partidos = partidos.map(p => ({ ...p }));
      }
      return of({
        success: true,
        data: { actualizado: true },
        message: 'Calendario oficial de la jornada actualizado correctamente.'
      }).pipe(delay(250));
    }
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

