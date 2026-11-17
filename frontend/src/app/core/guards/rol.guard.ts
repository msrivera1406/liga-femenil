import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../models';
import { AuthService } from '../services/auth.service';

/**
 * Permite entrar a la ruta solo si hay sesión con el rol indicado; si no, manda a /login
 * recordando a dónde quería ir (?volver=...).
 * La sesión ya está cargada porque la app la recupera al arrancar (ver app.config.ts).
 * El backend vuelve a validar el rol en cada petición; esto solo protege la navegación.
 */
export const rolGuard = (rol: RolUsuario): CanActivateFn => (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser()?.rol === rol
    ? true
    : router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
};
