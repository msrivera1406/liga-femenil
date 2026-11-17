import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { EquipoDetalleApi, JugadoraPrivadaApi, mapEquipoDetalle, mapJugadoraPrivada } from './backend.mappers';
import { JugadoraPublica, RegistroJugadoraIndependienteDTO, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class JugadorasService {
  private api = inject(BackendApiService);

  getJugadoras(): Observable<JugadoraPublica[]> {
    // Padrón completo con datos privados (solo Directora)
    return this.api.consulta<JugadoraPrivadaApi[]>('jugadoras_admin')
      .pipe(map(rows => rows.map(mapJugadoraPrivada)));
  }

  getJugadorasByEquipo(equipoId: number): Observable<JugadoraPublica[]> {
    // Plantel público (sin datos privados) desde la ficha del equipo
    return this.api.consulta<EquipoDetalleApi>('equipo_detalle', { id: equipoId })
      .pipe(map(r => mapEquipoDetalle(r).jugadoras ?? []));
  }

  getPlantelPrivado(equipoId: number): Observable<JugadoraPublica[]> {
    return this.api.consulta<JugadoraPrivadaApi[]>('plantel_privado', { equipo_id: equipoId })
      .pipe(map(rows => rows.map(mapJugadoraPrivada)));
  }

    getBolsaIndependientes(): Observable<JugadoraPublica[]> {
    return this.getJugadoras().pipe(map(lista => lista.filter(j => j.es_independiente)));
  }

  registrarIndependiente(dto: RegistroJugadoraIndependienteDTO): Observable<ApiResponse<{ folio_registro: string }>> {
    // backend/registrar.php responde { ok: true, id, folio_registro } o { ok: false, error }
    return this.api.registrar<{ ok: true; id: number; folio_registro: string }>('jugadora_independiente', { ...dto })
      .pipe(map(res => ({ success: true, data: { folio_registro: res.folio_registro }, message: null })));
  }

  crearJugadora(payload: Partial<JugadoraPublica>): Observable<ApiResponse<JugadoraPublica>> {
    return this.api.registrar<{ ok: true; id: number }>('jugadora', { ...payload }).pipe(
      map(res => ({
        success: true,
        data: { ...payload, id: res.id, activo: true, es_independiente: payload.equipo_id == null } as JugadoraPublica,
        message: 'Cédula de jugadora registrada exitosamente.'
      }))
    );
  }

  actualizarJugadora(id: number, payload: Partial<JugadoraPublica>): Observable<ApiResponse<JugadoraPublica>> {
    return this.api.modificar<{ ok: true }>('jugadora', { ...payload, id }).pipe(
      map(() => ({ success: true, data: { ...payload, id } as JugadoraPublica, message: 'Cédula deportiva actualizada con éxito.' }))
    );
  }

  asignarEquipo(jugadoraId: number, equipoId: number, dorsal: number, nombreEquipo: string): Observable<ApiResponse<JugadoraPublica>> {
    return this.api.modificar<{ ok: true }>('jugadora', { id: jugadoraId, equipo_id: equipoId, dorsal }).pipe(
      map(() => ({
        success: true,
        data: { id: jugadoraId, equipo_id: equipoId, dorsal, nombre_equipo: nombreEquipo, es_independiente: false } as JugadoraPublica,
        message: `Jugadora asignada al club ${nombreEquipo} con dorsal #${dorsal}.`
      }))
    );
  }

  desvincularEquipo(jugadoraId: number): Observable<ApiResponse<JugadoraPublica>> {
    return this.api.modificar<{ ok: true }>('jugadora', { id: jugadoraId, equipo_id: null }).pipe(
      map(() => ({
        success: true,
        data: { id: jugadoraId, equipo_id: null, dorsal: null, nombre_equipo: 'Bolsa Independiente', es_independiente: true } as JugadoraPublica,
        message: 'Jugadora transferida a la Bolsa Independiente.'
      }))
    );
  }

  eliminarJugadora(id: number): Observable<ApiResponse<{ eliminada: boolean }>> {
    return this.api.modificar<{ ok: true }>('baja_jugadora', { id }).pipe(
      map(() => ({ success: true, data: { eliminada: true }, message: 'Registro de jugadora dado de baja.' }))
    );
  }
}
