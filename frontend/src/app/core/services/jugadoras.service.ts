import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
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
      return of({
        success: true,
        data: { folio_registro: folio },
        message: '¡Registro completado! La Directora del Programa revisará tu perfil para asignarte un equipo afín.'
      }).pipe(delay(350));
    }
    return this.http.post<ApiResponse<{ folio_registro: string }>>(
      `${this.apiUrl}/jugadoras/independientes.php`,
      dto
    );
  }
}
