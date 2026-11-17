import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/** El backend respondió, pero rechazó la operación ({ ok: false, error }). */
export class BackendRespuestaError extends Error {
  constructor(message: string, readonly status = 200) {
    super(message);
  }
}

type ArchivoBackend = 'consulta.php' | 'registrar.php' | 'modificar.php' | 'auth.php';

interface RespuestaError {
  ok: false;
  error?: string;
}

function esRespuestaError(res: unknown): res is RespuestaError {
  return !!res && typeof res === 'object' && !Array.isArray(res) && (res as { ok?: unknown }).ok === false;
}

/**
 * Cliente de los PHP del backend. Cada archivo recibe un POST con un campo `filtro`
 * que elige la operación. Las consultas responden los datos tal cual; las escrituras
 * responden { ok: true, ... }. Cualquier { ok: false, error } se convierte en error.
 * Todas las peticiones envían la cookie de sesión (withCredentials).
 */
@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  consulta<T>(filtro: string, params: Record<string, unknown> = {}): Observable<T> {
    return this.enviar<T>('consulta.php', filtro, params);
  }

  registrar<T>(filtro: string, params: Record<string, unknown> = {}): Observable<T> {
    return this.enviar<T>('registrar.php', filtro, params);
  }

  modificar<T>(filtro: string, params: Record<string, unknown> = {}): Observable<T> {
    return this.enviar<T>('modificar.php', filtro, params);
  }

  auth<T>(filtro: string, params: Record<string, unknown> = {}): Observable<T> {
    return this.enviar<T>('auth.php', filtro, params);
  }

  /** Sube una imagen (JPG, PNG o WebP, máx. 3 MB) y devuelve su URL pública. */
  subirImagen(archivo: File, tipo: 'escudo' | 'jugadora'): Observable<string> {
    const datos = new FormData();
    datos.append('tipo', tipo);
    datos.append('imagen', archivo, archivo.name);
    return this.http.post<{ ok: true; url: string } | RespuestaError>(`${this.baseUrl}/subir_imagen.php`, datos, { withCredentials: true }).pipe(
      catchError((err: HttpErrorResponse) => throwError(() =>
        esRespuestaError(err.error)
          ? new BackendRespuestaError(err.error.error || 'No se pudo subir la imagen.', err.status)
          : new Error('No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.'))),
      map(res => {
        if (esRespuestaError(res)) throw new BackendRespuestaError(res.error || 'No se pudo subir la imagen.');
        return res.url;
      })
    );
  }

  private enviar<T>(archivo: ArchivoBackend, filtro: string, params: Record<string, unknown>): Observable<T> {
    return this.http.post<T | RespuestaError>(`${this.baseUrl}/${archivo}`, { filtro, ...params }, { withCredentials: true }).pipe(
      catchError((err: HttpErrorResponse) => {
        // 400/401/403 traen { ok: false, error } con un mensaje para la usuaria
        if (esRespuestaError(err.error)) {
          return throwError(() => new BackendRespuestaError(err.error.error || 'El servidor rechazó la operación.', err.status));
        }
        return throwError(() => new Error('No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.'));
      }),
      map(res => {
        if (esRespuestaError(res)) {
          throw new BackendRespuestaError(res.error || 'El servidor rechazó la operación.');
        }
        return res as T;
      })
    );
  }
}
