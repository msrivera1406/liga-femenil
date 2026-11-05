import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Equipo, ApiResponse } from '../models';
import { MOCK_EQUIPOS } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEquipos(): Observable<Equipo[]> {
    if (environment.useMock) {
      return of(MOCK_EQUIPOS).pipe(delay(150));
    }
    return this.http.get<ApiResponse<Equipo[]>>(`${this.apiUrl}/equipos.php`)
      .pipe(map(res => res.data));
  }

  getEquipoById(id: number): Observable<Equipo | undefined> {
    if (environment.useMock) {
      const equipo = MOCK_EQUIPOS.find(e => e.id === id);
      return of(equipo).pipe(delay(100));
    }
    return this.http.get<ApiResponse<Equipo>>(`${this.apiUrl}/equipos.php?id=${id}`)
      .pipe(map(res => res.data));
  }
}
