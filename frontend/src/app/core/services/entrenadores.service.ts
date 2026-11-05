import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Entrenador, ApiResponse } from '../models';
import { MOCK_ENTRENADORES } from '../mocks';

@Injectable({
  providedIn: 'root'
})
export class EntrenadoresService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEntrenadores(): Observable<Entrenador[]> {
    if (environment.useMock) {
      return of(MOCK_ENTRENADORES).pipe(delay(150));
    }
    return this.http.get<ApiResponse<Entrenador[]>>(`${this.apiUrl}/entrenadores.php`)
      .pipe(map(res => res.data));
  }

  getEntrenadorById(id: number): Observable<Entrenador | undefined> {
    if (environment.useMock) {
      const entrenador = MOCK_ENTRENADORES.find(e => e.id === id);
      return of(entrenador).pipe(delay(100));
    }
    return this.http.get<ApiResponse<Entrenador>>(`${this.apiUrl}/entrenadores.php?id=${id}`)
      .pipe(map(res => res.data));
  }

  generarEnlaceWhatsApp(entrenador: Entrenador, dia?: string, hora?: string): string {
    const telefonoLimpio = entrenador.telefono_publico.replace(/[^0-9]/g, '');
    let mensaje = `¡Hola ${entrenador.nombre_completo}! Te contacto desde la plataforma de la Liga de Fútbol Mujeres Diversas México. Me interesa agendar una sesión de entrenamiento (${entrenador.disciplinas}).`;
    if (dia && hora) {
      mensaje += ` Me interesó el horario del ${dia} a las ${hora}.`;
    }
    return `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
  }
}
