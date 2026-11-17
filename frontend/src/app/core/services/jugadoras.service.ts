import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, delay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JugadoraPublica, RegistroJugadoraIndependienteDTO, ApiResponse } from '../models';
import { MOCK_JUGADORAS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class JugadorasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getJugadoras(): Observable<JugadoraPublica[]> {
    if (environment.useMock) {
      return of(MOCK_JUGADORAS).pipe(delay(150));
    }
    return this.http.get<ApiResponse<JugadoraPublica[]>>(`${this.apiUrl}/jugadoras.php`)
      .pipe(map(res => res.data));
  }

  getJugadorasByEquipo(equipoId: number): Observable<JugadoraPublica[]> {
    if (environment.useMock) {
      return of(MOCK_JUGADORAS.filter(j => j.equipo_id === equipoId)).pipe(delay(100));
    }
    return this.http.get<ApiResponse<JugadoraPublica[]>>(`${this.apiUrl}/jugadoras.php?equipo_id=${equipoId}`)
      .pipe(map(res => res.data));
  }

  getBolsaIndependientes(): Observable<JugadoraPublica[]> {
    if (environment.useMock) {
      return of(MOCK_JUGADORAS.filter(j => j.es_independiente)).pipe(delay(120));
    }
    return this.http.get<ApiResponse<JugadoraPublica[]>>(`${this.apiUrl}/jugadoras/independientes.php`)
      .pipe(map(res => res.data));
  }

  registrarIndependiente(dto: RegistroJugadoraIndependienteDTO): Observable<ApiResponse<{ folio_registro: string }>> {
    if (environment.useMock) {
      const folio = 'IND-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const nuevoId = Math.max(...MOCK_JUGADORAS.map(j => j.id), 0) + 1;
      const nueva: JugadoraPublica = {
        id: nuevoId,
        equipo_id: null,
        nombre_deportivo: dto.nombre_deportivo,
        dorsal: null,
        posicion: dto.posicion,
        foto_url: null,
        autoriza_imagen: dto.autoriza_imagen,
        es_independiente: true,
        activo: true,
        nombre_equipo: 'Bolsa Independiente',
        folio_registro: folio,
        nombre_legal: dto.nombre_legal,
        edad: dto.edad,
        telefono_contacto: dto.telefono_contacto,
        tipo_sangre: dto.tipo_sangre,
        contacto_emergencia_nombre: dto.contacto_emergencia_nombre,
        contacto_emergencia_telefono: dto.contacto_emergencia_telefono,
        contacto_emergencia_parentesco: dto.contacto_emergencia_parentesco,
        alergias_condiciones: dto.alergias_condiciones || '',
        nivel_experiencia: dto.nivel_experiencia
      };
      MOCK_JUGADORAS.push(nueva);
      return of({
        success: true,
        data: { folio_registro: folio },
        message: '¡Registro completado! La Directora del Programa revisará tu perfil para asignarte un equipo afín.'
      }).pipe(delay(350));
    }
    // backend/registrar.php responde { ok, folio_registro } o { ok: false, error }
    return this.http.post<{ ok: boolean; id?: number; folio_registro?: string; error?: string }>(
      `${environment.backendUrl}/registrar.php`,
      { filtro: 'jugadora_independiente', ...dto }
    ).pipe(
      catchError(() => throwError(() => new Error('No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.'))),
      map(res => {
        if (!res.ok || !res.folio_registro) {
          throw new Error(res.error || 'No se pudo completar el registro.');
        }
        return { success: true, data: { folio_registro: res.folio_registro }, message: null };
      })
    );
  }

  crearJugadora(payload: Partial<JugadoraPublica>): Observable<ApiResponse<JugadoraPublica>> {
    if (environment.useMock) {
      const nuevoId = Math.max(...MOCK_JUGADORAS.map(j => j.id), 0) + 1;
      const nueva: JugadoraPublica = {
        id: nuevoId,
        equipo_id: payload.equipo_id ?? null,
        nombre_deportivo: payload.nombre_deportivo || 'Nueva Jugadora',
        dorsal: payload.dorsal ?? null,
        posicion: payload.posicion || 'Medio',
        foto_url: payload.foto_url || null,
        autoriza_imagen: payload.autoriza_imagen ?? true,
        es_independiente: payload.equipo_id === null || payload.equipo_id === undefined,
        activo: true,
        nombre_equipo: payload.nombre_equipo || (payload.equipo_id ? 'Club Oficial' : 'Bolsa Independiente'),
        nombre_legal: payload.nombre_legal || '',
        edad: payload.edad || null,
        telefono_contacto: payload.telefono_contacto || '',
        tipo_sangre: payload.tipo_sangre || 'O+',
        contacto_emergencia_nombre: payload.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: payload.contacto_emergencia_telefono || '',
        contacto_emergencia_parentesco: payload.contacto_emergencia_parentesco || '',
        alergias_condiciones: payload.alergias_condiciones || '',
        nivel_experiencia: payload.nivel_experiencia || 'Intermedio'
      };
      MOCK_JUGADORAS.push(nueva);
      return of({
        success: true,
        data: nueva,
        message: 'Cédula de jugadora registrada exitosamente.'
      }).pipe(delay(200));
    }
    return this.http.post<ApiResponse<JugadoraPublica>>(`${this.apiUrl}/admin/jugadoras/crear.php`, payload);
  }

  actualizarJugadora(id: number, payload: Partial<JugadoraPublica>): Observable<ApiResponse<JugadoraPublica>> {
    if (environment.useMock) {
      const idx = MOCK_JUGADORAS.findIndex(j => j.id === id);
      if (idx !== -1) {
        MOCK_JUGADORAS[idx] = {
          ...MOCK_JUGADORAS[idx],
          ...payload
        };
        return of({
          success: true,
          data: MOCK_JUGADORAS[idx],
          message: 'Cédula deportiva actualizada con éxito.'
        }).pipe(delay(200));
      }
      return of({
        success: false,
        data: {} as JugadoraPublica,
        message: 'Jugadora no encontrada.'
      });
    }
    return this.http.put<ApiResponse<JugadoraPublica>>(`${this.apiUrl}/admin/jugadoras/actualizar.php?id=${id}`, payload);
  }

  asignarEquipo(jugadoraId: number, equipoId: number, dorsal: number, nombreEquipo: string): Observable<ApiResponse<JugadoraPublica>> {
    if (environment.useMock) {
      const idx = MOCK_JUGADORAS.findIndex(j => j.id === jugadoraId);
      if (idx !== -1) {
        MOCK_JUGADORAS[idx] = {
          ...MOCK_JUGADORAS[idx],
          equipo_id: equipoId,
          dorsal: dorsal,
          nombre_equipo: nombreEquipo,
          es_independiente: false
        };
        return of({
          success: true,
          data: MOCK_JUGADORAS[idx],
          message: `Jugadora asignada al club ${nombreEquipo} con dorsal #${dorsal}.`
        }).pipe(delay(200));
      }
      return of({
        success: false,
        data: {} as JugadoraPublica,
        message: 'Jugadora no encontrada.'
      });
    }
    return this.http.post<ApiResponse<JugadoraPublica>>(`${this.apiUrl}/admin/jugadoras/asignar-equipo.php`, {
      jugadora_id: jugadoraId,
      equipo_id: equipoId,
      dorsal
    });
  }

  desvincularEquipo(jugadoraId: number): Observable<ApiResponse<JugadoraPublica>> {
    if (environment.useMock) {
      const idx = MOCK_JUGADORAS.findIndex(j => j.id === jugadoraId);
      if (idx !== -1) {
        MOCK_JUGADORAS[idx] = {
          ...MOCK_JUGADORAS[idx],
          equipo_id: null,
          dorsal: null,
          nombre_equipo: 'Bolsa Independiente',
          es_independiente: true
        };
        return of({
          success: true,
          data: MOCK_JUGADORAS[idx],
          message: 'Jugadora transferida a la Bolsa Independiente.'
        }).pipe(delay(200));
      }
      return of({
        success: false,
        data: {} as JugadoraPublica,
        message: 'Jugadora no encontrada.'
      });
    }
    return this.http.post<ApiResponse<JugadoraPublica>>(`${this.apiUrl}/admin/jugadoras/desvincular.php`, {
      jugadora_id: jugadoraId
    });
  }

  eliminarJugadora(id: number): Observable<ApiResponse<{ eliminada: boolean }>> {
    if (environment.useMock) {
      const idx = MOCK_JUGADORAS.findIndex(j => j.id === id);
      if (idx !== -1) {
        MOCK_JUGADORAS.splice(idx, 1);
      }
      return of({
        success: true,
        data: { eliminada: true },
        message: 'Registro de jugadora dado de baja.'
      }).pipe(delay(200));
    }
    return this.http.delete<ApiResponse<{ eliminada: boolean }>>(`${this.apiUrl}/admin/jugadoras/eliminar.php?id=${id}`);
  }
}
