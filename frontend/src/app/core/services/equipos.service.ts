import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BackendApiService, BackendRespuestaError } from './backend-api.service';
import { EquipoApi, EquipoDetalleApi, mapEquipo, mapEquipoDetalle } from './backend.mappers';
import { Equipo, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private api = inject(BackendApiService);

  getEquipos(): Observable<Equipo[]> {
    return this.api.consulta<EquipoApi[]>('equipos')
      .pipe(map(rows => rows.map(mapEquipo)));
  }

  getEquipoById(id: number): Observable<Equipo | undefined> {
    // Incluye el plantel público. Si el equipo no existe se devuelve undefined, como en el mock.
    return this.api.consulta<EquipoDetalleApi>('equipo_detalle', { id }).pipe(
      map(mapEquipoDetalle),
      catchError(err => err instanceof BackendRespuestaError ? of(undefined) : throwError(() => err))
    );
  }

  crearEquipo(payload: Partial<Equipo>): Observable<ApiResponse<Equipo>> {
    return this.api.registrar<{ ok: true; id: number }>('equipo', { ...payload }).pipe(
      map(res => ({
        success: true,
        data: { capitana_id: null, escudo_url: null, video_url: null, ...payload, id: res.id, total_jugadoras: 0 } as Equipo,
        message: 'Club registrado exitosamente.'
      }))
    );
  }

  actualizarEquipo(id: number, payload: Partial<Equipo>): Observable<ApiResponse<Equipo>> {
    return this.api.modificar<{ ok: true }>('equipo', { ...payload, id }).pipe(
      map(() => ({ success: true, data: { ...payload, id } as Equipo, message: 'Datos del club actualizados correctamente.' }))
    );
  }

  eliminarEquipo(id: number): Observable<ApiResponse<{ eliminado: boolean }>> {
    return this.api.modificar<{ ok: true }>('baja_equipo', { id }).pipe(
      map(() => ({ success: true, data: { eliminado: true }, message: 'Club dado de baja exitosamente.' }))
    );
  }
}
