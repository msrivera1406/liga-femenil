import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { BackendApiService, BackendRespuestaError } from './backend-api.service';
import { EquipoApi, EquipoDetalleApi, mapEquipo, mapEquipoDetalle } from './backend.mappers';
import { environment } from '../../../environments/environment';
import { Equipo, ApiResponse } from '../models';
import { MOCK_EQUIPOS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private api = inject(BackendApiService);

  getEquipos(): Observable<Equipo[]> {
    if (environment.mocks.equipos) {
      return of(MOCK_EQUIPOS).pipe(delay(150));
    }
    return this.api.consulta<EquipoApi[]>('equipos')
      .pipe(map(rows => rows.map(mapEquipo)));
  }

  getEquipoById(id: number): Observable<Equipo | undefined> {
    if (environment.mocks.equipos) {
      const equipo = MOCK_EQUIPOS.find(e => e.id === id);
      return of(equipo).pipe(delay(100));
    }
    // Incluye el plantel público. Si el equipo no existe se devuelve undefined, como en el mock.
    return this.api.consulta<EquipoDetalleApi>('equipo_detalle', { id }).pipe(
      map(mapEquipoDetalle),
      catchError(err => err instanceof BackendRespuestaError ? of(undefined) : throwError(() => err))
    );
  }

  crearEquipo(payload: Partial<Equipo>): Observable<ApiResponse<Equipo>> {
    if (environment.mocks.admin) {
      const nuevoId = Math.max(...MOCK_EQUIPOS.map(e => e.id), 0) + 1;
      const nuevo: Equipo = {
        id: nuevoId,
        nombre: payload.nombre || 'Nuevo Club',
        escudo_url: payload.escudo_url || null,
        video_url: payload.video_url || null,
        capitana_id: payload.capitana_id || null,
        total_jugadoras: 0
      };
      MOCK_EQUIPOS.push(nuevo);
      return of({
        success: true,
        data: nuevo,
        message: 'Club registrado exitosamente.'
      }).pipe(delay(200));
    }
    return this.http.post<ApiResponse<Equipo>>(`${this.apiUrl}/admin/equipos/crear.php`, payload);
  }

  actualizarEquipo(id: number, payload: Partial<Equipo>): Observable<ApiResponse<Equipo>> {
    if (environment.mocks.admin) {
      const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
      if (idx !== -1) {
        MOCK_EQUIPOS[idx] = {
          ...MOCK_EQUIPOS[idx],
          ...payload
        };
        return of({
          success: true,
          data: MOCK_EQUIPOS[idx],
          message: 'Datos del club actualizados correctamente.'
        }).pipe(delay(200));
      }
      return of({
        success: false,
        data: {} as Equipo,
        message: 'Equipo no encontrado'
      });
    }
    return this.http.put<ApiResponse<Equipo>>(`${this.apiUrl}/admin/equipos/actualizar.php?id=${id}`, payload);
  }

  eliminarEquipo(id: number): Observable<ApiResponse<{ eliminado: boolean }>> {
    if (environment.mocks.admin) {
      const idx = MOCK_EQUIPOS.findIndex(e => e.id === id);
      if (idx !== -1) {
        MOCK_EQUIPOS.splice(idx, 1);
      }
      return of({
        success: true,
        data: { eliminado: true },
        message: 'Club dado de baja exitosamente.'
      }).pipe(delay(200));
    }
    return this.http.delete<ApiResponse<{ eliminado: boolean }>>(`${this.apiUrl}/admin/equipos/eliminar.php?id=${id}`);
  }
}
