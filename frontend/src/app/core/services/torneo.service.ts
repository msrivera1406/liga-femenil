import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PosicionTabla, Jornada, Partido, GuardarActaPartidoDTO, ApiResponse } from '../models';
import { MOCK_POSICIONES, MOCK_JORNADAS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPosiciones(): Observable<PosicionTabla[]> {
    if (environment.useMock) {
      return of(MOCK_POSICIONES).pipe(delay(150));
    }
    return this.http.get<ApiResponse<PosicionTabla[]>>(`${this.apiUrl}/torneo/posiciones.php`)
      .pipe(map(res => res.data));
  }

  getJornadas(torneoId: number = 1): Observable<Jornada[]> {
    if (environment.useMock) {
      return of(MOCK_JORNADAS).pipe(delay(200));
    }
    return this.http.get<ApiResponse<Jornada[]>>(`${this.apiUrl}/torneo/jornadas.php?torneo_id=${torneoId}`)
      .pipe(map(res => res.data));
  }

  getJornadaActual(): Observable<Jornada> {
    if (environment.useMock) {
      // Jornada 5 es la próxima en disputa
      const jornada = MOCK_JORNADAS.find(j => j.numero_jornada === 5) || MOCK_JORNADAS[0];
      return of(jornada).pipe(delay(150));
    }
    return this.http.get<ApiResponse<Jornada>>(`${this.apiUrl}/torneo/jornada-actual.php`)
      .pipe(map(res => res.data));
  }

  getPartidoById(partidoId: number): Observable<Partido | undefined> {
    if (environment.useMock) {
      for (const jornada of MOCK_JORNADAS) {
        const found = jornada.partidos?.find(p => p.id === partidoId);
        if (found) return of(found).pipe(delay(100));
      }
      return of(undefined);
    }
    return this.http.get<ApiResponse<Partido>>(`${this.apiUrl}/torneo/partido.php?id=${partidoId}`)
      .pipe(map(res => res.data));
  }

  guardarActaPartido(dto: GuardarActaPartidoDTO): Observable<ApiResponse<{ guardado: boolean }>> {
    if (environment.useMock) {
      return of({
        success: true,
        data: { guardado: true },
        message: 'Acta arbitral guardada exitosamente en modo simulación.'
      }).pipe(delay(300));
    }
    return this.http.post<ApiResponse<{ guardado: boolean }>>(
      `${this.apiUrl}/admin/partidos/guardar-acta.php`,
      dto
    );
  }

  actualizarCalendarioJornada(jornadaId: number, fecha: string, partidos: Partido[]): Observable<ApiResponse<{ actualizado: boolean }>> {
    if (environment.useMock) {
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
    return this.http.post<ApiResponse<{ actualizado: boolean }>>(
      `${this.apiUrl}/admin/jornadas/actualizar-calendario.php`,
      { jornada_id: jornadaId, fecha_domingo: fecha, partidos }
    );
  }
}

