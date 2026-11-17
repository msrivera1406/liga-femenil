import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { Usuario } from '../models';
import { BackendApiService } from './backend-api.service';

interface RespuestaSesion {
  ok: true;
  usuario: Usuario | null;
}

/**
 * Sesión real contra backend/auth.php. El servidor guarda la sesión en una cookie
 * HttpOnly; aquí solo se conserva en memoria quién está conectada.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private api = inject(BackendApiService);

  // Estado reactivo del usuario en sesión
  currentUser = signal<Usuario | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isSuperadmin = computed(() => this.currentUser()?.rol === 'superadmin');
  isRepresentante = computed(() => this.currentUser()?.rol === 'capitana');

  /**
   * Recupera la sesión activa al arrancar la app (por ejemplo, tras recargar la página).
   * Nunca falla: si el servidor no responde, la app arranca sin sesión.
   */
  cargarSesion(): Observable<Usuario | null> {
    return this.api.auth<RespuestaSesion>('sesion').pipe(
      map(res => res.usuario),
      catchError(() => of(null)),
      tap(usuario => this.currentUser.set(usuario))
    );
  }

  login(email: string, password: string): Observable<Usuario> {
    return this.api.auth<RespuestaSesion>('login', { email: email.trim(), password }).pipe(
      map(res => {
        if (!res.usuario) {
          throw new Error('No se pudo iniciar sesión. Inténtalo nuevamente.');
        }
        return res.usuario;
      }),
      tap(usuario => this.currentUser.set(usuario))
    );
  }

  /** Olvida la sesión en el navegador sin llamar al servidor (la del servidor ya venció). */
  cerrarSesionLocal(): void {
    this.currentUser.set(null);
  }

  logout(): void {
    this.api.auth<{ ok: true }>('logout').pipe(
      catchError(() => of(null)),
      finalize(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      })
    ).subscribe();
  }
}
