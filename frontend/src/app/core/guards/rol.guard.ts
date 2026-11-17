import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../models';
import { AuthService } from '../services/auth.service';

const PANEL_POR_ROL: Record<RolUsuario, string> = {
  superadmin: '/admin',
  capitana: '/representante'
};

/**
 * Permite entrar a la ruta solo con sesión del rol indicado:
 * - Sin sesión: manda a /login recordando a dónde quería ir (?volver=...).
 * - Con sesión de otro rol: manda a su propio panel.
 * La sesión ya está cargada porque la app la recupera al arrancar (ver app.config.ts).
 * El backend vuelve a validar el rol en cada petición; esto solo protege la navegación.
 */
export const rolGuard = (rol: RolUsuario): CanActivateFn => (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.currentUser();

  if (!usuario) {
    return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
  }
  return usuario.rol === rol ? true : router.createUrlTree([PANEL_POR_ROL[usuario.rol]]);
};
