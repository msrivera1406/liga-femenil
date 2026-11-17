import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Si el backend responde 401 mientras la app cree que hay sesión, la sesión del
 * servidor ya venció: se limpia la sesión local y se manda al login con un aviso.
 * Al volver a entrar, el login regresa a la pantalla donde se quedó la usuaria.
 */
export const sesionExpiradaInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      const esBackend = req.url.startsWith(environment.backendUrl) && !req.url.endsWith('/auth.php');
      if (err instanceof HttpErrorResponse && err.status === 401 && esBackend && auth.currentUser()) {
        auth.cerrarSesionLocal();
        router.navigate(['/login'], { queryParams: { motivo: 'sesion', volver: router.url } });
      }
      return throwError(() => err);
    })
  );
};
