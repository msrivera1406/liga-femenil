import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Usuario } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  // Estado reactivo del usuario en sesión
  currentUser = signal<Usuario | null>(this.getStoredUser());

  isAuthenticated = computed(() => !!this.currentUser());
  isSuperadmin = computed(() => this.currentUser()?.rol === 'superadmin');
  isRepresentante = computed(() => this.currentUser()?.rol === 'capitana');

  /**
   * Autenticación con credenciales demostrativas para Directora (Superadmin) y Representante (Capitana)
   */
  login(identificador: string, contrasena: string): Observable<Usuario> {
    const userClean = (identificador || '').trim().toLowerCase();
    const passClean = (contrasena || '').trim();

    // 1. Perfil Superadmin (Directora de la Liga)
    const isSuperadminMatch = 
      (userClean === 'admin' || userClean === 'admin@ligafemenil.mx' || userClean === 'directora' || userClean === 'directora@ligafemenil.mx') &&
      passClean === 'admin123';

    if (isSuperadminMatch) {
      const adminUser: Usuario = {
        id: 1,
        email: 'admin@ligafemenil.mx',
        rol: 'superadmin',
        nombre_contacto: 'Directora del Torneo',
        creado_en: '2026-01-15'
      };

      return of(adminUser).pipe(
        delay(400),
        tap(user => this.persistUser(user))
      );
    }

    // 2. Perfil Representante de Equipo (Capitana de Club)
    const isRepresentanteMatch =
      (userClean === 'representante' || userClean === 'representante@amazonas.mx' || userClean === 'capitana' || userClean === 'capitana@valquirias.mx') &&
      (passClean === 'equipo123' || passClean === 'representante123');

    if (isRepresentanteMatch) {
      const repUser: Usuario = {
        id: 2,
        email: userClean.includes('valquirias') ? 'capitana@valquirias.mx' : 'representante@amazonas.mx',
        rol: 'capitana',
        nombre_contacto: userClean.includes('valquirias') ? 'Capitana Valquirias FC' : 'Representante Amazonas CDMX',
        equipo_id: userClean.includes('valquirias') ? 2 : 1,
        equipo_nombre: userClean.includes('valquirias') ? 'Valquirias FC' : 'Amazonas CDMX',
        creado_en: '2026-02-01'
      };

      return of(repUser).pipe(
        delay(400),
        tap(user => this.persistUser(user))
      );
    }

    // 3. Fallo de autenticación
    return throwError(() => new Error('Credenciales incorrectas. Verifica tu usuario y contraseña o contacta a la Directora vía WhatsApp.')).pipe(
      delay(400)
    );
  }

  logout(): void {
    try {
      localStorage.removeItem('liga_auth_user');
    } catch (e) {
      // Ignorar si localStorage no está disponible
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private persistUser(user: Usuario): void {
    this.currentUser.set(user);
    try {
      localStorage.setItem('liga_auth_user', JSON.stringify(user));
    } catch (e) {
      // Ignorar
    }
  }

  private getStoredUser(): Usuario | null {
    try {
      const raw = localStorage.getItem('liga_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}
