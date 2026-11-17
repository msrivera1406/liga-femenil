import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { EntrenadorApi, mapEntrenador } from './backend.mappers';
import { Entrenador, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EntrenadoresService {
  private api = inject(BackendApiService);

  getEntrenadores(): Observable<Entrenador[]> {
    // consulta.php solo devuelve entrenadores activos (catálogo público)
    return this.api.consulta<EntrenadorApi[]>('entrenadores')
      .pipe(map(rows => rows.map(mapEntrenador)));
  }

  // Catálogo completo para la Directora, incluidos los pausados
  getEntrenadoresAdmin(): Observable<Entrenador[]> {
    return this.api.consulta<EntrenadorApi[]>('entrenadores_admin')
      .pipe(map(rows => rows.map(mapEntrenador)));
  }

    getEntrenadorById(id: number): Observable<Entrenador | undefined> {
    return this.getEntrenadores().pipe(map(lista => lista.find(e => e.id === id)));
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
    return this.api.registrar<{ ok: true; id: number }>('entrenador', { ...payload }).pipe(
      map(res => ({ success: true, data: { ...payload, id: res.id } as Entrenador, message: 'Entrenadora registrada en el catálogo oficial.' }))
    );
  }

  actualizarEntrenador(id: number, payload: Partial<Entrenador>): Observable<ApiResponse<Entrenador>> {
    return this.api.modificar<{ ok: true }>('entrenador', { ...payload, id }).pipe(
      map(() => ({ success: true, data: { ...payload, id } as Entrenador, message: 'Perfil de entrenadora actualizado correctamente.' }))
    );
  }

  eliminarEntrenador(id: number): Observable<ApiResponse<void>> {
    return this.api.modificar<{ ok: true }>('baja_entrenador', { id }).pipe(
      map(() => ({ success: true, data: undefined, message: 'Entrenadora dada de baja del catálogo.' }))
    );
  }

  toggleActivo(id: number, activo: boolean): Observable<ApiResponse<void>> {
    return this.api.modificar<{ ok: true }>('entrenador_estado', { id, activo }).pipe(
      map(() => ({ success: true, data: undefined, message: activo ? 'Entrenadora activada en el catálogo.' : 'Entrenadora pausada en el catálogo.' }))
    );
  }
}
