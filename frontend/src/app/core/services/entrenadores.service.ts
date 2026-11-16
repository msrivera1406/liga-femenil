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

  crearEntrenador(payload: Partial<Entrenador>): Observable<ApiResponse<Entrenador>> {
    if (environment.useMock) {
      const nuevoId = Math.max(...MOCK_ENTRENADORES.map(e => e.id), 0) + 1;
      const nuevo: Entrenador = {
        id: nuevoId,
        nombre_completo: payload.nombre_completo || 'Nueva Entrenadora',
        disciplinas: payload.disciplinas || 'Acondicionamiento Funcional',
        zonas_cobertura: payload.zonas_cobertura || 'CDMX',
        bio: payload.bio || '',
        precio_sesion: payload.precio_sesion || 450,
        telefono_publico: payload.telefono_publico || '+52 55 0000 0000',
        disponibilidad_json: payload.disponibilidad_json || null,
        activo: payload.activo ?? true,
        foto_url: payload.foto_url || null
      };
      MOCK_ENTRENADORES.push(nuevo);
      return of({
        success: true,
        data: nuevo,
        message: 'Entrenadora registrada en el catálogo oficial.'
      }).pipe(delay(200));
    }
    return this.http.post<ApiResponse<Entrenador>>(`${this.apiUrl}/admin/entrenadores/crear.php`, payload);
  }

  actualizarEntrenador(id: number, payload: Partial<Entrenador>): Observable<ApiResponse<Entrenador>> {
    if (environment.useMock) {
      const index = MOCK_ENTRENADORES.findIndex(e => e.id === id);
      if (index !== -1) {
        MOCK_ENTRENADORES[index] = { ...MOCK_ENTRENADORES[index], ...payload };
        return of({
          success: true,
          data: MOCK_ENTRENADORES[index],
          message: 'Perfil de entrenadora actualizado correctamente.'
        }).pipe(delay(200));
      }
      return of({
        success: false,
        data: payload as Entrenador,
        message: 'Entrenadora no encontrada.'
      }).pipe(delay(200));
    }
    return this.http.put<ApiResponse<Entrenador>>(`${this.apiUrl}/admin/entrenadores/editar.php?id=${id}`, payload);
  }

  eliminarEntrenador(id: number): Observable<ApiResponse<void>> {
    if (environment.useMock) {
      const index = MOCK_ENTRENADORES.findIndex(e => e.id === id);
      if (index !== -1) {
        MOCK_ENTRENADORES.splice(index, 1);
      }
      return of({
        success: true,
        data: undefined as any,
        message: 'Entrenadora dada de baja del catálogo.'
      }).pipe(delay(200));
    }
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/admin/entrenadores/eliminar.php?id=${id}`);
  }

  toggleActivo(id: number, activo: boolean): Observable<ApiResponse<void>> {
    if (environment.useMock) {
      const entrenador = MOCK_ENTRENADORES.find(e => e.id === id);
      if (entrenador) {
        entrenador.activo = activo;
      }
      return of({
        success: true,
        data: undefined as any,
        message: activo ? 'Entrenadora activada en el catálogo.' : 'Entrenadora pausada en el catálogo.'
      }).pipe(delay(150));
    }
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/admin/entrenadores/estado.php?id=${id}`, { activo });
  }
}
