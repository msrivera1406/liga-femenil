import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { sesionExpiradaInterceptor } from './core/interceptors/sesion-expirada.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([sesionExpiradaInterceptor])),
    // Recupera la sesión antes de la primera navegación para que los guards ya la conozcan
    provideAppInitializer(() => firstValueFrom(inject(AuthService).cargarSesion()))
  ]
};
